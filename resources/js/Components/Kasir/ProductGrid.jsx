import { Search, Egg } from 'lucide-react';
import { num, rp } from '../../lib/format';
import ProductThumb from '../ProductThumb';

export default function ProductGrid({ products, cart, search, onSearch, onScan, scanMsg, onAdd }) {
    return (
        <section className="space-y-4 lg:col-span-2">
            <div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        placeholder="Scan barcode atau cari produk..."
                        onKeyDown={onScan}
                        autoFocus
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                {scanMsg && (
                    <div
                        className={
                            'mt-2 rounded-xl px-4 py-2 text-sm font-medium ' +
                            (scanMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')
                        }
                    >
                        {scanMsg.text}
                    </div>
                )}
            </div>

            {products.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
                    <Egg className="mx-auto h-10 w-10" />
                    <p className="mt-2 text-sm">Produk tidak ditemukan atau stok habis.</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p) => {
                    const inCart = cart.find((i) => i.id === p.id)?.qty ?? 0;
                    const full = inCart >= p.stock;
                    return (
                        <button
                            key={p.id}
                            onClick={() => onAdd(p)}
                            disabled={full}
                            className={
                                'relative rounded-2xl border bg-white p-4 text-left shadow-sm transition ' +
                                (full
                                    ? 'cursor-not-allowed border-slate-100 opacity-50'
                                    : 'border-slate-100 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md active:scale-95')
                            }
                        >
                            {inCart > 0 && (
                                <span className="absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-bold text-white">
                                    {num(inCart)}
                                </span>
                            )}
                            <ProductThumb product={p} />
                            <div className="mt-3 line-clamp-2 font-semibold leading-snug">{p.name}</div>
                            <div className="mt-1 font-bold text-orange-600">
                                {rp(p.price)}
                                <span className="text-xs font-normal text-slate-400"> / {p.unit}</span>
                            </div>
                            <div
                                className={
                                    'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                                    (p.stock <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700')
                                }
                            >
                                Stok {num(p.stock)} {p.unit}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}