import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Printer, Banknote, QrCode, Landmark, ShoppingBag, Ban, Send } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num, rp } from '../../lib/format';

const METHODS = [
    { key: 'tunai', label: 'Tunai', icon: Banknote, color: 'bg-emerald-100 text-emerald-700' },
    { key: 'qris', label: 'QRIS', icon: QrCode, color: 'bg-sky-100 text-sky-700' },
    { key: 'transfer', label: 'Transfer', icon: Landmark, color: 'bg-violet-100 text-violet-700' },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'bg-amber-100 text-amber-700' },
];

const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

export default function Rekap({ filters, byMethod, total, count, voided, perKasir, scopeLabel }) {
    const [f, setF] = useState(filters);
    const [modal, setModal] = useState('');
    const [fisik, setFisik] = useState('');
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [err, setErr] = useState('');

    function kirim() {
        if (!confirm('Kirim rekap ini ke owner? Angka akan dikunci.')) return;
        router.post(
            '/setoran',
            {
                date: f.date,
                from: f.from,
                to: f.to,
                opening_cash: Number(modal || 0),
                counted_cash: Number(fisik || 0),
                note,
            },
            {
                onStart: () => { setSending(true); setErr(''); },
                onFinish: () => setSending(false),
                onError: (e) => setErr(Object.values(e)[0]),
            },
        );
    }

    function apply(next) {
        const v = { ...f, ...next };
        setF(v);
        router.get('/riwayat/rekap', v, { preserveState: true, preserveScroll: true, replace: true });
    }

    const tunai = byMethod.tunai?.total ?? 0;
    const seharusnya = Number(modal || 0) + tunai;
    const selisih = Number(fisik || 0) - seharusnya;

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
            <Head title="Rekap Shift" />

            <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
                <div>
                    <Link href="/riwayat" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Riwayat
                    </Link>
                    <h1 className="mt-1 text-2xl font-bold">Rekap Shift</h1>
                    <p className="text-sm text-slate-500">Total penjualan untuk serah terima shift atau tutup toko.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                >
                    <Printer className="h-4 w-4" /> Cetak
                </button>
            </div>

            {/* Filter periode */}
            <div className="flex flex-wrap items-end gap-3 print:hidden">
                <label className="text-xs font-medium text-slate-500">
                    Tanggal
                    <input type="date" value={f.date} onChange={(e) => e.target.value && apply({ date: e.target.value })} className={inputCls + ' mt-1 block'} />
                </label>
                <label className="text-xs font-medium text-slate-500">
                    Dari jam
                    <input type="time" value={f.from} onChange={(e) => e.target.value && apply({ from: e.target.value })} className={inputCls + ' mt-1 block'} />
                </label>
                <label className="text-xs font-medium text-slate-500">
                    Sampai jam
                    <input type="time" value={f.to} onChange={(e) => e.target.value && apply({ to: e.target.value })} className={inputCls + ' mt-1 block'} />
                </label>
                <div className="flex gap-2 pb-0.5">
                    <button onClick={() => apply({ from: '00:00', to: '23:59' })} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-orange-50">
                        Seharian
                    </button>
                </div>
            </div>

            {/* Judul cetak */}
            <div className="hidden print:block">
                <h1 className="text-xl font-bold">Rekap Shift</h1>
                <p className="text-sm">{scopeLabel} · {f.date} · {f.from} - {f.to}</p>
            </div>

            {/* Total */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-200 print:bg-none print:text-black print:shadow-none print:border">
                <div className="text-sm text-orange-50 print:text-slate-600">
                    Total penjualan · {scopeLabel} · {f.from} - {f.to}
                </div>
                <div className="mt-1 text-4xl font-bold">{rp(total)}</div>
                <div className="mt-1 text-sm text-orange-50 print:text-slate-600">{num(count)} transaksi</div>
            </div>

            {/* Per cara bayar */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {METHODS.map((m) => (
                    <div key={m.key} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className={'inline-flex h-9 w-9 items-center justify-center rounded-xl ' + m.color}>
                            <m.icon className="h-4 w-4" />
                        </div>
                        <div className="mt-3 text-xs text-slate-500">{m.label}</div>
                        <div className="text-lg font-bold">{rp(byMethod[m.key]?.total ?? 0)}</div>
                        <div className="text-xs text-slate-400">{num(byMethod[m.key]?.count ?? 0)} transaksi</div>
                    </div>
                ))}
            </div>

            {voided.count > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    <Ban className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        {voided.count} transaksi dibatalkan ({rp(voided.total)}), tidak dihitung di atas. Kalau transaksi tunai
                        dibatalkan, pastikan uangnya sudah dikembalikan ke pelanggan.
                    </span>
                </div>
            )}

            {/* Hitung laci */}
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Hitung uang di laci</h2>
                <p className="text-sm text-slate-500">Hanya penjualan tunai yang masuk laci.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-600">
                        Modal awal laci (Rp)
                        <input type="number" min="0" value={modal} onChange={(e) => setModal(e.target.value)} placeholder="0" className={inputCls + ' mt-1 block w-full'} />
                    </label>
                    <label className="block text-sm font-medium text-slate-600">
                        Uang di laci sekarang (hitungan fisik)
                        <input type="number" min="0" value={fisik} onChange={(e) => setFisik(e.target.value)} placeholder="0" className={inputCls + ' mt-1 block w-full'} />
                    </label>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Modal awal</span><span>{rp(Number(modal || 0))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">+ Penjualan tunai</span><span>{rp(tunai)}</span></div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-semibold">
                        <span>Seharusnya ada di laci</span><span>{rp(seharusnya)}</span>
                    </div>
                </div>

                {fisik !== '' && (
                    <div
                        className={
                            'mt-4 flex items-center justify-between rounded-xl px-4 py-3 font-semibold ' +
                            (selisih === 0 ? 'bg-emerald-50 text-emerald-700' : selisih < 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700')
                        }
                    >
                        <span>{selisih === 0 ? 'Cocok' : selisih < 0 ? 'Kurang' : 'Lebih'}</span>
                        <span>{selisih === 0 ? rp(0) : rp(Math.abs(selisih))}</span>
                    </div>
                )}
            </section>

            {perKasir.length === 0 && (   // hanya kasir (bukan owner) yang mengirim
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm print:hidden">
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Catatan untuk owner (opsional), mis. selisih karena uang kembalian"
                        className={inputCls + ' w-full'}
                    />
                    {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
                    <button
                        onClick={kirim}
                        disabled={sending || fisik === '' || count === 0}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 font-bold text-white shadow-md shadow-orange-200 hover:brightness-105 disabled:opacity-40"
                    >
                        <Send className="h-5 w-5" /> {sending ? 'Mengirim...' : 'Kirim ke owner'}
                    </button>
                </section>
            )}

            {/* Per kasir (owner/admin) */}
            {perKasir.length > 0 && (
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 font-semibold">Per kasir</h2>
                    <ul className="divide-y divide-slate-100">
                        {perKasir.map((k) => (
                            <li key={k.username} className="flex items-center gap-3 py-3 text-sm">
                                <span className="flex-1 font-medium">{k.username}</span>
                                <span className="text-slate-400">{k.count} transaksi</span>
                                <span className="font-semibold text-emerald-700">{rp(k.total)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

Rekap.layout = (page) => <KasirLayout>{page}</KasirLayout>;