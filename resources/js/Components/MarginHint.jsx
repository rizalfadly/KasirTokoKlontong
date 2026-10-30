import { rp } from '../lib/format';

// Menampilkan margin langsung saat harga jual dan harga beli diisi
export default function MarginHint({ price, cost }) {
    const p = Number(price);
    const c = Number(cost);

    if (price === '' || cost === '' || !Number.isFinite(p) || !Number.isFinite(c)) {
        return <p className="text-xs text-slate-400">Isi harga jual dan harga beli untuk melihat margin.</p>;
    }

    const margin = p - c;
    const pct = p > 0 ? Math.round((margin / p) * 1000) / 10 : 0;
    const loss = margin < 0;

    return (
        <div className={'rounded-xl px-3 py-2 text-sm ' + (loss ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')}>
            Margin {margin >= 0 ? '+' : ''}
            {rp(margin)} per satuan ({pct}% dari harga jual){loss && ' · harga jual di bawah modal!'}
        </div>
    );
}