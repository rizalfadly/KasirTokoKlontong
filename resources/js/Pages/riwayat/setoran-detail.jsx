import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, Banknote, QrCode, Landmark, ShoppingBag, Ban,
    CheckCircle2, Undo2, Printer, Pencil, Sparkles, ShieldCheck, Users, Calculator
} from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num, rp } from '../../lib/format';
import { useDialog } from '../../Components/Dialog';

const METHODS = [
    { key: 'tunai', label: 'Tunai', icon: Banknote, color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    { key: 'qris', label: 'QRIS', icon: QrCode, color: 'bg-sky-100 text-sky-700 border border-sky-200' },
    { key: 'transfer', label: 'Transfer', icon: Landmark, color: 'bg-violet-100 text-violet-700 border border-violet-200' },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'bg-amber-100 text-amber-700 border border-amber-200' },
];

const STATUS = {
    submitted: ['Menunggu Persetujuan Owner', 'bg-sky-100 text-sky-800 border border-sky-200'],
    approved: ['Disetujui & Selesai', 'bg-emerald-100 text-emerald-800 border border-emerald-200'],
    rejected: ['Dikembalikan untuk Revisi', 'bg-amber-100 text-amber-800 border border-amber-200'],
};

const fmt = (d) =>
    d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const fieldCls =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';

