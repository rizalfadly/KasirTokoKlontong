<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('produk/produk', [
            'products'     => Product::orderBy('name')->get(),
            'units'        => Product::UNITS,
            'decimalUnits' => Product::DECIMAL_UNITS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $product = Product::create(Arr::only($data, ['name', 'price', 'stock', 'unit', 'icon']));
        $this->saveImage($product, $data);

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request);

        $product->update(Arr::only($data, ['name', 'price', 'stock', 'unit', 'icon']));
        $this->saveImage($product, $data);

        return back();
    }

    public function destroy(Product $product)
    {
        if ($product->saleItems()->exists()) {
            // Sudah pernah terjual: diarsipkan, riwayat tetap utuh
            $product->delete();
        } else {
            // Belum pernah terjual: hapus permanen
            $product->forceDelete();
        }

        return back();
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

    private function validated(Request $request): array
    {
        $request->merge([
            'unit' => strtolower(trim((string) $request->input('unit'))),
        ]);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:100'],
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
        ]);

        $stock = round((float) $data['stock'], 3);

        // Satuan selain kilo/liter harus bilangan bulat
        if (! in_array($data['unit'], Product::DECIMAL_UNITS, true) && floor($stock) != $stock) {
            throw ValidationException::withMessages([
                'stock' => 'Stok untuk satuan ' . $data['unit'] . ' harus bilangan bulat.',
            ]);
        }

        $data['stock'] = $stock;

        return $data;
    }
}