<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Services\StockService;
use App\Services\Notifier;
use Carbon\Carbon;
use App\Support\Period;
use App\Models\Customer;
use App\Services\Audit;

class SaleController extends Controller
{
    public function create()
    {
        return Inertia::render('kasir/kasir', [
            'products'     => Product::where('stock', '>', 0)->orderBy('name')->get()->makeHidden('cost_price'),
            'decimalUnits' => Product::DECIMAL_UNITS,
        ]);
    }

    public function store(Request $request)       { return $this->process($request, false); }
    public function storeGrosir(Request $request) { return $this->process($request, true); }

        private function bought(int $customerId, Product $p): float
        {
            $since = $p->limit_period === 'mingguan' ? now()->startOfWeek() : now()->startOfDay();

            return (float) DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->where('sales.customer_id', $customerId)
                ->whereNull('sales.voided_at')
                ->where('sales.created_at', '>=', $since)
                ->where('sale_items.product_id', $p->id)
                ->sum('sale_items.qty');
        }

        // Berapa kali pelanggan membeli produk ini pada periode jatah (batal tidak dihitung)
        private function orderCount(int $customerId, Product $p): int
        {
            $since = $p->limit_period === 'mingguan' ? now()->startOfWeek() : now()->startOfDay();

            return (int) DB::table('sales')
                ->join('sale_items', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sales.customer_id', $customerId)
                ->whereNull('sales.voided_at')
                ->where('sales.created_at', '>=', $since)
                ->where('sale_items.product_id', $p->id)
                ->distinct()
                ->count('sales.id');
        }

        // Bulatkan ke atas ke kelipatan $step (1000 = ribuan, 1 = rupiah)
        private function roundUp(float $amount, int $step = 1000): int
        {
            return (int) (ceil(round($amount / $step, 6)) * $step);
        }

        private function process(Request $request, bool $grosir)
        {
            $channels = array_keys(Sale::CHANNELS);
            if (! $grosir) {
                $channels = array_values(array_diff($channels, ['grosir']));
            }

            // Bulatkan ke atas ke kelipatan $step (1000 = ribuan, 1 = rupiah)

            $data = $request->validate([
                'items'              => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', Rule::exists('products', 'id')->whereNull('deleted_at')],
                'items.*.qty'        => ['required', 'numeric', 'gt:0'],
                'channel'            => $grosir ? ['nullable'] : ['required', Rule::in($channels)],
                'payment_method'     => ['nullable', Rule::in(['tunai', 'qris', 'transfer'])],
                'paid'               => ['nullable', 'integer', 'min:0'],
                'customer_id'        => $grosir
                    ? ['required', Rule::exists('customers', 'id')->where('is_active', true)]
                    : ['prohibited'],
            ], ['customer_id.required' => 'Pilih pelanggan dulu untuk penjualan grosir.']);

            $channel = $grosir ? 'grosir' : $data['channel'];

            $items = collect($data['items'])
                ->groupBy('product_id')
                ->map(fn ($g, $id) => ['product_id' => (int) $id, 'qty' => round((float) $g->sum('qty'), 3)])
                ->values();

            $sale = DB::transaction(function () use ($items, $data, $request, $grosir, $channel) {
                $products = Product::whereIn('id', $items->pluck('product_id'))->lockForUpdate()->get()->keyBy('id');

                $total = 0;
                $rows = [];

                foreach ($items as $item) {
                    $product = $products[$item['product_id']];
                    $qty = $item['qty'];

                    if ($qty <= 0) {
                        throw ValidationException::withMessages(['items' => "Jumlah {$product->name} tidak valid."]);
                    }
                    if (! in_array($product->unit, Product::DECIMAL_UNITS, true) && floor($qty) != $qty) {
                        throw ValidationException::withMessages(['items' => "Jumlah {$product->name} harus bilangan bulat ({$product->unit})."]);
                    }
                    if ($product->stock < $qty) {
                        $sisa = rtrim(rtrim(number_format($product->stock, 3, ',', ''), '0'), ',');
                        throw ValidationException::withMessages(['items' => "Stok {$product->name} tidak cukup (sisa {$sisa} {$product->unit})."]);
                    }

                    if ($grosir && $product->limit_orders !== null) {
                        $sudah = $this->orderCount((int) $data['customer_id'], $product);
                        if ($sudah >= $product->limit_orders) {
                            $kapan = $product->limit_period === 'mingguan' ? 'minggu ini' : 'hari ini';
                            throw ValidationException::withMessages([
                                'items' => "Pelanggan ini sudah membeli {$product->name} {$sudah}x {$kapan} (maksimal {$product->limit_orders}x).",
                            ]);
                        }
                    }

                    if ($grosir && $product->limit_qty !== null) {
                        $sisaJatah = round((float) $product->limit_qty - $this->bought((int) $data['customer_id'], $product), 3);
                        if ($qty > $sisaJatah) {
                            $kapan = $product->limit_period === 'mingguan' ? 'minggu ini' : 'hari ini';
                            throw ValidationException::withMessages([
                                'items' => "Jatah {$product->name} untuk pelanggan ini tinggal " . max($sisaJatah, 0) . " {$product->unit} {$kapan}.",
                            ]);
                        }
                    }

                    $price = $product->priceFor($qty, $grosir);
                    $raw = $price * $qty;
                    $subtotal = in_array($product->unit, Product::DECIMAL_UNITS, true)
                        ? $this->roundUp($raw)
                        : (int) round($raw);
                    $total += $subtotal;

                    $rows[] = [
                        'product_id' => $product->id,
                        'qty'        => $qty,
                        'price'      => $price,
                        'cost_price' => $product->cost_price,
                        'subtotal'   => $subtotal,
                    ];
                }

                $method = $grosir
                    ? ($data['payment_method'] ?? 'transfer')
                    : ($channel === 'offline' ? ($data['payment_method'] ?? 'tunai') : 'marketplace');

                $paid = $method === 'tunai' ? (int) ($data['paid'] ?? 0) : $total;

                if ($paid < $total) {
                    throw ValidationException::withMessages(['paid' => 'Uang yang dibayar kurang dari total.']);
                }

                $sale = Sale::create([
                    'invoice'        => 'INV-' . now()->format('ymdHis') . random_int(100, 999),
                    'user_id'        => $request->user()->id,
                    'customer_id'    => $grosir ? $data['customer_id'] : null,
                    'channel'        => $channel,
                    'payment_method' => $method,
                    'total'          => $total,
                    'paid'           => $paid,
                    'change_amount'  => $paid - $total,
                ]);

                $sale->items()->createMany($rows);

                foreach ($rows as $row) {
                    StockService::move($products[$row['product_id']], -$row['qty'], 'sale', $request->user()->id, null, $sale->id);
                }
            });

            if ($grosir) {
                Audit::log(
                    'sale.grosir',
                    "Grosir {$sale->invoice} Rp " . number_format($sale->total, 0, ',', '.') . " ke pelanggan #{$sale->customer_id}",
                    $sale,
                );
            }

            return $sale;
        }

        public function createGrosir(Request $request)
        {
            $products = Product::where('stock', '>', 0)->orderBy('name')->get()->makeHidden('cost_price');

            $quotas = [];
            $orders = [];
            if ($cid = (int) $request->query('customer')) {
                foreach ($products as $p) {
                    if ($p->limit_qty !== null) {
                        $quotas[$p->id] = max(round((float) $p->limit_qty - $this->bought($cid, $p), 3), 0);
                    }
                    if ($p->limit_orders !== null) {
                        $orders[$p->id] = max($p->limit_orders - $this->orderCount($cid, $p), 0);
                    }
                }
            }

            return Inertia::render('grosir/grosir', [
                'products'     => $products,
                'customers'    => Customer::where('is_active', true)->orderBy('name')->get(['id', 'name', 'phone']),
                'quotas'       => (object) $quotas,
                'orders'       => (object) $orders,
                'decimalUnits' => Product::DECIMAL_UNITS,
            ]);
        }

    public function index(Request $request)
            {
                $user = $request->user();
                $q = trim((string) $request->query('q', ''));
                $onlyVoid = $request->boolean('void');
                $period = Period::fromRequest($request);

                // Aturan akses: kasir hanya melihat transaksinya sendiri
                $scope = fn () => Sale::query()
                    //->when($user->role === 'kasir', fn ($s) => $s->where('user_id', $user->id))
                    ->when($user->role !== 'owner', fn ($s) => $s->where('user_id', $user->id))
                    ->when($period->start !== null, fn ($s) => $period->apply($s));

                $sales = $scope()
                    ->with(['user:id,name,username', 'voider:id,name,username'])
                    ->withCount('items')
                    ->when($q !== '', function ($query) use ($q) {
                        $query->where(function ($w) use ($q) {
                            $w->where('invoice', 'like', "%{$q}%")
                            ->orWhereHas('user', fn ($u) => $u->where('username', 'like', "%{$q}%"));
                        });
                    })
                    ->when($onlyVoid, fn ($query) => $query->whereNotNull('voided_at'))
                    ->latest()
                    ->latest('id')
                    ->paginate(20)
                    ->withQueryString();

                $activeCount = $scope()->whereNull('voided_at')->count();
                $activeTotal = (int) $scope()->whereNull('voided_at')->sum('total');

                return Inertia::render('riwayat/riwayat', [
                    'sales'   => $sales,
                    'filters' => ['q' => $q, 'void' => $onlyVoid, 'period' => $period->toArray(),],
                    'summary' => [
                        'count'     => $activeCount,
                        'total'     => $activeTotal,
                        'average'   => $activeCount ? (int) round($activeTotal / $activeCount) : 0,
                        'voidCount' => $scope()->whereNotNull('voided_at')->count(),
                    ],
                ]);
            }

    public function show(Request $request, Sale $sale)
    {
        //abort_if($request->user()->role !== 'kasir' && $sale->user_id !== $request->user()->id, 403);
        abort_if($request->user()->role !== 'owner' && $sale->user_id !== $request->user()->id, 403);

        $sale->load(['items.product:id,name,unit', 'user:id,name,username', 'voider:id,name,username']);

        return Inertia::render('riwayat/nota', [
            'sale'  => $sale,
            'store' => StoreSetting::current(),
        ]);
    }

    public function terakhir(Request $request)
    {
        $id = Sale::where('user_id', $request->user()->id)->latest('id')->value('id');

        return $id ? redirect("/riwayat/{$id}?print=1") : redirect('/riwayat');
    }

    // rekap penjualan toko pershift
    public function rekap(Request $request)
    {
        $user = $request->user();

        $date = $request->query('date', today()->toDateString());
        $from = Carbon::parse("{$date} " . $request->query('from', '00:00'))->startOfMinute();
        $to   = Carbon::parse("{$date} " . $request->query('to', '23:59'))->endOfMinute();

        $ownOnly = $user->role !== 'owner';

        $base = fn () => Sale::query()
            ->where('channel', '!=', 'grosir')
            ->when($ownOnly, fn ($q) => $q->where('user_id', $user->id))
            ->whereBetween('created_at', [$from, $to]);

        $byMethod = $base()->whereNull('voided_at')
            ->selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as total')
            ->groupBy('payment_method')->get()
            ->mapWithKeys(fn ($r) => [$r->payment_method => ['count' => (int) $r->count, 'total' => (int) $r->total]]);

        $voided = $base()->whereNotNull('voided_at')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total),0) as total')->first();