export default function SetoranDetail({ closing: c }) {
    const { auth, errors } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const isMine = auth?.user?.id === c.user_id;
    const isGrosir = c.kind === 'grosir';

    const [returning, setReturning] = useState(false);
    const [note, setNote] = useState('');
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        opening_cash: String(c.opening_cash),
        counted_cash: String(c.counted_cash),
        note: c.note ?? '',
    });

    const [label, style] = STATUS[c.status] ?? [c.status, 'bg-slate-100 text-slate-600 border border-slate-200'];
    const by = c.by_method ?? {};
    const customers = c.by_customer ?? [];
    const tunai = by.tunai?.total ?? 0;
    const showLaci = !isGrosir || tunai > 0;
    const d = c.difference;

    const jenis = isGrosir ? 'Grosir' : 'Shift';
    const pengirim = isGrosir ? 'Admin' : 'Kasir';
    const dialog = useDialog(); 

    function resubmit(e) {
        e.preventDefault();
        router.post(
            `/setoran/${c.id}/kirim-ulang`,
            {
                opening_cash: showLaci ? Number(form.opening_cash || 0) : 0,
                counted_cash: showLaci ? Number(form.counted_cash || 0) : 0,
                note: form.note,
            },
            { preserveScroll: true, onSuccess: () => setEditing(false) },
        );
    }

    async function approve() {
        const ok = await dialog.confirm(
            `Setujui setoran ${jenis.toLowerCase()} ini? Saldo akhir akan diverifikasi.`,
            { title: 'Setujui setoran', tone: 'success', okText: 'Ya, setujui' },
        );
        if (ok) router.post(`/setoran/${c.id}/setujui`, {}, { preserveScroll: true });
    }

    function giveBack(e) {
        e.preventDefault();
        router.post(`/setoran/${c.id}/kembalikan`, { review_note: note }, { preserveScroll: true, onSuccess: () => setReturning(false) });
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
            <Head title={`Setoran #${c.id}`} />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8 print:hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <ShieldCheck className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Verifikasi & Audit Setoran</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex flex-wrap items-center gap-3">
                            <span>Setoran {jenis} #{c.id}</span>
                            <span className={'rounded-full px-4 py-1 text-xs font-black ' + style}>{label}</span>
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            {pengirim}: <b className="text-white">{c.user?.username ?? '-'}</b> · Periode: {fmt(c.period_start)} s.d. {fmt(c.period_end)}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/setoran"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                        >
                            <ArrowLeft className="h-4 w-4" /> Semua Setoran
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                        >
                            <Printer className="h-4 w-4 text-amber-300" /> Cetak
                        </button>
                        {isMine && c.status === 'rejected' && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300"
                            >
                                <Pencil className="h-4 w-4" /> Koreksi & Kirim Ulang
                            </button>
                        )}
                        {isOwner && c.status === 'submitted' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setReturning(true)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                                >
                                    <Undo2 className="h-4 w-4 text-amber-300" /> Kembalikan
                                </button>
                                <button
                                    type="button"
                                    onClick={approve}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-emerald-400/30 transition-all hover:scale-105 hover:bg-emerald-300"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Setujui Setoran
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Error & Catatan Review */}
            {errors?.status && (
                <div className="flex items-center gap-3 rounded-3xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-800 shadow-sm">
                    <Ban className="h-5 w-5 shrink-0 text-rose-600" />
                    <span>{errors.status}</span>
                </div>
            )}
            {c.status === 'rejected' && (
                <div className="flex items-start gap-3 rounded-3xl bg-amber-50 border border-amber-200 p-4 text-sm font-bold text-amber-800 shadow-sm">
                    <Undo2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <span>Dikembalikan oleh <b>{c.reviewer?.username ?? '-'}</b>: {c.review_note}</span>
                </div>
            )}
            {c.status === 'approved' && (
                <div className="flex items-start gap-3 rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span>
                        Disetujui oleh <b>{c.reviewer?.username ?? '-'}</b> pada {fmt(c.reviewed_at)}.
                        {c.review_note ? ` Catatan: ${c.review_note}` : ''}
                    </span>
                </div>
            )}

            {/* Total Omset Utama */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl shadow-emerald-500/20 print:bg-none print:text-black print:border">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100 print:text-slate-600">
                    Total Penjualan {isGrosir ? 'Grosir' : 'Shift'} · #{c.id}
                </div>
                <div className="mt-2 text-3xl md:text-4xl font-black tracking-tight">{rp(c.total)}</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-emerald-100 print:bg-slate-100 print:text-slate-800">
                    <span>{num(c.sales_count)} transaksi sukses tercatat</span>
                </div>
            </div>

            {/* Grid 4 Metode Pembayaran */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {METHODS.map((m) => (
                    <div key={m.key} className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <div className={'inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ' + m.color}>
                            <m.icon className="h-5 w-5" />
                        </div>
                        <div className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
                        <div className="mt-1 text-xl font-black tracking-tight text-slate-800">{rp(by[m.key]?.total ?? 0)}</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">{num(by[m.key]?.count ?? 0)} transaksi</div>
                    </div>
                ))}
            </div>

            {/* Peringatan Transaksi Batal */}
            {c.voided_count > 0 && (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 border border-rose-200 p-5 text-sm font-bold text-rose-800 shadow-sm">
                    <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <span>Terdapat <b>{c.voided_count} transaksi dibatalkan</b> senilai <b>{rp(c.voided_total)}</b> (tidak dihitung dalam omset bersih di atas).</span>
                </div>
            )}

            {/* Rincian Pelanggan Grosir */}
            {isGrosir && customers.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-4">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <Users className="h-4 w-4" />
                        </div>
                        <span>Rincian Pembelian per Pelanggan / Agen</span>
                    </h2>
                    <ul className="divide-y divide-slate-100">
                        {customers.map((x, i) => (
                            <li key={i} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                                <span className="font-extrabold text-slate-800">{x.name}</span>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 mr-3">{x.count} transaksi</span>
                                    <span className="font-black text-emerald-600">{rp(x.total)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Panel Hitung Uang Laci */}
            {showLaci ? (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                    <div>
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <Calculator className="h-4 w-4" />
                            </div>
                            <span>Rekonsiliasi Kas / Uang di Laci</span>
                        </h2>
                        <p className="mt-1 text-xs md:text-sm text-slate-500 font-medium">Perbandingan modal awal, penjualan tunai, dan hasil hitung fisik di laci.</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-2.5 text-sm font-bold">
                        <div className="flex justify-between text-slate-600">
                            <span>Modal Awal Laci</span>
                            <span>{rp(c.opening_cash)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>+ Penjualan Tunai</span>
                            <span>{rp(tunai)}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-slate-900 font-black text-base">
                            <span>Seharusnya Ada di Laci</span>
                            <span className="text-indigo-600">{rp(c.expected_cash)}</span>
                        </div>
                        <div className="flex justify-between text-slate-800 font-extrabold pt-1">
                            <span>Hitungan Fisik Laci</span>
                            <span>{rp(c.counted_cash)}</span>
                        </div>
                    </div>

                    <div
                        className={
                            'flex items-center justify-between rounded-2xl px-5 py-4 font-black text-sm shadow-sm ' +
                            (d === 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : d < 0
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200')
                        }
                    >
                        <span className="uppercase tracking-wider">Status Laci: {d === 0 ? 'Sempurna (Cocok)' : d < 0 ? 'Selisih Kurang (Minus)' : 'Selisih Lebih (Plus)'}</span>
                        <span>{rp(Math.abs(d))}</span>
                    </div>

                    {c.note && (
                        <p className="text-xs md:text-sm text-slate-600 font-medium pt-2 border-t border-slate-100">
                            💬 Catatan {pengirim.toLowerCase()}: {c.note}
                        </p>
                    )}
                </section>
            ) : (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-3">
                    <p className="text-sm font-bold text-slate-700">Tidak ada penjualan tunai pada periode ini, sehingga rekonsiliasi laci kasir dilewati.</p>
                    {c.note && (
                        <p className="text-xs md:text-sm text-slate-600 font-medium pt-2 border-t border-slate-100">
                            💬 Catatan {pengirim.toLowerCase()}: {c.note}
                        </p>
                    )}
                </section>
            )}

            {/* Modal Kembalikan oleh Owner */}
            {returning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
                    <form onSubmit={giveBack} className="w-full max-w-md space-y-5 rounded-3xl border border-white/80 bg-white p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm mb-3">
                                <Undo2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Kembalikan ke {pengirim}</h2>
                            <p className="mt-1 text-xs md:text-sm text-slate-500 leading-relaxed">
                                {pengirim} akan dapat merevisi dan mengirim ulang laporan setoran ini.
                            </p>
                        </div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Catatan Revisi *</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="mis. Selisih laci terlalu besar, mohon hitung ulang fisik uang tunai..."
                                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {errors?.review_note && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {errors.review_note}</span>}
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setReturning(false)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                            >
                                Kembalikan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Koreksi oleh Kasir/Admin */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
                    <form onSubmit={resubmit} className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-white/80 bg-white shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:p-8 pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                    <Pencil className="h-5 w-5" />
                                </div>
                                <span>Koreksi & Kirim Ulang Setoran</span>
                            </h2>
                            <p className="mt-1.5 text-xs md:text-sm font-bold text-amber-800 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                                Catatan dari owner: {c.review_note}
                            </p>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-6 md:p-8">
                            {showLaci && (
                                <>
                                    <label className="block">
                                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Modal Awal Laci (Rp)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.opening_cash}
                                            onChange={(e) => setForm({ ...form, opening_cash: e.target.value })}
                                            className={fieldCls}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Uang di Laci (Hasil Hitung Fisik Ulang)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.counted_cash}
                                            onChange={(e) => setForm({ ...form, counted_cash: e.target.value })}
                                            className={fieldCls}
                                        />
                                    </label>
                                </>
                            )}
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Koreksi (Opsional)</span>
                                <textarea
                                    rows={3}
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="mis. Sudah dihitung ulang, selisih kas telah disesuaikan..."
                                    className={fieldCls}
                                />
                            </label>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 p-6 md:p-8 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                            >
                                Kirim Ulang ke Owner
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

SetoranDetail.layout = (page) => <KasirLayout>{page}</KasirLayout>;