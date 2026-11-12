import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Clock, MapPin, MessageCircle, Pencil, Phone, Trash2, User, Wallet, X, Building2, Save } from 'lucide-react';
import { TERM_LABEL, TYPE_LABEL, TYPE_STYLE, waLink } from './constants';
import { num, rp } from '../../lib/format';
import { useDialog } from '../../Components/Dialog';

function Info({ icon: Icon, children }) {
    return (
        <div className="flex items-start gap-3 text-xs md:text-sm font-bold text-slate-700 bg-white/60 p-3 rounded-2xl border border-slate-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 break-words self-center">{children}</div>
        </div>
    );
}

export default function SupplierDetail({ supplier, products, onClose, onEdit }) {
    const priceForm = useForm({ product_id: '', price: '', note: '' });
    const wa = waLink(supplier.whatsapp);
    const dialog = useDialog();

    function pickProduct(id) {
        const existing = supplier.prices.find((p) => String(p.product_id) === id);
        priceForm.setData({
            product_id: id,
            price: existing ? String(existing.price) : '',
            note: existing?.note ?? '',
        });
    }

    function editPrice(p) {
        priceForm.setData({ product_id: String(p.product_id), price: String(p.price), note: p.note ?? '' });
    }

    function savePrice(e) {
        e.preventDefault();
        priceForm.post(`/supplier/${supplier.id}/harga`, {
            preserveScroll: true,
            onSuccess: () => priceForm.reset(),
        });
    }

    async function removePrice(p) {
        if (await dialog.confirm(`Hapus harga ${p.product?.name ?? 'produk'} dari ${supplier.name}?`, {
            title: 'Hapus harga', tone: 'danger', okText: 'Ya, hapus', })) {
            router.delete(`/supplier/${supplier.id}/harga/${p.product_id}`, { preserveScroll: true });
        }
    }

    const prices = [...supplier.prices].sort((a, b) => (a.product?.name ?? '').localeCompare(b.product?.name ?? ''));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Wrapper dibatasi tinggi maksimumnya agar bisa di-scroll dengan rapi */}
            <div className="flex flex-col max-h-[90vh] w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
                
                {/* Header Modal (Sticky di Atas - Tidak ikut hilang saat di-scroll) */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 md:px-8 bg-white z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-inner ' + TYPE_STYLE[supplier.type]}>
                            {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-slate-800 truncate">{supplier.name}</h2>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                <span className={'rounded-full px-2.5 py-0.5 text-[10px] font-black ' + TYPE_STYLE[supplier.type]}>
                                    {TYPE_LABEL[supplier.type]}
                                </span>
                                {!supplier.is_active && (
                                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-black text-slate-500">
                                        Nonaktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-600 transition-colors hover:bg-indigo-100"
                        >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Tutup"
                            className="rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Konten Detail yang Bisa Digulir (Scrollable Content) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    
                    {/* Tombol Kontak Cepat */}
                    <div className="flex flex-wrap gap-2.5">
                        {supplier.phone && (
                            <a
                                href={`tel:${supplier.phone.replace(/[^\d+]/g, '')}`}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                            >
                                <Phone className="h-4 w-4 text-indigo-600" /> Panggil Telepon
                            </a>
                        )}
                        {wa && (
                            <a
                                href={wa}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                            >
                                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
                            </a>
                        )}
                    </div>

                    {/* Informasi Detail */}
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {supplier.contact_person && <Info icon={User}>{supplier.contact_person}</Info>}
                        {supplier.phone && <Info icon={Phone}>{supplier.phone}</Info>}
                        {supplier.address && <div className="sm:col-span-2"><Info icon={MapPin}>{supplier.address}</Info></div>}
                        <Info icon={Wallet}>
                            {TERM_LABEL[supplier.payment_terms]}
                            {supplier.bank_account ? ` · ${supplier.bank_account}` : ''}
                        </Info>
                        {(supplier.lead_time_days !== null || supplier.min_order) && (
                            <Info icon={Clock}>
                                {supplier.lead_time_days !== null ? `Pengiriman ${supplier.lead_time_days} hari` : ''}
                                {supplier.lead_time_days !== null && supplier.min_order ? ' · ' : ''}
                                {supplier.min_order ? `Min. order ${supplier.min_order}` : ''}
                            </Info>
                        )}
                    </div>

                    {supplier.notes && (
                        <p className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs font-bold text-amber-800">
                            💡 Catatan: {supplier.notes}
                        </p>
                    )}

                    {supplier.card_url && (
                        <div className="space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-slate-500">Kartu Nama Supplier</div>
                            <a href={supplier.card_url} target="_blank" rel="noopener" className="block overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-50">
                                <img
                                    src={supplier.card_url}
                                    alt={`Kartu nama ${supplier.name}`}
                                    className="max-h-56 w-full object-contain transition-transform hover:scale-102"
                                />
                            </a>
                            <p className="text-[11px] font-bold text-slate-400">Klik gambar untuk memperbesar pratinjau.</p>
                        </div>
                    )}

                    {/* Daftar Harga Produk */}
                    <div className="space-y-3">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                            <span>Daftar Harga Produk Kulakan</span>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-600">{prices.length} Produk</span>
                        </div>

                        {prices.length === 0 ? (
                            <p className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-6 text-center text-xs font-bold text-slate-400">
                                Belum ada harga produk yang dicatat untuk supplier ini.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                {prices.map((p) => {
                                    const changed = p.previous_price !== null && p.previous_price !== p.price;
                                    const up = changed && p.price > p.previous_price;

                                    return (
                                        <li key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-black text-slate-800">{p.product?.name ?? '-'}</div>
                                                <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                                                    <span className="font-mono text-slate-600">{p.product?.sku}</span>
                                                    {p.note ? ` · ${p.note}` : ''} · {new Date(p.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-slate-900">
                                                    {rp(p.price)}
                                                    <span className="font-normal text-slate-400"> / {p.product?.unit}</span>
                                                </div>
                                                {changed && (
                                                    <div className={'inline-flex items-center gap-0.5 text-[10px] font-bold ' + (up ? 'text-rose-600' : 'text-emerald-600')}>
                                                        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                                        dari {rp(p.previous_price)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <button onClick={() => editPrice(p)} aria-label="Ubah harga" className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => removePrice(p)} aria-label="Hapus harga" className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Form Tambah / Ubah Harga */}
                        <form onSubmit={savePrice} className="mt-3 grid gap-2.5 rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:grid-cols-6 shadow-inner">
                            <select
                                value={priceForm.data.product_id}
                                onChange={(e) => pickProduct(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 sm:col-span-3 shadow-sm"
                            >
                                <option value="">Pilih produk...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.sku}) / {p.unit}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="0"
                                placeholder="Harga beli"
                                value={priceForm.data.price}
                                onChange={(e) => priceForm.setData('price', e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 sm:col-span-2 shadow-sm placeholder:font-normal placeholder:text-slate-400"
                            />
                            <button
                                disabled={priceForm.processing || !priceForm.data.product_id || priceForm.data.price === ''}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-40 transition-all"
                            >
                                <Save className="h-4 w-4" /> Simpan
                            </button>
                            <input
                                placeholder="Keterangan (opsional), mis. harga grosir"
                                value={priceForm.data.note}
                                onChange={(e) => priceForm.setData('note', e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 sm:col-span-6 shadow-sm placeholder:font-normal placeholder:text-slate-400"
                            />
                            {(priceForm.errors.product_id || priceForm.errors.price) && (
                                <p className="text-xs font-extrabold text-rose-600 sm:col-span-6">
                                    ⚠️ {priceForm.errors.product_id || priceForm.errors.price}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Riwayat Pembelian */}
                    <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                            <div className="text-xs font-black uppercase tracking-wider text-slate-600">Riwayat Pembelian Kulakan</div>
                            {supplier.purchase_stats && (
                                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-100">
                                    {supplier.purchase_stats.count}x Kulakan &bull; Total {rp(supplier.purchase_stats.total)}
                                </div>
                            )}
                        </div>

                        {(supplier.purchases ?? []).length === 0 ? (
                            <p className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-6 text-center text-xs font-bold text-slate-400">
                                Belum ada riwayat pembelian. Pilih supplier ini saat mencatat Stok Masuk di halaman Produk.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                                <table className="w-full min-w-[520px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 font-black uppercase tracking-wider text-slate-400">
                                            <th className="px-3.5 py-3">Tanggal</th>
                                            <th className="px-3.5 py-3">Produk</th>
                                            <th className="px-3.5 py-3 text-right">Jumlah</th>
                                            <th className="px-3.5 py-3 text-right">Harga Satuan</th>
                                            <th className="px-3.5 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                                        {supplier.purchases.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-3.5 py-3 text-slate-500">
                                                    {new Date(m.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                    <div className="text-[10px] font-medium text-slate-400">{m.user?.username ?? ''}</div>
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <div className="font-black text-slate-800">{m.product?.name}</div>
                                                    <div className="font-mono text-[11px] text-slate-400">{m.product?.sku}</div>
                                                </td>
                                                <td className="px-3.5 py-3 text-right">
                                                    {num(m.qty_change)} {m.product?.unit}
                                                </td>
                                                <td className="px-3.5 py-3 text-right">{m.unit_cost !== null ? rp(m.unit_cost) : '—'}</td>
                                                <td className="px-3.5 py-3 text-right font-black text-slate-900">
                                                    {m.unit_cost !== null ? rp(Math.round(m.qty_change * m.unit_cost)) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}