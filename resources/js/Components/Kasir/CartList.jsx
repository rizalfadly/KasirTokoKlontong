import { useState } from 'react';
import { ShoppingCart, ShoppingBasket } from 'lucide-react';
import { rp, round3 } from '../../lib/format';

export default function CartList({ cart, setQty, onClear, isDec, stepOf, lineTotal }) {
    const [tick, setTick] = useState(0); // memaksa kolom jumlah menyegarkan tampilannya

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <ShoppingCart className="h-5 w-5 text-orange-500" />
                    Keranjang
                </h2>
                {cart.length > 0 && (
                    <button onClick={onClear} className="text-sm text-red-500 hover:underline">
                        Kosongkan
                    </button>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                    <ShoppingBasket className="mx-auto h-10 w-10" />
                    <p className="mt-2 text-sm">Belum ada item. Klik produk untuk menambah.</p>
                </div>
            ) : (
                <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
                    {cart.map((i) => (
                        <li key={i.id} className="rounded-xl bg-slate-50 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{i.name}</div>
                                    <div className="text-xs text-slate-500">
                                        {rp(i.price)} / {i.unit}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">{rp(lineTotal(i))}</div>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5">
                                <button
                                    onClick={() => setQty(i.id, round3(i.qty - stepOf(i.unit)))}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold hover:bg-slate-100"
                                >
                                    -
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
                                    className="w-20 rounded-lg border border-slate-200 bg-white py-1 text-center text-sm font-semibold outline-none focus:border-orange-400"
                                />
                                <button
                                    onClick={() => setQty(i.id, round3(i.qty + stepOf(i.unit)))}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold hover:bg-slate-100"
                                >
                                    +
                                </button>
                                <span className="text-xs text-slate-500">{i.unit}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}