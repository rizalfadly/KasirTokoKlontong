import { Head, router, useForm, usePage } from '@inertiajs/react';
import StockModal from '../../Components/StockModal';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import ProductImageField from '../../Components/ProductImageField';
import { Plus, Search, Package, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import MarginHint from '../../Components/MarginHint';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

function Field({ label, error, hint, ...props }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
            <input {...props} className={inputClass} />
            {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function UnitSelect({ label = 'Satuan', value, onChange, error, units = [] }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
            <select value={value} onChange={onChange} className={inputClass}>
                {units.map((u) => (
                    <option key={u} value={u}>
                        {u}
                    </option>
                ))}
            </select>
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function StockBadge({ stock }) {
    if (stock === 0) return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Habis</span>;
    if (stock <= 10)
        return <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">Menipis</span>;
    return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Aman</span>;
}

export default function ProdukIndex({
    products,
    units = ['kilo', 'liter', 'pcs', 'buah', 'unit', 'plastik', 'dus'],
    decimalUnits = ['kilo', 'liter'],
    suppliers = [],
    supplierPrices = [],
}) {
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);

    const { auth } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const [stockFor, setStockFor] = useState(null);

    const addForm = useForm({ name: '', sku: '', barcode: '', price: '', stock: '', cost_price: '', unit: 'pcs', icon: '', image: '', remove_image: false });
    const editForm = useForm({ name: '', sku: '', barcode: '', price: '', stock: '', cost_price: '', unit: 'pcs', icon: '', image: '', remove_image: false });

    const q = search.trim().toLowerCase();
    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.sku ?? '').toLowerCase().includes(q) ||
            (p.barcode ?? '').toLowerCase().includes(q),
    );

    function submitAdd(e) {
        e.preventDefault();
        addForm.post('/produk', { preserveScroll: true, onSuccess: () => addForm.reset() });
    }

    function openEdit(p) {
        editForm.clearErrors();
        editForm.setData({
            name: p.name,
            price: p.price,
            stock: p.stock,
            unit: p.unit ?? 'pcs',
            icon: p.icon ?? '',
            image: '',
            sku: p.sku ?? '',
            barcode: p.barcode ?? '',
            remove_image: false,
            cost_price: p.cost_price ?? '',
        });
        setEditing(p);
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/produk/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    function remove(p) {
        if (confirm(`Hapus produk "${p.name}"?`)) router.delete(`/produk/${p.id}`, { preserveScroll: true });
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Produk" />

            <div>
                <h1 className="text-2xl font-bold">Produk</h1>
                <p className="text-sm text-slate-500">Kelola daftar produk, harga, stok, dan satuan.</p>
            </div>

            {/* Form tambah */}
            <form onSubmit={submitAdd} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                    <Plus className="h-5 w-5 text-orange-500" />
                    Tambah produk
                </h2>
                <div className="mb-4">
                    <ProductImageField form={addForm} />
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-4 md:col-span-2">
                        <Field
                            label="Nama produk"
                            placeholder="mis. Telur Ayam Negeri"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            error={addForm.errors.name}
                        />
                        <Field
                            label="SKU (kode produk) *"
                            placeholder="mis. TLR-AYM-001"
                            hint="Singkat, tanpa spasi. Pola: JENIS-NAMA-UKURAN"
                            autoCapitalize="characters"
                            value={addForm.data.sku}
                            onChange={(e) => addForm.setData('sku', e.target.value)}
                            error={addForm.errors.sku}
                        />
                        <Field
                            label="Barcode (opsional)"
                            placeholder="Klik di sini lalu scan barcode kemasan"
                            value={addForm.data.barcode}
                            onChange={(e) => addForm.setData('barcode', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                            error={addForm.errors.barcode}
                        />

                    </div>

                    {isOwner && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field
                                label="Harga beli / modal (opsional)"
                                type="number"
                                min="0"
                                placeholder="mis. 25000"
                                value={addForm.data.cost_price}
                                onChange={(e) => addForm.setData('cost_price', e.target.value)}
                                error={addForm.errors.cost_price}
                                hint="Hanya terlihat oleh owner. Terisi otomatis dari Stok masuk."
                            />
                            <div className="flex items-end">
                                <MarginHint price={addForm.data.price} cost={addForm.data.cost_price} />
                            </div>
                        </div>
                    )}

                    <Field
                        label="Harga per satuan (Rp)"
                        type="number"
                        placeholder="28000"
                        value={addForm.data.price}
                        onChange={(e) => addForm.setData('price', e.target.value)}
                        error={addForm.errors.price}
                    />
                    <Field
                        label="Stok"
                        type="number"
                        step={decimalUnits.includes(addForm.data.unit) ? '0.001' : '1'}
                        min="0"
                        placeholder="50"
                        value={addForm.data.stock}
                        onChange={(e) => addForm.setData('stock', e.target.value)}
                        error={addForm.errors.stock}
                    />
                    <UnitSelect
                        units={units}
                        value={addForm.data.unit}
                        onChange={(e) => addForm.setData('unit', e.target.value)}
                        error={addForm.errors.unit}
                    />
                </div>
                <button
                    disabled={addForm.processing}
                    className="mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105 disabled:opacity-50"
                >
                    {addForm.processing ? 'Menyimpan...' : 'Simpan produk'}
                </button>
            </form>

            {/* Daftar */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold">Daftar produk ({products.length})</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <Package className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">
                            {products.length === 0 ? 'Belum ada produk. Tambahkan produk pertama kamu.' : 'Produk tidak ditemukan.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm text-slate-400">
                                    <th className="pb-3 font-medium">Produk</th>
                                    <th className="pb-3 font-medium">Harga</th>
                                    {isOwner && <th className="pb-3 font-medium">Margin</th>}
                                    <th className="pb-3 font-medium">Stok</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="transition hover:bg-amber-50/50">
                                        <td className="py-3">
                                            <div>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="font-mono text-xs text-slate-400">{p.sku}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 font-semibold text-orange-600">
                                            {rp(p.price)}
                                            <span className="text-xs font-normal text-slate-400"> / {p.unit}</span>
                                        </td>
                                        {isOwner && (
                                            <td className="py-3 text-sm">
                                                {p.cost_price == null ? (
                                                    <span className="text-slate-300">Belum diisi</span>
                                                ) : (
                                                    <span className={'font-semibold ' + (p.price - p.cost_price < 0 ? 'text-red-600' : 'text-emerald-700')}>
                                                        {rp(p.price - p.cost_price)}{' '}
                                                        <span className="text-xs font-normal text-slate-400">
                                                            ({p.price > 0 ? Math.round(((p.price - p.cost_price) / p.price) * 1000) / 10 : 0}%)
                                                        </span>
                                                    </span>
                                                )}
                                                <div className="text-xs text-slate-400">modal {p.cost_price == null ? '-' : rp(p.cost_price)}</div>
                                            </td>
                                        )}
                                        <td className="py-3">
                                            {p.stock} <span className="text-sm text-slate-500">{p.unit}</span>
                                        </td>
                                        <td className="py-3">
                                            <StockBadge stock={p.stock} />
                                        </td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => setStockFor(p)}
                                                className="mr-1 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                                            >
                                                <PackagePlus className="h-4 w-4" /> Stok
                                            </button>
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="mr-1 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil className="h-4 w-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => remove(p)}
                                                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pop-up edit */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form onSubmit={submitEdit} className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                        <h2 className="flex items-center gap-2 text-lg font-bold">
                            <Pencil className="h-5 w-5 text-orange-500" />
                            Edit produk
                        </h2>
                        <ProductImageField form={editForm} existingUrl={editing.image_url} />
                        <Field
                            label="Nama produk"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            error={editForm.errors.name}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="SKU"
                                autoCapitalize="characters"
                                value={editForm.data.sku}
                                onChange={(e) => editForm.setData('sku', e.target.value)}
                                error={editForm.errors.sku}
                            />
                            <Field
                                label="Barcode"
                                value={editForm.data.barcode}
                                onChange={(e) => editForm.setData('barcode', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                error={editForm.errors.barcode}
                            />
                        </div>

                        {isOwner && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Harga beli / modal (opsional)"
                                    type="number"
                                    min="0"
                                    placeholder="mis. 25000"
                                    value={editForm.data.cost_price}
                                    onChange={(e) => editForm.setData('cost_price', e.target.value)}
                                    error={editForm.errors.cost_price}
                                    hint="Hanya terlihat oleh owner. Terisi otomatis dari Stok masuk."
                                />
                                <div className="flex items-end">
                                    <MarginHint price={editForm.data.price} cost={editForm.data.cost_price} />
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            <Field
                                label="Harga (Rp)"
                                type="number"
                                value={editForm.data.price}
                                onChange={(e) => editForm.setData('price', e.target.value)}
                                error={editForm.errors.price}
                            />
                            <Field
                                label="Stok"
                                disabled
                                hint="Ubah stok lewat tombol Stok di daftar produk."
                                type="number"
                                step={decimalUnits.includes(editForm.data.unit) ? '0.001' : '1'}
                                min="0"
                                value={editForm.data.stock}
                                onChange={(e) => editForm.setData('stock', e.target.value)}
                                error={editForm.errors.stock}
                            />
                            <UnitSelect
                                units={units}
                                value={editForm.data.unit}
                                onChange={(e) => editForm.setData('unit', e.target.value)}
                                error={editForm.errors.unit}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                disabled={editForm.processing}
                                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 font-semibold text-white disabled:opacity-50"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {stockFor && (
              <StockModal
                    key={stockFor.id}
                    product={stockFor}
                    decimalUnits={decimalUnits}
                    isOwner={isOwner}
                    suppliers={suppliers}
                    supplierPrices={supplierPrices}
                    onClose={() => setStockFor(null)}
                />
            )}
        </div>
    );
}

ProdukIndex.layout = (page) => <KasirLayout>{page}</KasirLayout>;