import { useState } from 'react';
import { rp } from '../../lib/format';
import { TYPE_LABEL, TYPE_STYLE } from './constants';

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
        <div className="space-y-4">
            <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:w-80"
                placeholder="🔍 Cari produk atau SKU"
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />

            {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-12 text-center text-sm text-slate-400">
                    Belum ada harga yang bisa dibandingkan. Catat harga produk di detail supplier.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {rows.map((r) => {
                        const min = r.offers[0].price;

                        return (
                            <div key={r.product?.id} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-md">
                                <div className="font-semibold">{r.product?.name}</div>
                                <div className="mb-3 font-mono text-xs text-slate-400">
                                    {r.product?.sku} · per {r.product?.unit}
                                </div>
                                <ul className="space-y-2">
                                    {r.offers.map((o) => {
                                        const cheapest = r.offers.length > 1 && o.price === min;
                                        const diff = o.price - min;

                                        return (
                                            <li
                                                key={o.supplier.id}
                                                className={
                                                    'flex items-center gap-3 rounded-xl px-3 py-2 ' +
                                                    (cheapest ? 'bg-emerald-50' : 'bg-slate-50')
                                                }
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium">{o.supplier.name}</div>
                                                    <span className={'rounded-full px-2 py-0.5 text-[10px] font-semibold ' + TYPE_STYLE[o.supplier.type]}>
                                                        {TYPE_LABEL[o.supplier.type]}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold">{rp(o.price)}</div>
                                                    {cheapest ? (
                                                        <div className="text-xs font-semibold text-emerald-700">Termurah</div>
                                                    ) : (
                                                        diff > 0 && <div className="text-xs text-red-500">+{rp(diff)}</div>
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