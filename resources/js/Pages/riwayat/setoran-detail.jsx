import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Banknote, QrCode, Landmark, ShoppingBag, Ban, CheckCircle2, Undo2, Printer } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num, rp } from '../../lib/format';

const METHODS = [
    { key: 'tunai', label: 'Tunai', icon: Banknote, color: 'bg-emerald-100 text-emerald-700' },
    { key: 'qris', label: 'QRIS', icon: QrCode, color: 'bg-sky-100 text-sky-700' },
    { key: 'transfer', label: 'Transfer', icon: Landmark, color: 'bg-violet-100 text-violet-700' },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'bg-amber-100 text-amber-700' },
];

const STATUS = {
    submitted: ['Menunggu persetujuan', 'bg-sky-100 text-sky-700'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-700'],
    rejected: ['Dikembalikan', 'bg-orange-100 text-orange-700'],
};

const fmt = (d) =>
    d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function SetoranDetail({ closing: c }) {
    const { auth, errors } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const [returning, setReturning] = useState(false);
    const [note, setNote] = useState('');

    const [label, style] = STATUS[c.status] ?? [c.status, 'bg-slate-100 text-slate-600'];
    const by = c.by_method ?? {};
    const d = c.difference;

    function approve() {
        if (confirm('Setujui setoran shift ini?')) router.post(`/setoran/${c.id}/setujui`, {}, { preserveScroll: true });
    }

    function giveBack(e) {
        e.preventDefault();
        router.post(`/setoran/${c.id}/kembalikan`, { review_note: note }, { preserveScroll: true });
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
            <Head title={`Setoran #${c.id}`} />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Link href="/setoran" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline print:hidden">
                        <ArrowLeft className="h-4 w-4" /> Semua setoran
                    </Link>
                    <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold">
                        Setoran Shift #{c.id}
                        <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + style}>{label}</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Kasir {c.user?.username ?? '-'} · {fmt(c.period_start)} s/d {fmt(c.period_end)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Printer className="h-4 w-4" /> Cetak
                    </button>
                    {isOwner && c.status === 'submitted' && (
                        <>
                            <button
                                onClick={() => setReturning(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <Undo2 className="h-4 w-4" /> Kembalikan
                            </button>
                            <button
                                onClick={approve}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Setujui
                            </button>
                        </>
                    )}
                </div>
            </div>

            {errors?.status && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errors.status}</div>}

            {c.status === 'rejected' && (
                <div className="flex items-start gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                    <Undo2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Dikembalikan oleh {c.reviewer?.username ?? '-'}: {c.review_note}</span>
                </div>
            )}
            {c.status === 'approved' && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        Disetujui oleh {c.reviewer?.username ?? '-'} pada {fmt(c.reviewed_at)}.
                        {c.review_note ? ` Catatan: ${c.review_note}` : ''}
                    </span>
                </div>
            )}

            <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-200 print:border print:bg-none print:text-black print:shadow-none">
                <div className="text-sm text-orange-50 print:text-slate-600">Total penjualan</div>
                <div className="mt-1 text-4xl font-bold">{rp(c.total)}</div>
                <div className="mt-1 text-sm text-orange-50 print:text-slate-600">{num(c.sales_count)} transaksi</div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {METHODS.map((m) => (
                    <div key={m.key} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className={'inline-flex h-9 w-9 items-center justify-center rounded-xl ' + m.color}>
                            <m.icon className="h-4 w-4" />
                        </div>
                        <div className="mt-3 text-xs text-slate-500">{m.label}</div>
                        <div className="text-lg font-bold">{rp(by[m.key]?.total ?? 0)}</div>
                        <div className="text-xs text-slate-400">{num(by[m.key]?.count ?? 0)} transaksi</div>
                    </div>
                ))}
            </div>

            {c.voided_count > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    <Ban className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{c.voided_count} transaksi dibatalkan ({rp(c.voided_total)}), tidak dihitung.</span>
                </div>
            )}

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold">Uang di laci</h2>
                <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Modal awal</span><span>{rp(c.opening_cash)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">+ Penjualan tunai</span><span>{rp(by.tunai?.total ?? 0)}</span></div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-semibold">
                        <span>Seharusnya</span><span>{rp(c.expected_cash)}</span>
                    </div>
                    <div className="flex justify-between font-semibold"><span>Hitungan fisik</span><span>{rp(c.counted_cash)}</span></div>
                </div>
                <div
                    className={
                        'mt-4 flex items-center justify-between rounded-xl px-4 py-3 font-semibold ' +
                        (d === 0 ? 'bg-emerald-50 text-emerald-700' : d < 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700')
                    }
                >
                    <span>{d === 0 ? 'Cocok' : d < 0 ? 'Kurang' : 'Lebih'}</span>
                    <span>{rp(Math.abs(d))}</span>
                </div>
                {c.note && <p className="mt-3 text-sm text-slate-500">Catatan kasir: {c.note}</p>}
            </section>

            {returning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
                    <form onSubmit={giveBack} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Undo2 className="h-5 w-5 text-orange-500" /> Kembalikan ke kasir
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">Kasir bisa memperbaiki dan mengirim ulang.</p>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-600">Catatan untuk kasir</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="mis. Selisih terlalu besar, hitung ulang laci"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            />
                            {errors?.review_note && <span className="mt-1 block text-xs text-red-600">{errors.review_note}</span>}
                        </label>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setReturning(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50">
                                Batal
                            </button>
                            <button className="flex-1 rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600">Kembalikan</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

SetoranDetail.layout = (page) => <KasirLayout>{page}</KasirLayout>;