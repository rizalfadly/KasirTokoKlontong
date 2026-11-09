import { CheckCircle2, CreditCard, ChevronDown, Store } from 'lucide-react';
import { rp } from '../../lib/format';
import { CHANNELS, METHODS, PAY_LABEL } from './constants';
import { useState } from 'react';

export default function PaymentPanel({
    total, count, channel, setChannel, method, setMethod,
    effectiveMethod, needsCash, paid, setPaid, change,
    errors, processing, canPay, onCheckout, grosir = false,
}) {
    const [showOptions, setShowOptions] = useState(false);
    const quick = [
        { label: 'Uang Pas', value: total },
        { label: '20rb', value: 20000 },
        { label: '50rb', value: 50000 },
        { label: '100rb', value: 100000 },
    ];

    const currentChannelLabel = CHANNELS.find(c => c.key === channel)?.label ?? 'Offline';
    const currentMethodLabel = METHODS.find(m => m.key === method)?.label ?? 'Tunai';

    return (
        <div className="space-y-2 pt-1 shrink-0 bg-white/5">
            
            {/* Ringkasan Total & Status Cepat (Bisa diklik untuk ubah channel/metode jika darurat) */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 px-4 py-3 text-white shadow-md">
                <div>
                    <div className="text-[10px] font-medium text-slate-400">Total Pembayaran ({count} item)</div>
                    <div className="text-lg font-black text-amber-300">{rp(total)}</div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-indigo-200 hover:bg-white/20 transition-colors"
                >
                    <span>{currentChannelLabel} • {currentMethodLabel}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Panel Pilihan Asal & Metode (Tersembunyi secara default agar keranjang luas, muncul jika tombol panah di atas diklik) */}
            {showOptions && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-2.5 animate-in fade-in duration-200">
                    <div>
                        <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Asal Penjualan</label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                        >
                            {CHANNELS.map((c) => (
                                <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    {(channel === 'offline' || grosir) && (
                        <div>
                            <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Metode Bayar</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                            >
                                {METHODS.map((m) => (
                                    <option key={m.key} value={m.key}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Input Pembayaran Tunai (Hanya muncul jika kasir pilih Tunai) */}
            {needsCash ? (
                <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-2.5">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="block mb-0.5 text-[10px] font-bold text-slate-700">Nominal Uang Diterima</label>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                                <input
                                    type="number"
                                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2 py-1.5 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 shadow-inner"
                                    placeholder="0"
                                    value={paid}
                                    onChange={(e) => setPaid(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Info Kembalian */}
                        <div className="w-32 text-right">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                                {paid && change < 0 ? 'Kurang' : 'Kembali'}
                            </span>
                            <span className={`text-xs font-black ${paid && change < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {paid ? rp(Math.abs(change)) : 'Rp 0'}
                            </span>
                        </div>
                    </div>

                    {/* Tombol Uang Cepat (Quick Cash) */}
                    {count > 0 && (
                        <div className="flex gap-1">
                            {quick.map((q) => (
                                <button
                                    key={q.label}
                                    type="button"
                                    onClick={() => setPaid(String(q.value))}
                                    className="flex-1 rounded-lg bg-white border border-slate-200 py-1 text-[10px] font-extrabold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-semibold text-sky-800 flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                    <span>Bayar via <b>{PAY_LABEL[effectiveMethod]}</b> sebesar <b>{rp(total)}</b>.</span>
                </div>
            )}

            {/* Pesan Error Validasi */}
            {(errors.items || errors.paid || errors.channel || errors.payment_method) && (
                <p className="text-[10px] font-bold text-rose-600">⚠️ {errors.items || errors.paid || errors.channel || errors.payment_method}</p>
            )}

            {/* Tombol Eksekusi Bayar / Checkout */}
            <button
                type="button"
                onClick={onCheckout}
                disabled={!canPay}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] disabled:opacity-40"
            >
                {processing ? (
                    <span className="animate-pulse">Memproses...</span>
                ) : (
                    <>
                        <CheckCircle2 className="h-4 w-4 text-amber-300" />
                        <span>Selesaikan Pembayaran ({rp(total)})</span>
                    </>
                )}
            </button>
        </div>
    );
}