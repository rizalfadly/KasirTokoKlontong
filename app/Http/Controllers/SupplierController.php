<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierCard;
use App\Models\SupplierPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\StockMovement;

class SupplierController extends Controller
{
    private const TYPES = ['supplier', 'distributor', 'peternak'];

    private const TERMS = ['tunai', 'tempo7', 'tempo14', 'tempo30'];

    public function index()
    {
        // Riwayat pembelian (stok masuk yang memilih supplier), terbaru dulu
        $purchases = StockMovement::where('type', 'purchase')
            ->whereNotNull('supplier_id')
            ->with(['product:id,name,sku,unit', 'user:id,username'])
            ->latest('id')
            ->limit(1000)
            ->get()
            ->groupBy('supplier_id');

        // Ringkasan seumur hidup per supplier
        $stats = StockMovement::where('type', 'purchase')
            ->whereNotNull('supplier_id')
            ->selectRaw('supplier_id, COUNT(*) as trips, SUM(qty_change * COALESCE(unit_cost, 0)) as total, MAX(created_at) as last_at')
            ->groupBy('supplier_id')
            ->get()
            ->keyBy('supplier_id');

        $suppliers = Supplier::with('prices.product:id,name,sku,unit')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->each(function ($s) use ($purchases, $stats) {
                $s->setAttribute('purchases', $purchases->get($s->id, collect())->take(30)->values());

                $st = $stats->get($s->id);
                $s->setAttribute('purchase_stats', $st ? [
                    'count'   => (int) $st->trips,
                    'total'   => (int) round($st->total),
                    'last_at' => $st->last_at,
                ] : null);
            });

        return Inertia::render('supplier/supplier', [
            'suppliers' => $suppliers,
            'products'  => Product::orderBy('name')->get(['id', 'name', 'sku', 'unit']),
            'types'     => self::TYPES,
            'terms'     => self::TERMS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $supplier = Supplier::create(Arr::except($data, ['card', 'remove_card']));
        $this->saveCard($supplier, $data);

        return back();
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $this->validated($request);

        $supplier->update(Arr::except($data, ['card', 'remove_card']));
        $this->saveCard($supplier, $data);

        return back();
    }

    public function destroy(Supplier $supplier)
    {
        // Harga dan kartu nama ikut terhapus
        $supplier->delete();

        return back();
    }

    // Menampilkan gambar kartu nama (hanya owner)
    public function card(Supplier $supplier)
    {
        $card = SupplierCard::where('supplier_id', $supplier->id)->firstOrFail();

        [$meta, $base64] = explode(',', $card->data, 2);
        preg_match('#^data:(image/[a-z+]+);base64$#', $meta, $m);

        return response(base64_decode($base64), 200, [
            'Content-Type'           => $m[1] ?? 'image/jpeg',
            'Cache-Control'          => 'private, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    // Simpan atau ubah harga satu produk dari supplier ini
    public function savePrice(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'price'      => ['required', 'integer', 'min:0', 'max:999999999'],
            'note'       => ['nullable', 'string', 'max:100'],
        ]);

        $existing = SupplierPrice::where('supplier_id', $supplier->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->update([
                // Harga sebelumnya hanya dicatat kalau memang berubah
                'previous_price' => $existing->price !== (int) $data['price'] ? $existing->price : $existing->previous_price,
                'price'          => $data['price'],
                'note'           => $data['note'] ?? null,
            ]);
        } else {
            SupplierPrice::create([
                'supplier_id' => $supplier->id,
                'product_id'  => $data['product_id'],
                'price'       => $data['price'],
                'note'        => $data['note'] ?? null,
            ]);
        }

        return back();
    }

    public function removePrice(Supplier $supplier, int $productId)
    {
        SupplierPrice::where('supplier_id', $supplier->id)->where('product_id', $productId)->delete();

        return back();
    }

    private function saveCard(Supplier $supplier, array $data): void
    {
        if (! empty($data['remove_card'])) {
            SupplierCard::where('supplier_id', $supplier->id)->delete();
            $supplier->forceFill(['card_version' => null])->save();

            return;
        }

        if (! empty($data['card'])) {
            SupplierCard::updateOrCreate(['supplier_id' => $supplier->id], ['data' => $data['card']]);
            $supplier->forceFill(['card_version' => time()])->save();
        }
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'type'           => ['required', Rule::in(self::TYPES)],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'whatsapp'       => ['nullable', 'string', 'max:30'],
            'address'        => ['nullable', 'string', 'max:250'],
            'payment_terms'  => ['required', Rule::in(self::TERMS)],
            'bank_account'   => ['nullable', 'string', 'max:150'],
            'lead_time_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'min_order'      => ['nullable', 'string', 'max:100'],
            'notes'          => ['nullable', 'string', 'max:1000'],
            'is_active'      => ['required', 'boolean'],
            'remove_card'    => ['nullable', 'boolean'],
            'card'           => [
                'nullable', 'string', 'max:700000',
                function ($attribute, $value, $fail) {
                    if (! preg_match('#^data:image/(jpeg|png|webp);base64,#', $value)) {
                        $fail('Format kartu nama harus JPG, PNG, atau WebP.');

                        return;
                    }

                    $binary = base64_decode(substr($value, strpos($value, ',') + 1), true);

                    if ($binary === false || @getimagesizefromstring($binary) === false) {
                        $fail('File kartu nama tidak valid.');
                    }
                },
            ],
        ]);
    }
}