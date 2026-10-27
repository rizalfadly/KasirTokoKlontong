import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Clock, MapPin, MessageCircle, Pencil, Phone, Trash2, User, Wallet, X } from 'lucide-react';
import { rp } from '../../lib/format';
import { TERM_LABEL, TYPE_LABEL, TYPE_STYLE, waLink } from './constants';

function Info({ icon: Icon, children }) {
    return (
        <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 break-words">{children}</div>
        </div>
    );
}

export default function SupplierDetail({ supplier, products, onClose, onEdit }) {
    const priceForm = useForm({ product_id: '', price: '', note: '' });
    const wa = waLink(supplier.whatsapp);

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

    function removePrice(p) {
        if (confirm(`Hapus harga ${p.product?.name ?? 'produk'} dari ${supplier.name}?`)) {
            router.delete(`/supplier/${supplier.id}/harga/${p.product_id}`, { preserveScroll: true });
        }
    }

    const prices = [...supplier.prices].sort((a, b) => (a.product?.name ?? '').localeCompare(b.product?.name ?? ''));

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <div className="my-6 w-full max-w-2xl space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold">{supplier.name}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + TYPE_STYLE[supplier.type]}>
                                {TYPE_LABEL[supplier.type]}
                            </span>
                            {!supplier.is_active && (
                                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                    Nonaktif
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <button
                            onClick={onEdit}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Kontak */}
                <div className="flex flex-wrap gap-2">
                    {supplier.phone && (
                        <a
                            href={`tel:${supplier.phone.replace(/[^\d+]/g, '')}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            <Phone className="h-4 w-4" /> Telepon
                        </a>
                    )}
                    {wa && (
                        <a
                            href={wa}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                        </a>
                    )}
                </div>

                <div className="space-y-2">
                    {supplier.contact_person && <Info icon={User}>{supplier.contact_person}</Info>}
                    {supplier.phone && <Info icon={Phone}>{supplier.phone}</Info>}
                    {supplier.address && <Info icon={MapPin}>{supplier.address}</Info>}
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
                    {supplier.notes && (
                        <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{supplier.notes}</p>
                    )}
                </div>

                {supplier.card_url && (
                    <div>
                        <div className="mb-1 text-sm font-medium text-slate-600">Kartu nama</div>
                        <a href={supplier.card_url} target="_blank" rel="noopener">
                            <img
                                src={supplier.card_url}
                                alt={`Kartu nama ${supplier.name}`}
                                className="max-h-56 rounded-xl border border-slate-200 object-contain"
                            />
                        </a>
                        <p className="mt-1 text-xs text-slate-400">Klik gambar untuk memperbesar.</p>
                    </div>
                )}

                {/* Daftar harga */}
                <div>
                    <div className="mb-2 text-sm font-semibold">Harga produk</div>

                    {prices.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-400">
                            Belum ada harga yang dicatat.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                            {prices.map((p) => {
                                const changed = p.previous_price !== null && p.previous_price !== p.price;
                                const up = changed && p.price > p.previous_price;

                                return (
                                    <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">{p.product?.name ?? '-'}</div>
                                            <div className="text-xs text-slate-400">
                                                <span className="font-mono">{p.product?.sku}</span>
                                                {p.note ? ` · ${p.note}` : ''} · {new Date(p.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold">
                                                {rp(p.price)}
                                                <span className="text-xs font-normal text-slate-400"> / {p.product?.unit}</span>
                                            </div>
                                            {changed && (
                                                <div className={'inline-flex items-center gap-0.5 text-xs ' + (up ? 'text-red-500' : 'text-emerald-600')}>
                                                    {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                                    dari {rp(p.previous_price)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex shrink-0">
                                            <button onClick={() => editPrice(p)} aria-label="Ubah harga" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => removePrice(p)} aria-label="Hapus harga" className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Tambah / ubah harga */}
                    <form onSubmit={savePrice} className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-6">
                        <select
                            value={priceForm.data.product_id}
                            onChange={(e) => pickProduct(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 sm:col-span-3"
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
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 sm:col-span-2"
                        />
                        <button
                            disabled={priceForm.processing || !priceForm.data.product_id || priceForm.data.price === ''}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
                        >
                            Simpan
                        </button>
                        <input
                            placeholder="Keterangan (opsional), mis. harga grosir"
                            value={priceForm.data.note}
                            onChange={(e) => priceForm.setData('note', e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 sm:col-span-6"
                        />
                        {(priceForm.errors.product_id || priceForm.errors.price) && (
                            <p className="text-xs text-red-600 sm:col-span-6">
                                {priceForm.errors.product_id || priceForm.errors.price}
                            </p>
                        )}
                    </form>
                    <p className="mt-1 text-xs text-slate-400">
                        Memilih produk yang sudah ada harganya akan mengubah harganya. Harga lama tercatat sebagai pembanding.
                    </p>
                </div>
            </div>
        </div>
    );
}