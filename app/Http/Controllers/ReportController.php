<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    private const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    private function period(Request $request): array
    {
        $formats = ['harian' => 'Y-m-d', 'bulanan' => 'Y-m', 'tahunan' => 'Y'];

        $type = (string) $request->query('type', 'harian');
        $type = isset($formats[$type]) ? $type : 'harian';
        $format = $formats[$type];
        $value = (string) $request->query('value', '');

        try {
            $base = Carbon::createFromFormat('!' . $format, $value);
        } catch (\Throwable $e) {
            $base = null;
        }

        // Nilai tidak valid -> pakai hari/bulan/tahun ini
        if (! $base || $base->format($format) !== $value) {
            $base = now();
        }

        $bounds = fn (Carbon $d) => match ($type) {
            'harian'  => [$d->copy()->startOfDay(), $d->copy()->endOfDay()],
            'bulanan' => [$d->copy()->startOfMonth(), $d->copy()->endOfMonth()],
            'tahunan' => [$d->copy()->startOfYear(), $d->copy()->endOfYear()],
        };

        [$start, $end] = $bounds($base);

        $prevBase = match ($type) {
            'harian'  => $start->copy()->subDay(),
            'bulanan' => $start->copy()->subMonthNoOverflow(),
            'tahunan' => $start->copy()->subYear(),
        };
        [$prevStart, $prevEnd] = $bounds($prevBase);

        $label = match ($type) {
            'harian'  => $start->copy()->locale('id')->translatedFormat('l, j F Y'),
            'bulanan' => $start->copy()->locale('id')->translatedFormat('F Y'),
            'tahunan' => 'Tahun ' . $start->format('Y'),
        };

        return [
            'type'      => $type,
            'value'     => $start->format($format),
            'label'     => $label,
            'start'     => $start,
            'end'       => $end,
            'prevStart' => $prevStart,
            'prevEnd'   => $prevEnd,
        ];
    }

    private function bucket(string $label, $group): array
    {
        return [
            'label' => $label,
            'total' => (int) $group->sum('total'),
            'count' => $group->count(),
        ];
    }

    public function index(Request $request)
    {
        $p = $this->period($request);
        $type = $p['type'];

        $sales = Sale::with('user:id,name')
            ->whereBetween('created_at', [$p['start'], $p['end']])
            ->orderBy('created_at')
            ->get();

        $chart = match ($type) {
            'harian' => collect(range(0, 23))->map(fn ($h) => $this->bucket(
                sprintf('%02d', $h),
                $sales->filter(fn ($s) => (int) $s->created_at->format('G') === $h)
            )),
            'bulanan' => collect(range(1, $p['start']->daysInMonth))->map(fn ($d) => $this->bucket(
                (string) $d,
                $sales->filter(fn ($s) => (int) $s->created_at->format('j') === $d)
            )),
            'tahunan' => collect(range(1, 12))->map(fn ($m) => $this->bucket(
                self::BULAN[$m - 1],
                $sales->filter(fn ($s) => (int) $s->created_at->format('n') === $m)
            )),
        };

        $total = (int) $sales->sum('total');
        $count = $sales->count();

        // Laba kotor hanya untuk owner, dihitung dari baris yang punya salinan modal
        $isOwner = $request->user()->role === 'owner';
        $profit = null;

        if ($isOwner) {
            $row = SaleItem::active()
                ->whereBetween('created_at', [$p['start'], $p['end']])
                ->selectRaw('
                    COALESCE(SUM(subtotal), 0) as revenue,
                    COALESCE(SUM(CASE WHEN cost_price IS NOT NULL THEN subtotal END), 0) as costed_revenue,
                    COALESCE(SUM(CASE WHEN cost_price IS NOT NULL THEN ROUND(cost_price * qty) END), 0) as cogs
                ')
                ->first();

            $profit = [
                'revenue'  => (int) $row->costed_revenue,
                'cogs'     => (int) $row->cogs,
                'profit'   => (int) $row->costed_revenue - (int) $row->cogs,
                'coverage' => $row->revenue > 0 ? (int) round($row->costed_revenue / $row->revenue * 100) : null,
            ];
        }

        $sales->loadMissing('user:id,name');
        $perKasir = $sales->groupBy('user_id')->map(function ($g) {
            $u = $g->first()->user;
            return [
                'username' => $u?->username ?? $u?->name ?? '-',
                'count'    => $g->count(),
                'total'    => (int) $g->sum('total'),
            ];
        })->sortByDesc('total')->values();

        $topProducts = SaleItem::active()
            ->selectRaw('
                product_id,
                SUM(qty) as qty,
                SUM(subtotal) as revenue,
                SUM(CASE WHEN cost_price IS NOT NULL THEN subtotal - ROUND(cost_price * qty) END) as profit
            ')
            ->whereBetween('created_at', [$p['start'], $p['end']])
            ->groupBy('product_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->with('product:id,name,unit')
            ->get()
            ->map(fn ($i) => [
                'name'    => $i->product?->name ?? '-',
                'unit'    => $i->product?->unit ?? '',
                'qty'     => (float) $i->qty,
                'revenue' => (int) $i->revenue,
                'profit'  => $isOwner && $i->profit !== null ? (int) round($i->profit) : null,
         ]);

        return Inertia::render('laporan/laporan', [
            'type'    => $type,
            'value'   => $p['value'],
            'label'   => $p['label'],
            'summary' => [
                'total'     => $total,
                'count'     => $count,
                'profit'    => $profit,
                'items'     => (float) SaleItem::active()->whereBetween('created_at', [$p['start'], $p['end']])->sum('qty'),
                'average'   => $count ? (int) round($total / $count) : 0,
                'prevTotal' => (int) Sale::active()->whereBetween('created_at', [$p['prevStart'], $p['prevEnd']])->sum('total'),
                'voidedCount' => Sale::whereNotNull('voided_at')->whereBetween('created_at', [$p['start'], $p['end']])->count(),
                'voidedTotal' => (int) Sale::whereNotNull('voided_at')->whereBetween('created_at', [$p['start'], $p['end']])->sum('total'),
            ],
            'chart'        => $chart,
            'perKasir' => $perKasir,
            'topProducts'  => $topProducts,
            'transactions' => $type === 'harian'
                ? $sales->reverse()->values()->map(fn ($s) => [
                    'id'      => $s->id,
                    'invoice' => $s->invoice,
                    'time'    => $s->created_at->format('H:i'),
                    'kasir' => $s->user?->username ?? '-',
                    'total'   => $s->total,
                ])
                : [],
        ]);
    }

    public function export(Request $request)
    {
        $p = $this->period($request);

        $sales = Sale::active()->with('user:id,name,username')
            ->withCount('items')
            ->whereBetween('created_at', [$p['start'], $p['end']])
            ->orderBy('created_at')
            ->get();

        return response()->streamDownload(function () use ($sales) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // agar karakter terbaca benar di Excel

            $row = fn (array $r) => fputcsv($out, $r, ';', '"', '');

            $row(['Invoice', 'Waktu', 'Kasir', 'Jenis item', 'Total', 'Dibayar', 'Kembalian', 'Status', 'Alasan batal']);
            foreach ($sales as $s) {
                $row([
                    $s->invoice,
                    $s->created_at->format('Y-m-d H:i'),
                    $s->user?->username,
                    $s->items_count,
                    $s->total,
                    $s->paid,
                    $s->change_amount,
                    $s->voided_at ? 'Batal' : 'Selesai',
                    $s->void_reason,
                ]);
            }
            fclose($out);
        }, "laporan-{$p['type']}-{$p['value']}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}