        $perKasir = $ownOnly ? [] : $base()->whereNull('voided_at')
            ->selectRaw('user_id, COUNT(*) as count, SUM(total) as total')
            ->groupBy('user_id')->with('user:id,username')->get()
            ->map(fn ($r) => ['username' => $r->user?->username ?? '-', 'count' => (int) $r->count, 'total' => (int) $r->total])
            ->values();

        return Inertia::render('riwayat/rekap', [
            'kind'       => 'toko',
            'filters'    => ['date' => $date, 'from' => $from->format('H:i'), 'to' => $to->format('H:i')],
            'byMethod'   => $byMethod,
            'total'      => (int) $byMethod->sum('total'),
            'count'      => (int) $byMethod->sum('count'),
            'voided'     => ['count' => (int) $voided->count, 'total' => (int) $voided->total],
            'perKasir'   => $perKasir,
            'scopeLabel' => $ownOnly ? $user->username : 'Semua kasir',
            'canSubmit'  => $ownOnly,
        ]);
    }

    public function rekapGrosir(Request $request)
    {
        $user = $request->user();
        $date = $request->query('date', today()->toDateString());
        $from = Carbon::parse("{$date} " . $request->query('from', '00:00'))->startOfMinute();
        $to   = Carbon::parse("{$date} " . $request->query('to', '23:59'))->endOfMinute();

        $ownOnly = $user->role !== 'owner';

        $base = fn () => Sale::query()
            ->where('channel', 'grosir')
            ->when($ownOnly, fn ($q) => $q->where('user_id', $user->id))
            ->whereBetween('created_at', [$from, $to]);

        $byMethod = $base()->whereNull('voided_at')
            ->selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as total')
            ->groupBy('payment_method')->get()
            ->mapWithKeys(fn ($r) => [$r->payment_method => ['count' => (int) $r->count, 'total' => (int) $r->total]]);

        $byCustomer = $base()->whereNull('voided_at')
            ->selectRaw('customer_id, COUNT(*) as count, SUM(total) as total')
            ->groupBy('customer_id')->with('customer:id,name')->get()
            ->map(fn ($r) => ['name' => $r->customer?->name ?? '-', 'count' => (int) $r->count, 'total' => (int) $r->total])
            ->sortByDesc('total')->values();

        $voided = $base()->whereNotNull('voided_at')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total),0) as total')->first();

        return Inertia::render('riwayat/rekap', [
            'kind'       => 'grosir',
            'filters'    => ['date' => $date, 'from' => $from->format('H:i'), 'to' => $to->format('H:i')],
            'byMethod'   => $byMethod,
            'byCustomer' => $byCustomer,
            'total'      => (int) $byMethod->sum('total'),
            'count'      => (int) $byMethod->sum('count'),
            'voided'     => ['count' => (int) $voided->count, 'total' => (int) $voided->total],
            'perKasir'   => [],
            'scopeLabel' => $ownOnly ? $user->username . ' (grosir)' : 'Semua grosir',
            'canSubmit'  => $ownOnly,
        ]);
    }

    public function void(Request $request, Sale $sale)
    {
        abort_unless($sale->user_id === $request->user()->id, 403);
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:200'],
        ]);

        DB::transaction(function () use ($sale, $data, $request) {
            // Kunci transaksi supaya tidak bisa dibatalkan dua kali bersamaan
            $sale = Sale::whereKey($sale->id)->lockForUpdate()->first();

            if ($sale->voided_at) {
                throw ValidationException::withMessages([
                    'reason' => 'Transaksi ini sudah dibatalkan.',
                ]);
            }

            // Kembalikan stok sesuai isi transaksi
            foreach ($sale->items as $item) {
                $product = Product::withTrashed()->find($item->product_id);

                StockService::move(
                    $product,
                    (float) $item->qty,
                    'void',
                    $request->user()->id,
                    'Pembatalan ' . $sale->invoice,
                    $sale->id,
                );
            }

            $sale->update([
                'voided_at'   => now(),
                'voided_by'   => $request->user()->id,
                'void_reason' => $data['reason'],
            ]);
        });

        Audit::log(
            'sale.void',
            "{$sale->invoice} (Rp " . number_format($sale->total, 0, ',', '.') . ") dibatalkan. Alasan: {$data['reason']}",
            $sale,
        );

        Notifier::toRoles(
            ['owner'],
            'void',
            'Transaksi dibatalkan',
            "{$sale->invoice} (Rp " . number_format($sale->total, 0, ',', '.') . ") dibatalkan oleh {$request->user()->username}. Alasan: {$data['reason']}",
            "/riwayat/{$sale->id}",
            $request->user()->id,
        );

        return back();
    }
}