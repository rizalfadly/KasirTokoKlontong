import { useState } from 'react';
import { rp } from '../../lib/format';
import { TYPE_LABEL, TYPE_STYLE } from './constants';
import { Search, TrendingDown, Award, Package, ArrowUpRight } from 'lucide-react';

export default function PriceCompare({ suppliers }) {
    const [q, setQ] = useState('');

    // Kelompokkan harga per produk (hanya supplier aktif)
    const map = new Map();
    suppliers
        .filter((s) => s.is_active)
        .forEach((s) =>
            s.prices.forEach((p) => {
                if (!map.has(p.product_id)) map.set(p.product_id, { product: p.product, offers: [] });
                map.get(p.product_id).offers.push({ supplier: s, price: p.price });
            }),
        );

    const query = q.trim().toLowerCase();
    const rows = [...map.values()]
        .map((r) => ({ ...r, offers: [...r.offers].sort((a, b) => a.price - b.price) }))
        .filter(
            (r) =>
                !query ||
                (r.product?.name ?? '').toLowerCase().includes(query) ||
                (r.product?.sku ?? '').toLowerCase().includes(query),
        )
        .sort((a, b) => (a.product?.name ?? '').localeCompare(b.product?.name ?? ''));

    return (
        <div className="space-y-6">
            {/* Kolom Pencarian Produk */}
            <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:font-normal placeholder:text-slate-400"
                    placeholder="Cari produk atau SKU..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center text-slate-400 backdrop-blur-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 mb-3 text-slate-300 shadow-inner">
                        <Package className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-slate-700 text-base">Belum ada perbandingan harga</span>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Catat harga penawaran produk pada menu detail masing-masing supplier.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {rows.map((r) => {
                        const min = r.offers[0].price;

                        return (
                            <div key={r.product?.id} className="group rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
                                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                                    <div>
                                        <div className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{r.product?.name}</div>
                                        <div className="mt-0.5 font-mono text-[11px] font-bold text-slate-400">
                                            SKU: {r.product?.sku || '-'} &bull; Satuan: <span className="uppercase text-slate-600">{r.product?.unit}</span>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-600 border border-indigo-100">
                                        {r.offers.length} Supplier Menawarkan
                                    </span>
                                </div>

                                <ul className="space-y-2.5">
                                    {r.offers.map((o) => {
                                        const cheapest = r.offers.length > 1 && o.price === min;
                                        const diff = o.price - min;

                                        return (
                                            <li
                                                key={o.supplier.id}
                                                className={
                                                    'flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all ' +
                                                    (cheapest ? 'bg-emerald-50/80 border border-emerald-200 shadow-sm' : 'bg-slate-50/80 border border-slate-100')
                                                }
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-xs font-black text-slate-800">{o.supplier.name}</div>
                                                    <div className="mt-1">
                                                        <span className={'rounded-full px-2.5 py-0.5 text-[10px] font-black ' + TYPE_STYLE[o.supplier.type]}>
                                                            {TYPE_LABEL[o.supplier.type]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-black text-slate-900">{rp(o.price)}</div>
                                                    {cheapest ? (
                                                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                                            <Award className="h-3 w-3" /> Termurah
                                                        </div>
                                                    ) : (
                                                        diff > 0 && (
                                                            <div className="mt-0.5 text-[11px] font-bold text-rose-600">
                                                                +{rp(diff)} dari termurah
                                                        </div>
                                                        )
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}