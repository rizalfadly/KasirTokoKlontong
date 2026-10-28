<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Services\Notifier;

class OpnameController extends Controller
{
    // Daftar semua sesi opname
    public function index()
    {
        $net = StockOpnameItem::selectRaw('stock_opname_id, SUM(difference * price) as net')
            ->groupBy('stock_opname_id')
            ->pluck('net', 'stock_opname_id');

        $opnames = StockOpname::with('creator:id,username')
            ->withCount('items')
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn ($o) => [
                'id'          => $o->id,
                'code'        => $o->code,
                'status'      => $o->status,
                'sku_prefix'  => $o->sku_prefix,
                'note'        => $o->note,
                'creator'     => $o->creator?->username,
                'items_count' => $o->items_count,
                'net'         => (int) round($net[$o->id] ?? 0),
                'created_at'  => $o->created_at,
            ]);

        return Inertia::render('opname/opname', ['opnames' => $opnames]);
    }

    // Mulai opname baru
    public function store(Request $request)
    {
        $data = $request->validate([
            'sku_prefix' => ['nullable', 'string', 'max:40', 'regex:/^[A-Za-z0-9._-]+$/'],
            'note'       => ['nullable', 'string', 'max:200'],
        ]);

        $prefix = ! empty($data['sku_prefix']) ? strtoupper(trim($data['sku_prefix'])) : null;

        if ($prefix && ! Product::where('sku', 'like', $prefix . '%')->exists()) {
            throw ValidationException::withMessages([
                'sku_prefix' => "Tidak ada produk dengan SKU berawalan {$prefix}.",
            ]);
        }

        $n = StockOpname::whereDate('created_at', today())->count();
        do {
            $n++;
            $code = 'OPN-' . now()->format('ymd') . '-' . str_pad((string) $n, 2, '0', STR_PAD_LEFT);
        } while (StockOpname::where('code', $code)->exists());

        $opname = StockOpname::create([
            'code'       => $code,
            'sku_prefix' => $prefix,
            'note'       => $data['note'] ?? null,
            'status'     => 'draft',
            'created_by' => $request->user()->id,
        ]);

        return redirect("/opname/{$opname->id}");
    }

    // Halaman menghitung / laporan satu opname
    public function show(StockOpname $opname)
    {
        $opname->load(['creator:id,username', 'approver:id,username']);

        $items = $opname->items()->with('product:id,name,sku,barcode,unit')->get()->keyBy('product_id');

        $scope = Product::query()
            ->when($opname->sku_prefix, fn ($q, $prefix) => $q->where('sku', 'like', $prefix . '%'));

        if ($opname->status === 'draft') {
            // Sedang dihitung: tampilkan semua produk dalam cakupan
            $rows = (clone $scope)->orderBy('sku')
                ->get(['id', 'name', 'sku', 'barcode', 'unit', 'stock', 'price'])
                ->map(function ($p) use ($items) {
                    $item = $items->get($p->id);

                    return [
                        'product_id'  => $p->id,
                        'sku'         => $p->sku,
                        'barcode'     => $p->barcode,
                        'name'        => $p->name,
                        'unit'        => $p->unit,
                        'price'       => $item?->price ?? $p->price,
                        'system_qty'  => $item?->system_qty ?? $p->stock,
                        'counted_qty' => $item?->counted_qty,
                        'difference'  => $item?->difference,
                    ];
                })->values();

            $uncounted = 0;
        } else {
            // Sudah dikirim / disetujui: hanya yang dihitung
            $rows = $items->map(fn ($i) => [
                'product_id'  => $i->product_id,
                'sku'         => $i->product?->sku,
                'barcode'     => $i->product?->barcode,
                'name'        => $i->product?->name,
                'unit'        => $i->product?->unit,
                'price'       => $i->price,
                'system_qty'  => $i->system_qty,
                'counted_qty' => $i->counted_qty,
                'difference'  => $i->difference,
            ])->sortBy('sku')->values();

            $uncounted = max((clone $scope)->count() - $items->count(), 0);
        }

        return Inertia::render('opname/detail', [
            'opname' => [
                'id'           => $opname->id,
                'code'         => $opname->code,
                'status'       => $opname->status,
                'sku_prefix'   => $opname->sku_prefix,
                'note'         => $opname->note,
                'review_note'  => $opname->review_note,
                'creator'      => $opname->creator?->username,
                'approver'     => $opname->approver?->username,
                'created_at'   => $opname->created_at,
                'submitted_at' => $opname->submitted_at,
                'approved_at'  => $opname->approved_at,
            ],
            'rows'         => $rows,
            'uncounted'    => $uncounted,
            'decimalUnits' => Product::DECIMAL_UNITS,
        ]);
    }

    // Simpan hasil hitung satu produk (dikosongkan = hapus hitungan)
    public function count(Request $request, StockOpname $opname)
    {
        $data = $request->validate([
            'product_id'  => ['required', 'integer'],
            'counted_qty' => ['nullable', 'numeric', 'min:0', 'max:999999'],
        ]);

        if ($opname->status !== 'draft') {
            throw ValidationException::withMessages([
                'counted_qty' => 'Opname ini sudah dikirim, hitungan tidak bisa diubah.',
            ]);
        }

        $product = Product::whereKey($data['product_id'])
            ->when($opname->sku_prefix, fn ($q, $prefix) => $q->where('sku', 'like', $prefix . '%'))
            ->first();

        if (! $product) {
            throw ValidationException::withMessages([
                'counted_qty' => 'Produk tidak ada dalam cakupan opname ini.',
            ]);
        }

        if (! isset($data['counted_qty'])) {
            StockOpnameItem::where('stock_opname_id', $opname->id)
                ->where('product_id', $product->id)
                ->delete();

            return back();
        }

        $counted = round((float) $data['counted_qty'], 3);

        // Satuan selain kilo/liter harus bilangan bulat
        if (! in_array($product->unit, Product::DECIMAL_UNITS, true) && floor($counted) != $counted) {
            throw ValidationException::withMessages([
                'counted_qty' => "Jumlah untuk satuan {$product->unit} harus bilangan bulat.",
            ]);
        }

        $system = (float) $product->stock;

        StockOpnameItem::updateOrCreate(
            ['stock_opname_id' => $opname->id, 'product_id' => $product->id],
            [
                'system_qty'  => $system,
                'counted_qty' => $counted,
                'difference'  => round($counted - $system, 3),
                'price'       => $product->price,
            ],
        );

        return back();
    }

    // Admin mengirim hasil hitung ke owner
    public function submit(Request $request, StockOpname $opname)
        {
            if ($opname->status !== 'draft') {
                throw ValidationException::withMessages(['status' => 'Opname ini sudah dikirim.']);
            }

            $count = $opname->items()->count();

            if ($count === 0) {
                throw ValidationException::withMessages(['status' => 'Belum ada produk yang dihitung.']);
            }

            $opname->update(['status' => 'submitted', 'submitted_at' => now(), 'review_note' => null]);

            Notifier::toRoles(
                ['owner'],
                'opname',
                'Opname menunggu persetujuan',
                "{$opname->code} dikirim oleh {$request->user()->username} ({$count} produk dihitung).",
                "/opname/{$opname->id}",
                $request->user()->id,
            );

            return back();
        }

    // Owner menyetujui: selisih masuk ke buku stok
    public function approve(Request $request, StockOpname $opname)
    {
        $data = $request->validate(['review_note' => ['nullable', 'string', 'max:200']]);

        DB::transaction(function () use ($opname, $data, $request) {
            $locked = StockOpname::whereKey($opname->id)->lockForUpdate()->first();

            if ($locked->status !== 'submitted') {
                throw ValidationException::withMessages([
                    'status' => 'Opname ini tidak sedang menunggu persetujuan.',
                ]);
            }

            $items = $locked->items()->get()->filter(fn ($i) => $i->difference != 0.0);

            // Pastikan tidak ada stok yang menjadi minus
            foreach ($items as $item) {
                $product = Product::withTrashed()->lockForUpdate()->find($item->product_id);

                if (round($product->stock + $item->difference, 3) < 0) {
                    throw ValidationException::withMessages([
                        'status' => "Stok {$product->name} akan menjadi minus. Kembalikan opname untuk dihitung ulang.",
                    ]);
                }
            }

            foreach ($items as $item) {
                $product = Product::withTrashed()->find($item->product_id);

                StockService::move(
                    $product,
                    $item->difference,
                    'opname',
                    $request->user()->id,
                    'Opname ' . $locked->code,
                    null,
                    $locked->id,
                );
            }

            $locked->update([
                'status'      => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'review_note' => $data['review_note'] ?? null,
            ]);
        });
        Notifier::toUser(
            $opname->created_by,
            'opname',
            'Opname disetujui',
            "{$opname->code} disetujui oleh {$request->user()->username}. Selisih sudah dicatat di Buku Stok.",
            "/opname/{$opname->id}",
            $request->user()->id,
        );

        return back();
    }

    // Owner mengembalikan ke admin untuk dihitung ulang
    public function reject(Request $request, StockOpname $opname)
    {
        $data = $request->validate(['review_note' => ['required', 'string', 'min:3', 'max:200']]);

        if ($opname->status !== 'submitted') {
            throw ValidationException::withMessages([
                'status' => 'Opname ini tidak sedang menunggu persetujuan.',
            ]);
        }

        $opname->update(['status' => 'draft', 'submitted_at' => null, 'review_note' => $data['review_note']]);

        Notifier::toUser(
            $opname->created_by,
            'opname',
            'Opname dikembalikan',
            "{$opname->code}: {$data['review_note']}",
            "/opname/{$opname->id}",
            $request->user()->id,
        );

        return back();
    }

    // Hapus opname yang masih dihitung
    public function destroy(Request $request, StockOpname $opname)
    {
        abort_unless($opname->status === 'draft', 403);
        abort_unless($request->user()->role === 'owner' || $opname->created_by === $request->user()->id, 403);

        $opname->delete();

        return redirect('/opname');
    }

    // Unduh laporan CSV
    public function export(StockOpname $opname)
    {
        $items = $opname->items()->with('product:id,name,sku,unit')->get()
            ->sortBy(fn ($i) => $i->product?->sku);

        return response()->streamDownload(function () use ($items, $opname) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // agar karakter terbaca benar di Excel

            $row = fn (array $r) => fputcsv($out, $r, ';', '"', '');
            $fmt = fn ($n) => rtrim(rtrim(number_format((float) $n, 3, ',', ''), '0'), ',');

            $row(['Opname', $opname->code, 'Status', $opname->status]);
            $row(['SKU', 'Produk', 'Satuan', 'Stok sistem', 'Hasil hitung', 'Selisih', 'Harga jual', 'Nilai selisih']);

            foreach ($items as $i) {
                $row([
                    $i->product?->sku,
                    $i->product?->name,
                    $i->product?->unit,
                    $fmt($i->system_qty),
                    $fmt($i->counted_qty),
                    $fmt($i->difference),
                    $i->price,
                    (int) round($i->difference * $i->price),
                ]);
            }

            fclose($out);
        }, "opname-{$opname->code}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}