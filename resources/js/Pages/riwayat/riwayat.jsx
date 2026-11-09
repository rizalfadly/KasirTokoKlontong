import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Receipt, Wallet, BarChart3, Search, Printer, Sparkles, FileText, Ban, Eye } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import Pagination from '../../Components/Pagination';
import PeriodFilter from '../../Components/Filter/PeriodFilter';
import { num, rp } from '../../lib/format';

function StatCard({ icon: Icon, label, value, bg, iconClass = 'text-slate-700' }) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ' + bg}>
                <Icon className={'h-6 w-6 ' + iconClass} strokeWidth={2.2} />
            </div>
            <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
                <div className="mt-1 text-2xl font-black tracking-tight text-slate-800">{value}</div>
            </div>
        </div>
    );
}

const fmt = (d) =>
    new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Riwayat({ sales, filters, summary }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const onlyVoid = filters.void;
    const rows = sales.data;

    const period = filters.period ?? { mode: 'terbaru', value: '', label: 'Terbaru' };

    function apply(next = {}) {
        router.get(
            '/riwayat',
            {
                mode: period.mode,
                value: period.value || undefined,
                q: search || undefined,
                void: onlyVoid ? 1 : undefined,
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    useEffect(() => {
        if (search === (filters.q ?? '')) return;
        const t = setTimeout(() => apply({ q: search || undefined }), 400);
        return () => clearTimeout(t);
    }, [search]);

    const chip = (active, colorActive = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105') =>
        'rounded-2xl px-5 py-2.5 text-xs font-black transition-all ' +
        (active ? colorActive : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200');

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Riwayat Transaksi Toko" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <FileText className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Arsip & Audit Transaksi</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Riwayat Transaksi Kasir 
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Menampilkan data: <b className="text-white underline">{period.label}</b> · 20 nota per halaman
                        </p>
                    </div>
                </div>
            </div>

            {/* Kartu Statistik Utama */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={Receipt} label="Jumlah Transaksi" value={num(summary.count)} bg="bg-sky-100/80" iconClass="text-sky-700" />
                <StatCard icon={Wallet} label="Total Penjualan" value={rp(summary.total)} bg="bg-emerald-100/80" iconClass="text-emerald-700" />
                <StatCard icon={BarChart3} label="Rata-Rata / Transaksi" value={rp(summary.average)} bg="bg-amber-100/80" iconClass="text-amber-700" />
            </div>

            {/* Panel Filter & Pencarian */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                <div className="space-y-4">
                    <PeriodFilter
                        path="/riwayat"
                        period={period}
                        extra={{ q: search || undefined, void: onlyVoid ? 1 : undefined }}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                                placeholder="Cari No. Invoice atau nama kasir..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => apply({ void: undefined })}
                                className={chip(!onlyVoid)}
                            >
                                Semua Transaksi
                            </button>
                            <button
                                type="button"
                                onClick={() => apply({ void: 1 })}
                                className={chip(onlyVoid, 'bg-rose-600 text-white shadow-lg shadow-rose-500/25 scale-105')}
                            >
                                Dibatalkan ({num(summary.voidCount)})
                            </button>
                        </div>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <span className="font-bold text-slate-700 text-base">
                            {search || onlyVoid || period.mode !== 'terbaru'
                                ? 'Tidak ada transaksi yang cocok dengan kriteria filter.'
                                : 'Belum ada transaksi tercatat di toko.'}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau periode filter.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <th className="pb-3 px-3">No. Invoice & Status</th>
                                        <th className="pb-3 px-3">Waktu Transaksi</th>
                                        <th className="pb-3 px-3">Kasir</th>
                                        <th className="pb-3 px-3">Jenis Item</th>
                                        <th className="pb-3 px-3 text-right">Total Nominal</th>
                                        <th className="pb-3 px-3 text-right">Dibayar</th>
                                        <th className="pb-3 px-3 text-right">Kembalian</th>
                                        <th className="pb-3 px-3 text-right">Aksi Nota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {rows.map((s) => (
                                        <tr
                                            key={s.id}
                                            className={'transition-colors hover:bg-indigo-50/50 ' + (s.voided_at ? 'bg-rose-50/40' : '')}
                                        >
                                            <td className="py-4 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ' + (s.voided_at ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700')}>
                                                        {s.voided_at ? <Ban className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-slate-800">{s.invoice}</span>
                                                            {s.voided_at && (
                                                                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-700">
                                                                    BATAL
                                                                </span>
                                                            )}
                                                        </div>
                                                        {s.voided_at && (
                                                            <div className="mt-0.5 text-xs font-bold text-rose-600">
                                                                Alasan: {s.void_reason} · {s.voider?.username ?? '-'}, {fmt(s.voided_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 text-xs font-bold text-slate-500">{fmt(s.created_at)}</td>
                                            <td className="py-4 px-3">
                                                <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                                                    {s.user?.username ?? '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800 border border-amber-200">
                                                    {s.items_count} jenis
                                                </span>
                                            </td>
                                            <td
                                                className={
                                                    'py-4 px-3 text-right font-black ' +
                                                    (s.voided_at ? 'text-slate-400 line-through' : 'text-emerald-600')
                                                }
                                            >
                                                {rp(s.total)}
                                            </td>
                                            <td className="py-4 px-3 text-right text-xs font-bold text-slate-600">{rp(s.paid)}</td>
                                            <td className="py-4 px-3 text-right text-xs font-bold text-slate-600">{rp(s.change_amount)}</td>
                                            <td className="py-4 px-3 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Link
                                                        href={`/riwayat/${s.id}`}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Lihat
                                                    </Link>
                                                    <a
                                                        href={`/riwayat/${s.id}?print=1`}
                                                        target="_blank"
                                                        rel="noopener"
                                                        className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-amber-300 transition-colors shadow-sm"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" /> Cetak
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <Pagination paginator={sales} noun="transaksi" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

Riwayat.layout = (page) => <KasirLayout>{page}</KasirLayout>;