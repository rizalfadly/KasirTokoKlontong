import { Head, router, useForm, usePage } from '@inertiajs/react';
import StockModal from '../../Components/StockModal';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import ProductImageField from '../../Components/ProductImageField';
import { Plus, Search, Package, PackagePlus, Pencil, Trash2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import MarginHint from '../../Components/MarginHint';
import { useDialog } from '../../Components/Dialog';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal';

function Field({ label, error, hint, ...props }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <input {...props} className={inputClass} />
            {hint && !error && <span className="mt-1 block text-xs text-slate-400 font-medium">{hint}</span>}
            {error && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
        </label>
    );
}

function UnitSelect({ label = 'Satuan', value, onChange, error, units = [] }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <select value={value} onChange={onChange} className={inputClass + ' cursor-pointer'}>
                {units.map((u) => (
                    <option key={u} value={u}>
                        {u}
                    </option>
                ))}
            </select>
            {error && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
        </label>
    );
}

function StockBadge({ stock }) {
    if (stock === 0) return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800 border border-rose-200">Habis</span>;
    if (stock <= 10)
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 border border-amber-200">Menipis</span>;
    return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">Aman</span>;
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
    const dialog = useDialog();

    const addForm = useForm({
        name: '', sku: '', barcode: '', price: '', stock: '', cost_price: '',
        unit: 'pcs', icon: '', image: '', remove_image: false,
        wholesale_price: '', wholesale_min_qty: 10, limit_qty: '', limit_period: 'harian', limit_orders: '',
    });

    const editForm = useForm({
        name: '', sku: '', barcode: '', price: '', stock: '', cost_price: '',
        unit: 'pcs', icon: '', image: '', remove_image: false,
        wholesale_price: '', wholesale_min_qty: 10, limit_qty: '', limit_period: 'harian', limit_orders: '',
    });
    
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
            wholesale_price: p.wholesale_price ?? '',
            wholesale_min_qty: p.wholesale_min_qty ?? 10,
            limit_qty: p.limit_qty ?? '',
            limit_orders: p.limit_orders ?? '',
            limit_period: p.limit_period ?? 'harian',
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

    async function remove(p) {
        const ok = await dialog.confirm(`Hapus produk "${p.name}" dari sistem?`, {
            title: 'Hapus produk', tone: 'danger', okText: 'Ya, hapus',
        });
        if (ok) router.delete(`/produk/${p.id}`, { preserveScroll: true });
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Manajemen Produk" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Package className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Katalog & Inventaris Toko</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Manajemen Produk & Harga 
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Kelola daftar produk, SKU, harga jual, harga grosir, dan satuan barang.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Tambah Produk */}
            <form onSubmit={submitAdd} className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                <h2 className="mb-6 flex items-center gap-2.5 text-base font-black text-slate-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span>Tambah Produk Baru</span>
                </h2>
                <div className="mb-6">
                    <ProductImageField form={addForm} />
                </div>
                <div className="grid gap-5 md:grid-cols-5">
                    <div className="space-y-5 md:col-span-2">
                        <Field
                            label="Nama Produk"
                            placeholder="mis. Telur Ayam Negeri"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            error={addForm.errors.name}
                        />
                        <Field
                            label="SKU (Kode Produk) *"
                            placeholder="mis. TLR-AYM-001"
                            hint="Singkat, tanpa spasi. Pola: JENIS-NAMA-UKURAN"
                            autoCapitalize="characters"
                            value={addForm.data.sku}
                            onChange={(e) => addForm.setData('sku', e.target.value)}
                            error={addForm.errors.sku}
                        />
                        <Field
                            label="Barcode (Opsional)"
                            placeholder="Klik di sini lalu scan barcode kemasan"
                            value={addForm.data.barcode}
                            onChange={(e) => addForm.setData('barcode', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                            error={addForm.errors.barcode}
                        />
                    </div>

                    <div className="space-y-5 md:col-span-3">
                        {isOwner && (
                            <div className="grid gap-5 md:grid-cols-2 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100">
                                <Field
                                    label="Harga Beli / Modal (Opsional)"
                                    type="number"
                                    min="0"
                                    placeholder="mis. 25000"
                                    value={addForm.data.cost_price}
                                    onChange={(e) => addForm.setData('cost_price', e.target.value)}
                                    error={addForm.errors.cost_price}
                                    hint="Hanya terlihat oleh owner. Terisi otomatis dari Stok Masuk."
                                />
                                <div className="flex items-center pt-2">
                                    <MarginHint price={addForm.data.price} cost={addForm.data.cost_price} />
                                </div>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-3">
                            <Field
                                label="Harga Jual (Rp)"
                                type="number"
                                placeholder="28000"
                                value={addForm.data.price}
                                onChange={(e) => addForm.setData('price', e.target.value)}
                                error={addForm.errors.price}
                            />
                            <Field
                                label="Stok Awal"
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
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={addForm.processing}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                        <CheckCircle2 className="h-5 w-5 text-amber-300" />
                        <span>{addForm.processing ? 'Menyimpan Produk...' : 'Simpan Produk Baru'}</span>
                    </button>
                </div>
            </form>

            {/* Daftar Produk */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-800">
                        Daftar Produk Terdaftar <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-600 ml-2">{products.length}</span>
                    </h2>
                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                            placeholder="Cari produk, SKU, atau barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                        <span className="font-bold text-slate-700 text-base">
                            {products.length === 0 ? 'Belum ada produk terdaftar.' : 'Produk tidak ditemukan.'}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">Gunakan form di atas untuk menambahkan produk pertama kamu.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-3 px-3">Produk & SKU</th>
                                    <th className="pb-3 px-3">Harga Jual</th>
                                    {isOwner && <th className="pb-3 px-3">Margin Keuntungan</th>}
                                    <th className="pb-3 px-3">Stok Saat Ini</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-indigo-50/50 group">
                                        <td className="py-4 px-3">
                                            <div className="font-extrabold text-slate-800">{p.name}</div>
                                            <div className="font-mono text-xs font-semibold text-indigo-600">{p.sku}</div>
                                        </td>
                                        <td className="py-4 px-3 font-black text-emerald-600">
                                            {rp(p.price)}
                                            <span className="text-xs font-bold text-slate-400 ml-1">/ {p.unit}</span>
                                        </td>
                                        {isOwner && (
                                            <td className="py-4 px-3 text-xs">
                                                {p.cost_price == null ? (
                                                    <span className="text-slate-400 italic">Belum diisi</span>
                                                ) : (
                                                    <span className={'font-extrabold ' + (p.price - p.cost_price < 0 ? 'text-rose-600' : 'text-emerald-700')}>
                                                        {rp(p.price - p.cost_price)}{' '}
                                                        <span className="font-bold text-slate-400">
                                                            ({p.price > 0 ? Math.round(((p.price - p.cost_price) / p.price) * 1000) / 10 : 0}%)
                                                        </span>
                                                    </span>
                                                )}
                                                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">modal: {p.cost_price == null ? '-' : rp(p.cost_price)}</div>
                                            </td>
                                        )}
                                        <td className="py-4 px-3 font-extrabold text-slate-700">
                                            {p.stock} <span className="text-xs font-bold text-slate-400 uppercase">{p.unit}</span>
                                        </td>
                                        <td className="py-4 px-3">
                                            <StockBadge stock={p.stock} />
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setStockFor(p)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                    title="Tambah / Kurangi Stok"
                                                >
                                                    <PackagePlus className="h-4 w-4" /> Stok
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(p)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                    title="Edit Produk"
                                                >
                                                    <Pencil className="h-4 w-4" /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(p)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                                                    title="Hapus Produk"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pop-up Modal Edit Produk */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <form
                        onSubmit={submitEdit}
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                            <h2 className="flex items-center gap-2.5 text-base font-black text-slate-800">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-sm">
                                    <Pencil className="h-4 w-4" />
                                </div>
                                <span>Edit Detail Produk: {editing.name}</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Isi Konten Modal (Scrollable) */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-6 md:p-8">
                            <ProductImageField form={editForm} existingUrl={editing.image_url} />
                            
                            <Field
                                label="Nama Produk"
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
                                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100">
                                    <Field
                                        label="Harga Beli / Modal (Opsional)"
                                        type="number"
                                        min="0"
                                        placeholder="mis. 25000"
                                        value={editForm.data.cost_price}
                                        onChange={(e) => editForm.setData('cost_price', e.target.value)}
                                        error={editForm.errors.cost_price}
                                        hint="Hanya terlihat oleh owner. Terisi otomatis dari Stok Masuk."
                                    />
                                    <div className="flex items-center pt-2">
                                        <MarginHint price={editForm.data.price} cost={editForm.data.cost_price} />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <Field
                                    label="Harga Jual (Rp)"
                                    type="number"
                                    value={editForm.data.price}
                                    onChange={(e) => editForm.setData('price', e.target.value)}
                                    error={editForm.errors.price}
                                />
                                <Field
                                    label="Stok"
                                    disabled
                                    hint="Ubah stok via tombol Stok di tabel."
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

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <Field label="Harga Grosir (Rp)" type="number" min="0" placeholder="opsional"
                                    value={editForm.data.wholesale_price}
                                    onChange={(e) => editForm.setData('wholesale_price', e.target.value)}
                                    error={editForm.errors.wholesale_price} />
                                <Field label="Grosir Mulai Dari Qty" type="number" min="0" step="0.001"
                                    value={editForm.data.wholesale_min_qty}
                                    onChange={(e) => editForm.setData('wholesale_min_qty', e.target.value)}
                                    error={editForm.errors.wholesale_min_qty} />
                                <Field label="Jatah per Pelanggan" type="number" min="0" step="0.001" placeholder="kosong = tanpa jatah"
                                    value={editForm.data.limit_qty}
                                    onChange={(e) => editForm.setData('limit_qty', e.target.value)}
                                    error={editForm.errors.limit_qty} />
                                <Field label="Maks. Kali Beli per Periode" type="number" min="1" placeholder="kosong = tanpa batas"
                                    value={editForm.data.limit_orders}
                                    onChange={(e) => editForm.setData('limit_orders', e.target.value)}
                                    error={editForm.errors.limit_orders} />
                                <UnitSelect label="Periode Jatah" units={['harian', 'mingguan']}
                                    value={editForm.data.limit_period}
                                    onChange={(e) => editForm.setData('limit_period', e.target.value)}
                                    error={editForm.errors.limit_period} />
                            </div>
                        </div>

                        {/* Footer Modal Aksi */}
                        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {editForm.processing ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Stok Masuk */}
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