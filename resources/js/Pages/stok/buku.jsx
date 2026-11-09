import { Head, router } from '@inertiajs/react';
import { Search, BookOpen, Sparkles, Filter } from 'lucide-react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import PeriodFilter from '../../Components/Filter/PeriodFilter';
import Pager from '../../Components/Filter/Pager';
import { num } from '../../lib/format';

const TYPES = {
    initial: ['Saldo Awal', 'bg-slate-100 text-slate-700 border border-slate-200'],
    sale: ['Terjual', 'bg-sky-100 text-sky-800 border border-sky-200'],
    void: ['Dibatalkan', 'bg-rose-100 text-rose-800 border border-rose-200'],
    purchase: ['Stok Masuk', 'bg-emerald-100 text-emerald-800 border border-emerald-200'],
    adjustment: ['Koreksi', 'bg-amber-100 text-amber-800 border border-amber-200'],
    opname: ['Opname', 'bg-indigo-100 text-indigo-800 border border-indigo-200'],
};

export default function BukuStok({ movements, filters }) {
    const [q, setQ] = useState(filters.q ?? '');

    function go(extra = {}) {
        router.get(
            '/buku-stok',
            { mode: filters.period.mode, value: filters.period.value, q, type: filters.type, ...extra },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Buku Stok Log" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Sparkles className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                            <span>Audit Mutasi Gudang</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Buku Stok & Mutasi Barang 📦
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Catatan seluruh perubahan inventaris toko. Menampilkan periode: <b className="text-white underline">{filters.period.label}</b>
                        </p>
                    </div>
                </div>
            </div>

            {/* Container Panel Utama dengan Glassmorphism */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                {/* Filter & Pencarian */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                    <PeriodFilter path="/buku-stok" period={filters.period} extra={{ q, type: filters.type }} />

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                                placeholder="Cari nama produk atau SKU, lalu Enter..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && go()}
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filters.type}
                                onChange={(e) => go({ type: e.target.value })}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 cursor-pointer"
                            >
                                <option value="">Semua Jenis Mutasi</option>
                                {Object.entries(TYPES).map(([key, [label]]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabel Data Mutasi Stok */}
                {movements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                        <span className="font-bold text-slate-700 text-base">Tidak ada catatan pada filter ini</span>
                        <p className="text-xs text-slate-400 mt-1">Coba ubah rentang periode atau kata kunci pencarian.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-3 px-3">Waktu Mutasi</th>
                                    <th className="pb-3 px-3">Produk / Barang</th>
                                    <th className="pb-3 px-3">Jenis Mutasi</th>
                                    <th className="pb-3 px-3 text-right">Perubahan Qty</th>
                                    <th className="pb-3 px-3 text-right">Stok Akhir</th>
                                    <th className="pb-3 px-3">Pelaku / Oleh</th>
                                    <th className="pb-3 px-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {movements.data.map((m) => {
                                    const [label, style] = TYPES[m.type] ?? [m.type, 'bg-slate-100 text-slate-600 border border-slate-200'];
                                    const unit = m.product?.unit ?? '';

                                    return (
                                        <tr key={m.id} className="transition-colors hover:bg-indigo-50/50 group">
                                            <td className="py-3.5 px-3 text-xs font-semibold text-slate-500">
                                                {new Date(m.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div className="font-extrabold text-slate-800">{m.product?.name ?? '-'}</div>
                                                <div className="font-mono text-xs font-semibold text-indigo-600">{m.product?.sku}</div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={'rounded-full px-3 py-1 text-xs font-black ' + style}>{label}</span>
                                            </td>
                                            <td
                                                className={
                                                    'py-3.5 px-3 text-right font-black ' +
                                                    (m.qty_change >= 0 ? 'text-emerald-600' : 'text-rose-600')
                                                }
                                            >
                                                {m.qty_change >= 0 ? '+' : ''}
                                                {num(m.qty_change)} {unit}
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-extrabold text-slate-700">
                                                {num(m.stock_after)} {unit}
                                            </td>
                                            <td className="py-3.5 px-3 text-xs font-bold text-slate-600">
                                                <span className="rounded-lg bg-slate-100 px-2 py-1">{m.user?.username ?? 'Sistem'}</span>
                                            </td>
                                            <td className="py-3.5 px-3 text-xs text-slate-500 leading-relaxed">
                                                <div>{m.reason ?? '-'}</div>
                                                {m.supplier && <div className="font-bold text-emerald-700 mt-0.5">Supplier: {m.supplier.name}</div>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                    <Pager paginator={movements} noun="catatan mutasi" />
                </div>
            </div>
        </div>
    );
}

BukuStok.layout = (page) => <KasirLayout>{page}</KasirLayout>;