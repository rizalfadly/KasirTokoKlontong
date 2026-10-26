import { CheckCircle2 } from 'lucide-react';
import { rp } from '../../lib/format';
import { CHANNELS, METHODS, PAY_LABEL } from './constants';

export default function PaymentPanel({
    total, count, channel, setChannel, method, setMethod,
    effectiveMethod, needsCash, paid, setPaid, change,
    errors, processing, canPay, onCheckout,
}) {
    const quick = [
        { label: 'Uang pas', value: total },
        { label: '20.000', value: 20000 },
        { label: '50.000', value: 50000 },
        { label: '100.000', value: 100000 },
    ];

    return (
        <div className="mt-4 space-y-3 border-t border-dashed border-slate-200 pt-4">
            <div className="flex items-center justify-between">
                <span className="text-slate-500">Total ({count} jenis)</span>
                <span className="text-2xl font-bold">{rp(total)}</span>
            </div>

            {/* Asal penjualan */}
            <div>
                <div className="mb-1.5 text-xs font-medium text-slate-500">Asal penjualan</div>
                <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => setChannel(c.key)}
                            className={
                                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                                (channel === c.key
                                    ? 'bg-orange-500 text-white shadow'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                            }
                        >
                            <c.icon className="h-4 w-4" />
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cara bayar (hanya offline) */}
            {channel === 'offline' && (
                <div>
                    <div className="mb-1.5 text-xs font-medium text-slate-500">Cara bayar</div>
                    <div className="flex flex-wrap gap-2">
                        {METHODS.map((m) => (
                            <button
                                key={m.key}
                                type="button"
                                onClick={() => setMethod(m.key)}
                                className={
                                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ' +
                                    (method === m.key
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200')
                                }
                            >
                                <m.icon className="h-3.5 w-3.5" />
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {needsCash ? (
                <>
                    <input
                        type="number"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        placeholder="Uang dibayar"
                        value={paid}
                        onChange={(e) => setPaid(e.target.value)}
                    />

                    {count > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {quick.map((q) => (
                                <button
                                    key={q.label}
                                    onClick={() => setPaid(String(q.value))}
                                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div
                        className={
                            'flex items-center justify-between rounded-xl px-4 py-3 ' +
                            (paid && change < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')
                        }
                    >
                        <span className="text-sm font-medium">{paid && change < 0 ? 'Kurang' : 'Kembalian'}</span>
                        <span className="text-lg font-bold">{paid ? rp(Math.abs(change)) : '-'}</span>
                    </div>
                </>
            ) : (
                <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    Pembayaran <b>{PAY_LABEL[effectiveMethod]}</b> sebesar <b>{rp(total)}</b>. Tidak ada kembalian.
                </div>
            )}

            {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
            {errors.paid && <p className="text-sm text-red-600">{errors.paid}</p>}
            {errors.channel && <p className="text-sm text-red-600">{errors.channel}</p>}
            {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}

            <button
                onClick={onCheckout}
                disabled={!canPay}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
                {processing ? (
                    'Memproses...'
                ) : (
                    <>
                        <CheckCircle2 className="h-5 w-5" /> Bayar
                    </>
                )}
            </button>
        </div>
    );
}