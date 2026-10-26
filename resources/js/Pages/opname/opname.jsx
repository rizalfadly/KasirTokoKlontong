import { Head, Link, useForm } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';
import { MailCheck, Plus, Calculator } from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS = {
    draft: ['Sedang dihitung', 'bg-amber-100 text-amber-800'],
    submitted: ['Menunggu persetujuan', 'bg-sky-100 text-sky-700'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-700'],
};

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

export default function Opname({ opnames }) {
    const form = useForm({ sku_prefix: '', note: '' });
    const pending = opnames.filter((o) => o.status === 'submitted').length;

    function submit(e) {
        e.preventDefault();
        form.post('/opname');
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Stok Opname" />

            <div>
                <h1 className="text-2xl font-bold">Stok Opname</h1>
                <p className="text-sm text-slate-500">Hitung stok fisik, cocokkan dengan sistem, lalu minta persetujuan owner.</p>
            </div>

            {pending > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    <MailCheck className="h-4 w-4 shrink-0" />
                    <span>{pending} opname menunggu persetujuan owner.</span>
                </div>
            )}

            {/* Mulai opname baru */}
            <form onSubmit={submit} className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-md">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                    <Plus className="h-5 w-5 text-orange-500" />
                    Mulai opname baru
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-600">Cakupan (awalan SKU)</span>
                        <input
                            className={inputClass}
                            placeholder="Kosongkan untuk semua produk"
                            autoCapitalize="characters"
                            autoComplete="off"
                            value={form.data.sku_prefix}
                            onChange={(e) => form.setData('sku_prefix', e.target.value)}
                        />
                        <span className="mt-1 block text-xs text-slate-400">
                            Contoh: isi TLR untuk menghitung produk telur saja.
                        </span>
                        {form.errors.sku_prefix && <span className="mt-1 block text-xs text-red-600">{form.errors.sku_prefix}</span>}
                    </label>
                    <label className="block md:col-span-2">
                        <span className="mb-1 block text-sm font-medium text-slate-600">Catatan (opsional)</span>
                        <input
                            className={inputClass}
                            placeholder="mis. Opname akhir tahun 2026"
                            autoComplete="off"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                        />
                    </label>
                </div>
                <button
                    disabled={form.processing}
                    className="mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105 disabled:opacity-50"
                >
                    Mulai opname
                </button>
            </form>

            {/* Daftar */}
            <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-md">
                <h2 className="mb-4 font-semibold">Riwayat opname</h2>

                {opnames.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <Calculator className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Belum ada opname.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm text-slate-400">
                                    <th className="pb-3 font-medium">Kode</th>
                                    <th className="pb-3 font-medium">Tanggal</th>
                                    <th className="pb-3 font-medium">Cakupan</th>
                                    <th className="pb-3 font-medium">Dibuat oleh</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Dihitung</th>
                                    <th className="pb-3 text-right font-medium">Nilai selisih</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {opnames.map((o) => {
                                    const [label, style] = STATUS[o.status] ?? [o.status, 'bg-slate-100 text-slate-600'];
                                    return (
                                        <tr key={o.id} className="transition hover:bg-amber-50/50">
                                            <td className="py-3 font-mono text-sm font-medium">{o.code}</td>
                                            <td className="py-3 text-sm text-slate-500">
                                                {new Date(o.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3 text-sm">{o.sku_prefix ? `SKU ${o.sku_prefix}*` : 'Semua produk'}</td>
                                            <td className="py-3 text-sm text-slate-500">{o.creator ?? '-'}</td>
                                            <td className="py-3">
                                                <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + style}>{label}</span>
                                            </td>
                                            <td className="py-3 text-right text-sm">{o.items_count} produk</td>
                                            <td
                                                className={
                                                    'py-3 text-right text-sm font-semibold ' +
                                                    (o.net < 0 ? 'text-red-600' : o.net > 0 ? 'text-emerald-700' : 'text-slate-400')
                                                }
                                            >
                                                {o.net > 0 ? '+' : ''}
                                                {rp(o.net)}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={`/opname/${o.id}`}
                                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                                >
                                                    Buka
                                                </Link>
                                            </td>
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

Opname.layout = (page) => <KasirLayout>{page}</KasirLayout>;