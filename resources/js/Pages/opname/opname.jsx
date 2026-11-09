import { Head, Link, router, useForm } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';
import PeriodFilter from '../../Components/Filter/PeriodFilter';
import Pager from '../../Components/Filter/Pager';
import { ClipboardList, PlusCircle, Sparkles, ShieldAlert, ArrowRight, ClipboardCheck } from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS = {
    draft: ['Sedang Dihitung', 'bg-amber-100 text-amber-800 border border-amber-200'],
    submitted: ['Menunggu Persetujuan', 'bg-sky-100 text-sky-800 border border-sky-200'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-800 border border-emerald-200'],
};

const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal';

export default function Opname({ opnames, pending, filters }) {
    const form = useForm({ sku_prefix: '', note: '' });

    function submit(e) {
        e.preventDefault();
        form.post('/opname');
    }

    function setStatus(status) {
        router.get(
            '/opname',
            { mode: filters.period.mode, value: filters.period.value, status },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    const chip = (active) =>
        'rounded-2xl px-5 py-2.5 text-xs font-black transition-all ' +
        (active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200');

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Stok Opname Gudang" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <ClipboardList className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Audit & Inventaris Toko</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Stok Opname Gudang 📋
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Hitung stok fisik, cocokkan dengan sistem, lalu ajukan persetujuan owner.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Pending */}
            {pending > 0 && (
                <div className="flex items-center gap-3 rounded-3xl bg-sky-50 border border-sky-200 p-4 text-sm font-bold text-sky-800 shadow-sm">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-sky-600" />
                    <span>Ada <b>{pending} opname</b> yang sedang menunggu verifikasi dan persetujuan dari owner.</span>
                </div>
            )}

            {/* Form Mulai Opname Baru */}
            <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                <h2 className="mb-6 flex items-center gap-2.5 text-base font-black text-slate-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm">
                        <PlusCircle className="h-5 w-5" />
                    </div>
                    <span>Mulai Sesi Opname Baru</span>
                </h2>
                <div className="grid gap-5 md:grid-cols-3">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Cakupan (Awalan SKU)</span>
                        <input
                            className={inputClass}
                            placeholder="Kosongkan untuk semua produk"
                            autoCapitalize="characters"
                            autoComplete="off"
                            value={form.data.sku_prefix}
                            onChange={(e) => form.setData('sku_prefix', e.target.value)}
                        />
                        <span className="mt-1 block text-xs font-medium text-slate-400">
                            Contoh: isi <b>TLR</b> untuk menghitung produk telur saja.
                        </span>
                        {form.errors.sku_prefix && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {form.errors.sku_prefix}</span>}
                    </label>
                    <label className="block md:col-span-2">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Sesi (Opsional)</span>
                        <input
                            className={inputClass}
                            placeholder="mis. Opname Rutin Akhir Bulan"
                            autoComplete="off"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                        />
                        {form.errors.note && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {form.errors.note}</span>}
                    </label>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                        <ClipboardCheck className="h-5 w-5 text-amber-300" />
                        <span>{form.processing ? 'Menyiapkan Sesi...' : 'Mulai Opname Sekarang'}</span>
                    </button>
                </div>
            </form>

            {/* Riwayat Opname */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                <div className="space-y-4 border-b border-slate-100 pb-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="text-lg font-black text-slate-800">Riwayat Sesi Opname</h2>
                        <span className="text-xs font-bold text-slate-400">Menampilkan: {filters.period.label}</span>
                    </div>

                    <PeriodFilter path="/opname" period={filters.period} extra={{ status: filters.status }} />

                    <div className="flex flex-wrap gap-2 pt-1">
                        <button type="button" onClick={() => setStatus('')} className={chip(!filters.status)}>
                            Semua Status
                        </button>
                        {Object.entries(STATUS).map(([key, [label]]) => (
                            <button key={key} type="button" onClick={() => setStatus(key)} className={chip(filters.status === key)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {opnames.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <span className="font-bold text-slate-700 text-base">Tidak ada riwayat opname pada periode ini</span>
                        <p className="text-xs text-slate-400 mt-1">Mulai sesi opname baru menggunakan form di atas.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-3 px-3">Kode Opname</th>
                                    <th className="pb-3 px-3">Tanggal Dibuat</th>
                                    <th className="pb-3 px-3">Cakupan SKU</th>
                                    <th className="pb-3 px-3">Pembuat</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Total Produk</th>
                                    <th className="pb-3 px-3 text-right">Nilai Selisih Net</th>
                                    <th className="pb-3 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {opnames.data.map((o) => {
                                    const [label, style] = STATUS[o.status] ?? [o.status, 'bg-slate-100 text-slate-600 border border-slate-200'];

                                    return (
                                        <tr key={o.id} className="transition-colors hover:bg-indigo-50/50 group">
                                            <td className="py-4 px-3 font-mono font-black text-indigo-600">{o.code}</td>
                                            <td className="py-4 px-3 text-xs font-bold text-slate-500">
                                                {new Date(o.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-4 px-3 font-semibold text-slate-700">{o.sku_prefix ? `SKU ${o.sku_prefix}*` : 'Semua Produk'}</td>
                                            <td className="py-4 px-3 text-xs font-bold text-slate-600">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1">{o.creator ?? '-'}</span>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className={'rounded-full px-3 py-1 text-xs font-black ' + style}>{label}</span>
                                            </td>
                                            <td className="py-4 px-3 text-right font-extrabold text-slate-700">{o.items_count} produk</td>
                                            <td
                                                className={
                                                    'py-4 px-3 text-right font-black ' +
                                                    (o.net < 0 ? 'text-rose-600' : o.net > 0 ? 'text-emerald-600' : 'text-slate-400')
                                                }
                                            >
                                                {o.net > 0 ? '+' : ''}
                                                {rp(o.net)}
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <Link
                                                    href={`/opname/${o.id}`}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Buka <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                    <Pager paginator={opnames} noun="sesi opname" />
                </div>
            </div>
        </div>
    );
}

Opname.layout = (page) => <KasirLayout>{page}</KasirLayout>;