<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Models\Supplier;
use App\Services\Notifier;

class StockController extends Controller
{
    // Stok masuk (owner & admin) atau koreksi ke angka tertentu (owner saja)
    public function adjust(Request $request, Product $product)
    {
        $data = $request->validate([
            'mode'        => ['required', 'in:masuk,koreksi'],
            'qty'         => ['required', 'numeric', 'min:0', 'max:999999'],
            'reason'      => ['required', 'string', 'min:3', 'max:200'],
            'supplier_id' => ['nullable', Rule::exists('suppliers', 'id')],
            'unit_cost'   => ['nullable', 'integer', 'min:0', 'max:999999999'],
        ]);

        // Koreksi stok khusus owner
        abort_if($data['mode'] === 'koreksi' && $request->user()->role !== 'owner', 403);

        // Supplier dan harga beli hanya berlaku untuk stok masuk
        $supplierId = $data['mode'] === 'masuk' ? ($data['supplier_id'] ?? null) : null;
        $unitCost = $data['mode'] === 'masuk' ? ($data['unit_cost'] ?? null) : null;

        $delta = DB::transaction(function () use ($product, $data, $request, $supplierId, $unitCost) {
            $locked = Product::whereKey($product->id)->lockForUpdate()->first();
            $qty = round((float) $data['qty'], 3);

            // Satuan selain kilo/liter harus bilangan bulat
            if (! in_array($locked->unit, Product::DECIMAL_UNITS, true) && floor($qty) != $qty) {
                throw ValidationException::withMessages([
                    'qty' => "Jumlah untuk satuan {$locked->unit} harus bilangan bulat.",
                ]);
            }

            if ($data['mode'] === 'masuk') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages(['qty' => 'Jumlah barang masuk harus lebih dari 0.']);
                }

                $delta = $qty;
                $type = 'purchase';
            } else {
                $delta = round($qty - (float) $locked->stock, 3);
                $type = 'adjustment';

                if ($delta == 0.0) {
                    throw ValidationException::withMessages(['qty' => 'Stok sudah sama dengan angka itu.']);
                }
            }

            StockService::move(
                $locked,
                $delta,
                $type,
                $request->user()->id,
                $data['reason'],
                null,
                null,
                $supplierId,
                $unitCost,
            );

            return $delta;
        });

        // Beri tahu pihak lain
        $actor = $request->user();
        $amount = rtrim(rtrim(number_format(abs($delta), 3, ',', ''), '0'), ',');

        if ($data['mode'] === 'masuk') {
            $supplierName = $supplierId ? Supplier::find($supplierId)?->name : null;

            Notifier::toRoles(
                ['owner'],
                'purchase',
                'Stok masuk dicatat',
                "{$actor->username} mencatat stok masuk {$product->name}: {$amount} {$product->unit}"
                    . ($supplierName ? " dari {$supplierName}" : '') . '.',
                '/buku-stok',
                $actor->id,
            );
        } else {
            Notifier::toRoles(
                ['admin'],
                'adjustment',
                'Stok dikoreksi owner',
                "{$product->name}: " . ($delta > 0 ? '+' : '-') . "{$amount} {$product->unit}. Alasan: {$data['reason']}",
                '/buku-stok',
                $actor->id,
            );
        }

        return back();
    }

    // Buku stok: daftar pergerakan stok terbaru
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $type = (string) $request->query('type', '');

        $movements = StockMovement::with(['product:id,name,sku,unit', 'user:id,username', 'supplier:id,name'])
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->when($q !== '', fn ($query) => $query->whereHas(
                'product',
                fn ($p) => $p->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('sku', 'like', "%{$q}%"))
            ))
            ->latest('id')
            ->limit(300)
            ->get();

        return Inertia::render('stok/buku', [
            'movements' => $movements,
            'filters'   => ['q' => $q, 'type' => $type],
        ]);
    }
}