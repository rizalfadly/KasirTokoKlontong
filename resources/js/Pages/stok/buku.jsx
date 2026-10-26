import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import { Search, BookOpen } from 'lucide-react';

const TYPES = {
    initial: ['Saldo awal', 'bg-slate-100 text-slate-600'],
    sale: ['Terjual', 'bg-sky-100 text-sky-700'],
    void: ['Dibatalkan', 'bg-red-100 text-red-600'],
    purchase: ['Stok masuk', 'bg-emerald-100 text-emerald-700'],
    adjustment: ['Koreksi', 'bg-orange-100 text-orange-700'],
    opname: ['Opname', 'bg-violet-100 text-violet-700'],
};

export default function BukuStok({ movements, filters }) {
    const [q, setQ] = useState(filters.q ?? '');
    const [type, setType] = useState(filters.type ?? '');

    function apply(next = {}) {
        router.get('/buku-stok', { q, type, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Buku Stok" />

            <div>
                <h1 className="text-2xl font-bold">Buku Stok</h1>
                <p className="text-sm text-slate-500">Catatan semua perubahan stok (300 terakhir).</p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="Cari nama atau SKU, lalu Enter"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && apply()}
                        />
                    </div>
                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            apply({ type: e.target.value });
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                    >
                        <option value="">Semua jenis</option>
                        {Object.entries(TYPES).map(([key, [label]]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {movements.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <BookOpen className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Belum ada catatan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm text-slate-400">
                                    <th className="pb-3 font-medium">Waktu</th>
                                    <th className="pb-3 font-medium">Produk</th>
                                    <th className="pb-3 font-medium">Jenis</th>
                                    <th className="pb-3 text-right font-medium">Perubahan</th>
                                    <th className="pb-3 text-right font-medium">Stok akhir</th>
                                    <th className="pb-3 font-medium">Oleh</th>
                                    <th className="pb-3 font-medium">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {movements.map((m) => {
                                    const [label, style] = TYPES[m.type] ?? [m.type, 'bg-slate-100 text-slate-600'];
                                    const unit = m.product?.unit ?? '';
                                    return (
                                        <tr key={m.id} className="transition hover:bg-amber-50/50">
                                            <td className="py-3 text-sm text-slate-500">
                                                {new Date(m.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3">
                                                <div className="font-medium">{m.product?.name ?? '-'}</div>
                                                <div className="font-mono text-xs text-slate-400">{m.product?.sku}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + style}>{label}</span>
                                            </td>
                                            <td
                                                className={
                                                    'py-3 text-right font-semibold ' +
                                                    (m.qty_change >= 0 ? 'text-emerald-700' : 'text-red-600')
                                                }
                                            >
                                                {m.qty_change >= 0 ? '+' : '-'}
                                                {num(Math.abs(m.qty_change))} {unit}
                                            </td>
                                            <td className="py-3 text-right text-sm">
                                                {num(m.stock_after)} {unit}
                                            </td>
                                            <td className="py-3 text-sm text-slate-500">{m.user?.username ?? 'Sistem'}</td>
                                            <td className="py-3 text-sm text-slate-500">{m.reason ?? ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

BukuStok.layout = (page) => <KasirLayout>{page}</KasirLayout>;