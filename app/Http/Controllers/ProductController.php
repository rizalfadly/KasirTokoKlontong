<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Supplier;
use App\Models\SupplierPrice;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Services\Audit;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $isOwner = $request->user()->role === 'owner';

        $products = Product::orderBy('name')->get();

        if ($isOwner) {
            $products->each->makeVisible('cost_price');
        }

        return Inertia::render('produk/produk', [
            //'products'       => Product::orderBy('name')->get(),
            'products'       => $products,
            'units'          => Product::UNITS,
            'decimalUnits'   => Product::DECIMAL_UNITS,
            'suppliers'      => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name', 'type']),
            // Harga beli dari supplier hanya dikirim ke owner
            'supplierPrices' => $isOwner ? SupplierPrice::get(['supplier_id', 'product_id', 'price']) : [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $only = ['name', 'sku', 'barcode', 'price', 'stock', 'unit', 'icon',
        'wholesale_price', 'wholesale_min_qty', 'limit_qty', 'limit_period', 'limit_orders'];

        // Harga beli hanya boleh diisi owner
        if ($request->user()->role === 'owner') {
            $only[] = 'cost_price';
        }

        $product = Product::create(Arr::only($data, $only));
        StockService::initial($product, $request->user()->id);
        $this->saveImage($product, $data);

        Audit::log(
            'product.create',
            "Produk {$product->name} ditambahkan (Rp " . number_format($product->price, 0, ',', '.') . ", stok awal {$product->stock} {$product->unit})",
            $product,
        );

        return back()->with('success', 'Produk ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product);

        $fields = Arr::only($data, ['name', 'sku', 'barcode', 'price', 'unit', 'icon',
                            'wholesale_price', 'wholesale_min_qty', 'limit_qty', 'limit_period', 'limit_orders']);

        if ($request->user()->role === 'owner') {
            $fields['cost_price'] = $data['cost_price'] ?? null;
        }

        $old = $product->makeVisible('cost_price')->only(array_keys($fields));
        $product->update($fields);

        $changes = Audit::diff($old, $fields, ['name', 'price', 'cost_price', 'wholesale_price', 'wholesale_min_qty', 'limit_qty', 'limit_orders']);
        if ($changes) {
            Audit::log('product.update', "Produk {$product->name} diubah: " . implode(', ', array_keys($changes)), $product, $changes);
        }

        $this->saveImage($product, $data);

        return back()->with('success', 'Produk diperbarui.');
    }

    public function destroy(Product $product)
    {
        $name = $product->name;

        if ($product->saleItems()->exists() || $product->opnameItems()->exists()) {
            // Sudah pernah terjual: diarsipkan, riwayat tetap utuh
            $product->delete();
            $mode = 'diarsipkan (punya riwayat)';
        } else {
            // Belum pernah terjual: hapus permanen
            $product->forceDelete();
            $mode = 'dihapus permanen';
        }

        Audit::log('product.delete', "Produk {$name} {$mode}", $product);

        return back()->with('success', 'Produk dihapus.');
    }

    // Menampilkan foto produk (dipakai oleh <img src="/produk/1/gambar">)
    public function image(Product $product)
    {
        $image = ProductImage::where('product_id', $product->id)->firstOrFail();

        [$meta, $base64] = explode(',', $image->data, 2);
        preg_match('#^data:(image/[a-z+]+);base64$#', $meta, $m);

        return response(base64_decode($base64), 200, [
            'Content-Type'           => $m[1] ?? 'image/jpeg',
            'Cache-Control'          => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function saveImage(Product $product, array $data): void
    {
        if (! empty($data['remove_image'])) {
            ProductImage::where('product_id', $product->id)->delete();
            $product->forceFill(['image_version' => null])->save();

            return;
        }

        if (! empty($data['image'])) {
            ProductImage::updateOrCreate(['product_id' => $product->id], ['data' => $data['image']]);
            $product->forceFill(['image_version' => time()])->save();
        }
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        // Rapikan masukan: unit huruf kecil, SKU huruf besar, kosong -> null
        $sku = strtoupper(trim((string) $request->input('sku')));
        $barcode = trim((string) $request->input('barcode'));

        $request->merge([
            'unit'    => strtolower(trim((string) $request->input('unit'))),
            'sku'     => $sku === '' ? null : $sku,
            'barcode' => $barcode === '' ? null : $barcode,
        ]);

        $data = $request->validate([
            'cost_price' => ['nullable', 'integer', 'min:0', 'max:999999999'],
            'wholesale_price'   => ['nullable', 'integer', 'min:0', 'max:999999999'],
            'wholesale_min_qty' => ['nullable', 'numeric', 'gt:0', 'max:999999'],
            'limit_orders'      => ['nullable', 'integer', 'min:1', 'max:100'],
            'limit_period'      => ['nullable', Rule::in(['harian', 'mingguan'])],
            'limit_qty'         => [
                'nullable', 'numeric', 'gt:0', 'max:999999',
                function ($attribute, $value, $fail) use ($request) {
                    $min = (float) ($request->input('wholesale_min_qty') ?: 10);
                    if ($value !== null && (float) $value < $min) {
                        $fail("Jatah harus sama atau lebih besar dari batas harga grosir ({$min}).");
                    }
                },
            ],
            'name'         => ['required', 'string', 'max:100'],
            'sku'          => [
                'required', 'string', 'max:40', 'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'barcode'      => [
                'nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('products', 'barcode')->ignore($product?->id),
            ],
            'price'        => ['required', 'integer', 'min:0'],
            'stock'        => ['required', 'numeric', 'min:0', 'max:999999'],
            'unit'         => ['required', 'in:' . implode(',', Product::UNITS)],
            'icon'         => ['nullable', 'string', 'max:16'],
            'remove_image' => ['nullable', 'boolean'],
            'image'        => [
                'nullable', 'string', 'max:200000',
                function ($attribute, $value, $fail) {
                    if (! preg_match('#^data:image/(jpeg|png|webp);base64,#', $value)) {
                        $fail('Format foto harus JPG, PNG, atau WebP.');

                        return;
                    }

                    $binary = base64_decode(substr($value, strpos($value, ',') + 1), true);

                    if ($binary === false || @getimagesizefromstring($binary) === false) {
                        $fail('File foto tidak valid.');
                    }
                },
            ],
        ], [
            'sku.unique'     => 'SKU ini sudah dipakai produk lain.',
            'sku.required'   => 'SKU wajib diisi.',
            'barcode.unique' => 'Barcode ini sudah dipakai produk lain.',
            'sku.regex'      => 'SKU hanya boleh huruf, angka, titik, garis bawah, dan strip.',
            'barcode.regex'  => 'Barcode hanya boleh huruf, angka, titik, garis bawah, dan strip.',
        ]);

        $stock = round((float) $data['stock'], 3);

        // Satuan selain kilo/liter harus bilangan bulat
        if (! in_array($data['unit'], Product::DECIMAL_UNITS, true) && floor($stock) != $stock) {
            throw ValidationException::withMessages([
                'stock' => 'Stok untuk satuan ' . $data['unit'] . ' harus bilangan bulat.',
            ]);
        }

        $data['stock'] = $stock;
        $data['wholesale_min_qty'] = $data['wholesale_min_qty'] ?? 10;
        $data['limit_period']      = $data['limit_period'] ?? 'harian';

        return $data;
    }
}