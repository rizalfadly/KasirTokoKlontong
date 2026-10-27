import { useForm } from '@inertiajs/react';
import { num, rp } from '../lib/format';

export default function StockModal({
    product,
    decimalUnits = ['kilo', 'liter'],
    isOwner = false,
    suppliers = [],
    supplierPrices = [],
    onClose,
}) {
    const form = useForm({ mode: 'masuk', qty: '', reason: '', supplier_id: '', unit_cost: '' });
    const dec = decimalUnits.includes(product.unit);
    const masuk = form.data.mode === 'masuk';

    const qty = parseFloat(String(form.data.qty).replace(',', '.'));
    const after = Number.isFinite(qty) ? Math.round((masuk ? product.stock + qty : qty) * 1000) / 1000 : null;
    const cost = form.data.unit_cost === '' ? null : Number(form.data.unit_cost);
    const total = masuk && Number.isFinite(qty) && cost !== null ? Math.round(qty * cost) : null;

    // Memilih supplier: harga dan alasan terisi otomatis kalau tersedia
    function pickSupplier(id) {
        const supplier = suppliers.find((s) => String(s.id) === id);
        const listed = supplierPrices.find((p) => String(p.supplier_id) === id && p.product_id === product.id);
        const auto = !form.data.reason || form.data.reason.startsWith('Kulakan dari ');

        form.setData({
            ...form.data,
            supplier_id: id,
            unit_cost: listed ? String(listed.price) : form.data.unit_cost,
            reason: auto ? (supplier ? `Kulakan dari ${supplier.name}` : '') : form.data.reason,
        });
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/produk/${product.id}/stok`, { preserveScroll: true, onSuccess: onClose });
    }

    const tab = (active) =>
        'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ' +
        (active ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800');

    const inputClass =
        'w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={submit} className="my-6 w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                <div>
                    <h2 className="text-lg font-bold">📦 Ubah stok</h2>
                    <p className="text-sm text-slate-500">
                        {product.name} <span className="font-mono text-xs text-slate-400">({product.sku})</span>
                    </p>
                    <p className="mt-1 text-sm">
                        Stok sekarang:{' '}
                        <b>
                            {num(product.stock)} {product.unit}
                        </b>
                    </p>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                    <button type="button" onClick={() => form.setData('mode', 'masuk')} className={tab(masuk)}>
                        Stok masuk
                    </button>
                    {isOwner && (
                        <button type="button" onClick={() => form.setData('mode', 'koreksi')} className={tab(!masuk)}>
                            Koreksi stok
                        </button>
                    )}
                </div>
                {!isOwner && (
                    <p className="text-xs text-slate-400">
                        Koreksi stok khusus owner. Untuk selisih hitungan, gunakan Stok Opname.
                    </p>
                )}

                <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-600">
                        {masuk ? `Jumlah barang masuk (${product.unit})` : `Stok seharusnya (${product.unit})`}
                    </span>
                    <input
                        type="number"
                        min="0"
                        step={dec ? '0.001' : '1'}
                        autoFocus
                        value={form.data.qty}
                        onChange={(e) => form.setData('qty', e.target.value)}
                        className={inputClass + ' text-lg'}
                    />
                    {form.errors.qty && <span className="mt-1 block text-xs text-red-600">{form.errors.qty}</span>}
                </label>

                {after !== null && (
                    <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                        Stok setelah disimpan:{' '}
                        <b>
                            {num(after)} {product.unit}
                        </b>
                    </div>
                )}

                {/* Khusus stok masuk: asal barang dan harga beli */}
                {masuk && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-600">Dari supplier (opsional)</span>
                            <select
                                value={form.data.supplier_id}
                                onChange={(e) => pickSupplier(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Tanpa supplier</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.supplier_id && (
                                <span className="mt-1 block text-xs text-red-600">{form.errors.supplier_id}</span>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-600">
                                Harga beli per {product.unit} (opsional)
                            </span>
                            <input
                                type="number"
                                min="0"
                                value={form.data.unit_cost}
                                onChange={(e) => form.setData('unit_cost', e.target.value)}
                                placeholder="mis. 25000"
                                className={inputClass}
                            />
                            {form.errors.unit_cost && (
                                <span className="mt-1 block text-xs text-red-600">{form.errors.unit_cost}</span>
                            )}
                        </label>

                        {total !== null && (
                            <div className="text-sm text-slate-600">
                                Total pembelian: <b>{rp(total)}</b>
                            </div>
                        )}
                    </div>
                )}

                <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-600">Alasan / keterangan</span>
                    <textarea
                        rows={2}
                        value={form.data.reason}
                        onChange={(e) => form.setData('reason', e.target.value)}
                        placeholder={masuk ? 'mis. Kulakan dari Pak Budi' : 'mis. Telur pecah 2 kilo'}
                        className={inputClass}
                    />
                    {form.errors.reason && <span className="mt-1 block text-xs text-red-600">{form.errors.reason}</span>}
                </label>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        disabled={form.processing}
                        className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}