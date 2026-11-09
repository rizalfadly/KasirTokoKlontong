import { Search, Egg, PackageX, CheckCircle, Sparkles } from 'lucide-react';
import { num, rp } from '../../lib/format';
import ProductThumb from '../ProductThumb';

export default function ProductGrid({ products, cart, search, onSearch, onScan, scanMsg, onAdd }) {
    return (
        <section className="space-y-4 lg:col-span-2">
            {/* Kolom Pencarian & Barcode Scanner */}
            <div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                        placeholder="Scan barcode produk atau ketik nama barang..."
                        onKeyDown={onScan}
                        autoFocus
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                {scanMsg && (
                    <div
                        className={
                            'mt-2.5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-sm ' +
                            (scanMsg.ok ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200')
                        }
                    >
                        <span>{scanMsg.ok ? '✅' : '⚠️'}</span>
                        <span>{scanMsg.text}</span>
                    </div>
                )}
            </div>

            {/* Empty State Jika Produk Kosong */}
            {products.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-slate-400 backdrop-blur-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 mb-3 text-slate-300 shadow-inner">
                        <PackageX className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-slate-700 text-base">Produk tidak ditemukan</span>
                    <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau periksa kembali kode barcode.</p>
                </div>
            )}

            {/* Grid Kartu Produk */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p) => {
                    const inCart = cart.find((i) => i.id === p.id)?.qty ?? 0;
                    const full = inCart >= p.stock;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onAdd(p)}
                            disabled={full}
                            className={
                                'group relative flex flex-col justify-between rounded-3xl border bg-white p-4 text-left shadow-sm transition-all duration-300 ' +
                                (full
                                    ? 'cursor-not-allowed border-slate-100 opacity-50 bg-slate-50'
                                    : 'border-slate-100/80 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95')
                            }
                        >
                            {/* Badge Qty di Keranjang */}
                            {inCart > 0 && (
                                <span className="absolute right-3 top-3 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 text-xs font-black text-white shadow-lg shadow-indigo-500/30 animate-in zoom-in-95">
                                    {num(inCart)}
                                </span>
                            )}

                            <div>
                                <div className="overflow-hidden rounded-2xl bg-slate-50 mb-3 p-2">
                                    <ProductThumb product={p} />
                                </div>
                                <div className="line-clamp-2 text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    {p.name}
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-50">
                                <div className="font-black text-emerald-600 text-base">
                                    {rp(p.price)}
                                    <span className="text-[11px] font-bold text-slate-400"> / {p.unit}</span>
                                </div>
                                <div
                                    className={
                                        'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ' +
                                        (p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700')
                                    }
                                >
                                    <span>Stok: {num(p.stock)} {p.unit}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}