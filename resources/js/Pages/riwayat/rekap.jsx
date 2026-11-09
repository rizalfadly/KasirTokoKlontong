import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Printer, Banknote, QrCode, Landmark, ShoppingBag, Ban, Send, Sparkles, Calculator, ShieldCheck, Users } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num, rp } from '../../lib/format';

const METHODS = [
    { key: 'tunai', label: 'Tunai', icon: Banknote, color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    { key: 'qris', label: 'QRIS', icon: QrCode, color: 'bg-sky-100 text-sky-700 border border-sky-200' },
    { key: 'transfer', label: 'Transfer', icon: Landmark, color: 'bg-violet-100 text-violet-700 border border-violet-200' },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'bg-amber-100 text-amber-700 border border-amber-200' },
];

const inputCls =
    'rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100';

export default function Rekap({
    kind = 'toko',
    filters,
    byMethod,
    byCustomer = [],
    total,
    count,
    voided,
    perKasir = [],
    scopeLabel,
    canSubmit,
}) {
    const isGrosir = kind === 'grosir';
    const [f, setF] = useState(filters);
    const [modal, setModal] = useState('');
    const [fisik, setFisik] = useState('');
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [err, setErr] = useState('');

    const tunai = byMethod.tunai?.total ?? 0;
    const showLaci = !isGrosir || tunai > 0;

    const seharusnya = Number(modal || 0) + tunai;
    const selisih = Number(fisik || 0) - seharusnya;
    const readyToSend = !sending && count > 0 && (showLaci ? fisik !== '' : true);

    function kirim() {
        if (!confirm('Kirim rekap setoran ini ke owner? Angka akan dikunci.')) return;
        router.post(
            '/setoran',
            {
                kind,
                date: f.date,
                from: f.from,
                to: f.to,
                opening_cash: showLaci ? Number(modal || 0) : 0,
                counted_cash: showLaci ? Number(fisik || 0) : 0,
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
        router.get(isGrosir ? '/grosir/rekap' : '/riwayat/rekap', v, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    const title = isGrosir ? 'Rekap Grosir & Agen' : 'Rekap Shift & Tutup Toko';

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
            <Head title={title} />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8 print:hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Calculator className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Pusat Rekap & Setoran Finansial</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            {title} 
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            {isGrosir ? 'Total penjualan grosir untuk dilaporkan ke owner.' : 'Total penjualan untuk serah terima shift atau tutup toko harian.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={isGrosir ? '/grosir' : '/riwayat'}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                        >
                            <ArrowLeft className="h-4 w-4" /> {isGrosir ? 'Kembali ke Grosir' : 'Kembali ke Riwayat'}
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300"
                        >
                            <Printer className="h-4 w-4" /> Cetak Rekap
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Periode */}
            <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl print:hidden">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tanggal
                    <input type="date" value={f.date} onChange={(e) => e.target.value && apply({ date: e.target.value })} className={inputCls + ' mt-1.5 block'} />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Dari Jam
                    <input type="time" value={f.from} onChange={(e) => e.target.value && apply({ from: e.target.value })} className={inputCls + ' mt-1.5 block'} />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sampai Jam
                    <input type="time" value={f.to} onChange={(e) => e.target.value && apply({ to: e.target.value })} className={inputCls + ' mt-1.5 block'} />
                </label>
                <div className="flex gap-2 pb-1">
                    <button
                        type="button"
                        onClick={() => apply({ from: '00:00', to: '23:59' })}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                    >
                        Seharian Penuh
                    </button>
                </div>
            </div>

            {/* Judul Cetak */}
            <div className="hidden print:block pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-black">{title}</h1>
                <p className="text-sm font-bold text-slate-600 mt-1">{scopeLabel} · Tanggal: {f.date} · Pukul {f.from} s.d. {f.to}</p>
            </div>

            {/* Total Penjualan Utama */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl shadow-emerald-500/20 print:bg-none print:text-black print:shadow-none print:border print:border-slate-300">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100 print:text-slate-600">
                    Total Omset Penjualan · {scopeLabel} ({f.from} - {f.to})
                </div>
                <div className="mt-2 text-3xl md:text-4xl font-black tracking-tight">{rp(total)}</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-emerald-100 print:bg-slate-100 print:text-slate-800">
                    <span>{num(count)} transaksi sukses tercatat</span>
                </div>
            </div>

            {/* Grid Per Cara Bayar (4 Metode) */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {METHODS.map((m) => (
                    <div key={m.key} className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <div className={'inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ' + m.color}>
                            <m.icon className="h-5 w-5" />
                        </div>
                        <div className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
                        <div className="mt-1 text-xl font-black tracking-tight text-slate-800">{rp(byMethod[m.key]?.total ?? 0)}</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">{num(byMethod[m.key]?.count ?? 0)} transaksi</div>
                    </div>
                ))}
            </div>

            {/* Peringatan Transaksi Batal */}
            {voided.count > 0 && (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 border border-rose-200 p-5 text-sm font-bold text-rose-800 shadow-sm">
                    <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <span className="leading-relaxed">
                        Terdapat <b>{voided.count} transaksi dibatalkan</b> senilai <b>{rp(voided.total)}</b> (tidak dihitung dalam omset bersih di atas). Pastikan fisik uang tunai transaksi batal sudah dikembalikan ke pelanggan apabila sebelumnya dibayar tunai.
                    </span>
                </div>
            )}

            {/* Rincian Per Pelanggan (Grosir) */}
            {isGrosir && byCustomer.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-4">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <Users className="h-4 w-4" />
                        </div>
                        <span>Rincian Penjualan per Pelanggan / Agen</span>
                    </h2>
                    <ul className="divide-y divide-slate-100">
                        {byCustomer.map((c, i) => (
                            <li key={i} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                                <span className="font-extrabold text-slate-800">{c.name}</span>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 mr-3">{c.count} transaksi</span>
                                    <span className="font-black text-emerald-600">{rp(c.total)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Panel Hitung Uang Laci / Kasir */}
            {showLaci ? (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                    <div>
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <Banknote className="h-4 w-4" />
                            </div>
                            <span>Perhitungan Fisik Kas / Uang di Laci</span>
                        </h2>
                        <p className="mt-1 text-xs md:text-sm text-slate-500 font-medium">Hanya transaksi tunai yang masuk ke dalam perhitungan fisik laci kasir.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Modal Awal Laci (Rp)</span>
                            <input
                                type="number"
                                min="0"
                                value={modal}
                                onChange={(e) => setModal(e.target.value)}
                                placeholder="0"
                                className={inputCls + ' w-full'}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Uang Fisik di Laci Sekarang (Hasil Hitung)</span>
                            <input
                                type="number"
                                min="0"
                                value={fisik}
                                onChange={(e) => setFisik(e.target.value)}
                                placeholder="0"
                                className={inputCls + ' w-full'}
                            />
                        </label>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-sm font-bold">
                        <div className="flex justify-between text-slate-600">
                            <span>Modal Awal Laci</span>
                            <span>{rp(Number(modal || 0))}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>+ Total Penjualan Tunai</span>
                            <span>{rp(tunai)}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-slate-900 font-black text-base">
                            <span>Seharusnya Ada di Laci</span>
                            <span className="text-indigo-600">{rp(seharusnya)}</span>
                        </div>
                    </div>

                    {fisik !== '' && (
                        <div
                            className={
                                'flex items-center justify-between rounded-2xl px-5 py-4 font-black text-sm shadow-sm ' +
                                (selisih === 0
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : selisih < 0
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200')
                            }
                        >
                            <span className="uppercase tracking-wider">Status Kas: {selisih === 0 ? 'Sempurna (Cocok)' : selisih < 0 ? 'Selisih Kurang (Minus)' : 'Selisih Lebih (Plus)'}</span>
                            <span>{selisih === 0 ? rp(0) : rp(Math.abs(selisih))}</span>
                        </div>
                    )}
                </section>
            ) : (
                <div className="flex items-center gap-3 rounded-3xl bg-sky-50 border border-sky-200 p-5 text-sm font-bold text-sky-800 shadow-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-sky-600" />
                    <span>Tidak ada transaksi tunai pada periode ini, sehingga perhitungan fisik laci kasir dilewati.</span>
                </div>
            )}

            {/* Form Submit Kirim Setoran ke Owner */}
            {canSubmit && (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl print:hidden space-y-4">
                    <h2 className="text-base font-black text-slate-800">Kirim Laporan Setoran</h2>
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Catatan tambahan untuk owner (opsional)..."
                        className={inputCls + ' w-full'}
                    />
                    {err && <p className="text-xs font-extrabold text-rose-600">⚠️ {err}</p>}
                    <button
                        type="button"
                        onClick={kirim}
                        disabled={!readyToSend}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-sm font-black text-slate-900 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:bg-amber-300 disabled:opacity-40"
                    >
                        <Send className="h-5 w-5" /> {sending ? 'Mengirim Rekap...' : 'Kirim Laporan Setoran ke Owner'}
                    </button>
                </section>
            )}

            {/* Per Kasir (Tampilan Owner) */}
            {perKasir.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-4">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                            <Users className="h-4 w-4" />
                        </div>
                        <span>Kinerja Penjualan per Kasir</span>
                    </h2>
                    <ul className="divide-y divide-slate-100">
                        {perKasir.map((k) => (
                            <li key={k.username} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">
                                        {k.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-extrabold text-slate-800">{k.username}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 mr-3">{k.count} transaksi</span>
                                    <span className="font-black text-emerald-600">{rp(k.total)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

Rekap.layout = (page) => <KasirLayout>{page}</KasirLayout>;