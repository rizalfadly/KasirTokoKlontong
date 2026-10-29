import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import PeriodFilter from '../../Components/Filter/PeriodFilter';
import Pager from '../../Components/Filter/Pager';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function Stat({ label, value, tone = '' }) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={'mt-1 text-xl font-bold ' + tone}>{value}</div>
        </div>
    );
}

export default function Riwayat({ sales, summary, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');

    function go(extra = {}) {
        router.get(
            '/riwayat',
            {
                mode: filters.period.mode,
                value: filters.period.value,
                q: search,
                batal: filters.batal ? 1 : '',
                ...extra,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    const avg = summary.count ? Math.round(summary.total / summary.count) : 0;
    const chip = (active, danger) =>
        'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
        (active
            ? danger
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-white'
            : danger
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Riwayat" />

            <div>
                <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
                <p className="text-sm text-slate-500">Menampilkan: {filters.period.label}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Jumlah transaksi" value={summary.count} />
                <Stat label="Total penjualan" value={rp(summary.total)} tone="text-emerald-700" />
                <Stat label="Rata-rata per transaksi" value={rp(avg)} />
                <Stat label="Dibatalkan" value={summary.voided} tone={summary.voided > 0 ? 'text-red-600' : ''} />
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-md">
                <div className="mb-4 space-y-3">
                    <PeriodFilter
                        path="/riwayat"
                        period={filters.period}
                        extra={{ q: search, batal: filters.batal ? 1 : '' }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                placeholder="Cari invoice atau kasir, lalu Enter"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && go()}
                            />
                        </div>
                        <button type="button" onClick={() => go({ batal: '' })} className={chip(!filters.batal, false)}>
                            Semua
                        </button>
                        <button type="button" onClick={() => go({ batal: 1 })} className={chip(filters.batal, true)}>
                            Dibatalkan ({summary.voided})
                        </button>
                    </div>
                </div>

                {sales.data.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <p className="text-sm">Tidak ada transaksi pada pilihan ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm text-slate-400">
                                    <th className="pb-3 font-medium">Invoice</th>
                                    <th className="pb-3 font-medium">Waktu</th>
                                    <th className="pb-3 font-medium">Kasir</th>
                                    <th className="pb-3 font-medium">Item</th>
                                    <th className="pb-3 text-right font-medium">Total</th>
                                    <th className="pb-3 text-right font-medium">Dibayar</th>
                                    <th className="pb-3 text-right font-medium">Kembalian</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sales.data.map((s) => (
                                    <tr
                                        key={s.id}
                                        className={'transition hover:bg-amber-50/50 ' + (s.voided_at ? 'bg-red-50/40' : '')}
                                    >
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{s.invoice}</span>
                                                {s.voided_at && (
                                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                                                        Batal
                                                    </span>
                                                )}
                                            </div>
                                            {s.voided_at && (
                                                <div className="mt-0.5 text-xs text-red-500">
                                                    Alasan: {s.void_reason} · {s.voider?.username ?? '-'},{' '}
                                                    {new Date(s.voided_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 text-sm text-slate-500">
                                            {new Date(s.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-3">
                                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                                {s.user?.username ?? '-'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                {s.items_count} jenis
                                            </span>
                                        </td>
                                        <td
                                            className={
                                                'py-3 text-right font-semibold ' +
                                                (s.voided_at ? 'text-slate-400 line-through' : 'text-emerald-700')
                                            }
                                        >
                                            {rp(s.total)}
                                        </td>
                                        <td className="py-3 text-right text-sm text-slate-500">{rp(s.paid)}</td>
                                        <td className="py-3 text-right text-sm text-slate-500">{rp(s.change_amount)}</td>
                                        <td className="py-3 text-right">
                                            <Link
                                                href={`/riwayat/${s.id}`}
                                                className="mr-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                Lihat
                                            </Link>
                                            <a
                                                href={`/riwayat/${s.id}?print=1`}
                                                target="_blank"
                                                rel="noopener"
                                                className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-200"
                                            >
                                                Cetak
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pager paginator={sales} noun="transaksi" />
            </div>
        </div>
    );
}

Riwayat.layout = (page) => <KasirLayout>{page}</KasirLayout>;