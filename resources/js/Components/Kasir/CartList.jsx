import { useState } from 'react';
import { ShoppingCart, ShoppingBasket, Trash2, Plus, Minus, Sparkles } from 'lucide-react';
import { rp, num, round3 } from '../../lib/format';

export default function CartList({ cart, orders, setQty, onClear, isDec, stepOf, lineTotal, unitPrice, quotas, grosir }) {
    const [tick, setTick] = useState(0);

    return (
        <div className="space-y-3">
            {/* Header Keranjang (Dibuat Lebih Ramping) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shadow-sm">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span>Keranjang</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                        {cart.length}
                    </span>
                </h2>
                {cart.length > 0 && (
                    <button
                        onClick={onClear}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-100"
                    >
                        <Trash2 className="h-3 w-3" /> Kosongkan
                    </button>
                )}
            </div>

            {/* Konten Keranjang */}
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 mb-2 text-slate-300 shadow-inner">
                        <ShoppingBasket className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-slate-600 text-xs">Keranjang masih kosong</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[180px]">Pilih atau scan produk untuk transaksi.</p>
                </div>
            ) : (
                /* Diperluas max-h-[48vh] agar muat menampilkan banyak item sekaligus (sekitar 8-10 produk) */
                <ul className="max-h-[48vh] space-y-2.5 overflow-y-auto pr-1">
                    {cart.map((i) => (
                        <li key={i.id} className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-xs font-extrabold text-slate-800">{i.name}</div>
                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                                        {rp(unitPrice ? unitPrice(i) : i.price)} / {i.unit}
                                    </div>

                                    {/* Info Grosir */}
                                    {grosir && i.wholesale_price != null && i.qty < Number(i.wholesale_min_qty) && (
                                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
                                            <Sparkles className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                                            <span>Tambah {num(round3(Number(i.wholesale_min_qty) - i.qty))} {i.unit} lagi untuk grosir</span>
                                        </div>
                                    )}

                                    {/* Info Kuota */}
                                    {quotas?.[i.id] !== undefined && (
                                        <div className={'mt-0.5 text-[11px] ' + (i.qty > quotas[i.id] ? 'font-bold text-rose-600' : 'text-slate-500')}>
                                            Sisa jatah: {num(quotas[i.id])} {i.unit}
                                        </div>
                                    )}

                                    {/* Info Kesempatan Beli */}
                                    {orders?.[i.id] !== undefined && (
                                        <div className={'mt-0.5 text-[11px] ' + (orders[i.id] === 0 ? 'font-bold text-rose-600' : 'text-slate-500')}>
                                            Sisa kesempatan beli: {orders[i.id]}x
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-black text-emerald-600 shrink-0">{rp(lineTotal(i))}</div>
                            </div>

                            {/* Kontrol Qty Lebih Ramping */}
                            <div className="mt-2.5 flex items-center justify-between border-t border-slate-50 pt-2">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setQty(i.id, round3(i.qty - stepOf(i.unit)))}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-600 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <input
                                        key={`${i.id}-${i.qty}-${tick}`}
                                        type="number"
                                        min="0"
                                        step={isDec(i.unit) ? '0.001' : '1'}
                                        defaultValue={i.qty}
                                        onBlur={(e) => {
                                            setQty(i.id, e.target.value);
                                            setTick((t) => t + 1);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                        className="w-16 rounded-lg border border-slate-200 bg-slate-50/50 py-1 text-center text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQty(i.id, round3(i.qty + stepOf(i.unit)))}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-600 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                    <span className="ml-1 text-[11px] font-bold text-slate-400 uppercase">{i.unit}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}