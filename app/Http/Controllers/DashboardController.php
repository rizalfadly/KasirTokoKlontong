<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Tamu (belum login): hanya melihat ketersediaan stok
        if (! auth()->check()) {
            return $this->stockOnly();
        }

        // Kasir tidak melihat omzet, hanya ketersediaan stok
        if (auth()->user()->role === 'kasir') {
            return $this->stockOnly();
        }

        $perDay = Sale::active()
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as day, SUM(total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $chart = collect(range(6, 0))->map(function ($i) use ($perDay) {
            $date = now()->subDays($i);
            return [
                'label' => $date->format('d/m'),
                'total' => (int) ($perDay[$date->toDateString()] ?? 0),
            ];
        });

        $topProducts = SaleItem::active()
            ->selectRaw('product_id, SUM(qty) as qty')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('product_id')
            ->orderByDesc('qty')
            ->limit(5)
            ->with('product:id,name')
            ->get()
            ->map(fn ($i) => ['name' => $i->product?->name ?? '-', 'qty' => (float) $i->qty]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySales'    => (int) Sale::active()->whereDate('created_at', today())->sum('total'),
                'todayCount'    => Sale::active()->whereDate('created_at', today())->count(),
                'todayItems'    => (float) SaleItem::active()->whereDate('created_at', today())->sum('qty'),
                'lowStockCount' => Product::where('stock', '<=', 10)->count(),
            ],
            'chart'       => $chart,
            'topProducts' => $topProducts,
            'lowStock'    => Product::where('stock', '<=', 10)->orderBy('stock')->limit(5)->get(['id', 'name', 'stock', 'unit']),
            'recent'      => Sale::active()->latest()->limit(5)->get(['id', 'invoice', 'total', 'created_at']),
            'stockList'   => [],
        ]);
    }

    private function stockOnly()
    {
        return Inertia::render('Dashboard', [
            'stats'       => null,
            'chart'       => [],
            'topProducts' => [],
            'lowStock'    => [],
            'recent'      => [],
            //'stockList'   => Product::orderBy('name')->get(['id', 'name', 'stock', 'unit']),
            'stockList'   => Product::orderBy('name')->get(['id', 'name', 'stock', 'unit', 'icon', 'image_version']),
        ]);
    }
}