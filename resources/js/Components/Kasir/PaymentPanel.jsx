import { CheckCircle2, Wallet, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { rp } from '../../lib/format';
import { CHANNELS, METHODS, PAY_LABEL } from './constants';

export default function PaymentPanel({
    total, count, channel, setChannel, method, setMethod,
    effectiveMethod, needsCash, paid, setPaid, change,
    errors, processing, canPay, onCheckout, grosir = false,
}) {
    const quick = [
        { label: 'Uang Pas', value: total },
        { label: '20.000', value: 20000 },
        { label: '50.000', value: 50000 },
        { label: '100.000', value: 100000 },
    ];

    return (
        <div className="space-y-3 pt-1">
            {/* Ringkasan Total */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 p-3.5 text-white shadow-md">
                <div>
                    <div className="text-[11px] font-medium text-slate-400">Total Pembayaran</div>
                    <div className="text-[11px] text-indigo-300 font-semibold">{count} jenis produk</div>
                </div>
                <div className="text-lg md:text-xl font-black text-amber-300">{rp(total)}</div>
            </div>

            {/* Asal Penjualan (Channel) */}
            <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Asal Penjualan</div>
                <div className="grid grid-cols-3 gap-1.5">
                    {CHANNELS.map((c) => {
                        const isSelected = channel === c.key;
                        return (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => setChannel(c.key)}
                                className={
                                    'flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-bold transition-all duration-300 ' +
                                    (isSelected
                                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'border border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100')
                                }
                            >
                                <c.icon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                                <span className="truncate">{c.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cara Bayar (Hanya jika offline atau grosir) */}
            {(channel === 'offline' || grosir) && (
                <div>
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Metode Pembayaran</div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {METHODS.map((m) => {
                            const isSelected = method === m.key;
                            return (
                                <button
                                    key={m.key}
                                    type="button"
                                    onClick={() => setMethod(m.key)}
                                    className={
                                        'flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-bold transition-all duration-300 ' +
                                        (isSelected
                                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                                            : 'border border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100')
                                    }
                                >
                                    <m.icon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                                    <span className="truncate">{m.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Input Pembayaran Tunai atau Info Marketplace */}
            {needsCash ? (
                <div className="space-y-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                    <div>
                        <label className="block mb-1 text-[11px] font-bold text-slate-700">Nominal Uang Diterima</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-base font-black text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-inner"
                                placeholder="0"
                                value={paid}
                                onChange={(e) => setPaid(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tombol Uang Cepat (Quick Cash) */}
                    {count > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {quick.map((q) => (
                                <button
                                    key={q.label}
                                    type="button"
                                    onClick={() => setPaid(String(q.value))}
                                    className="flex-1 rounded-lg bg-white border border-slate-200 px-2 py-1.5 text-[11px] font-extrabold text-indigo-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Informasi Kembalian atau Kekurangan */}
                    <div
                        className={
                            'flex items-center justify-between rounded-lg px-3 py-2 shadow-sm ' +
                            (paid && change < 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                        }
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                            {paid && change < 0 ? 'Kurang Pembayaran' : 'Uang Kembalian'}
                        </span>
                        <span className="text-sm font-black">
                            {paid ? rp(Math.abs(change)) : 'Rp 0'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-[11px] font-semibold text-sky-800 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white shadow">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                        <span>Pembayaran via <b>{PAY_LABEL[effectiveMethod]}</b> sebesar <b>{rp(total)}</b>.</span>
                    </div>
                </div>
            )}

            {/* Pesan Error Validasi */}
            <div className="space-y-1">
                {errors.items && <p className="text-[11px] font-bold text-rose-600">⚠️ {errors.items}</p>}
                {errors.paid && <p className="text-[11px] font-bold text-rose-600">⚠️ {errors.paid}</p>}
                {errors.channel && <p className="text-[11px] font-bold text-rose-600">⚠️ {errors.channel}</p>}
                {errors.payment_method && <p className="text-[11px] font-bold text-rose-600">⚠️ {errors.payment_method}</p>}
                {errors.customer_id && <p className="text-[11px] font-bold text-rose-600">⚠️ {errors.customer_id}</p>}
            </div>

            {/* Tombol Eksekusi Bayar / Checkout */}
            <button
                type="button"
                onClick={onCheckout}
                disabled={!canPay}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
            >
                {processing ? (
                    <span className="animate-pulse">Memproses...</span>
                ) : (
                    <>
                        <CheckCircle2 className="h-5 w-5 text-amber-300" />
                        <span>Selesaikan Pembayaran ({rp(total)})</span>
                    </>
                )}
            </button>
        </div>
    );
}