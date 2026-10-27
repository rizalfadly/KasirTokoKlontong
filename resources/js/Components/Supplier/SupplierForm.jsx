import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { TERM_LABEL, TYPE_LABEL } from './constants';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

function Field({ label, error, hint, className = '', children }) {
    return (
        <label className={'block ' + className}>
            <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

// Kartu nama dikecilkan (maks 1000 px) supaya tulisannya masih terbaca tapi file tetap ringan
function toDataUrl(img) {
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    let out = canvas.toDataURL('image/jpeg', 0.85);
    for (const quality of [0.7, 0.55]) {
        if (out.length <= 650000) break;
        out = canvas.toDataURL('image/jpeg', quality);
    }

    return out;
}

export default function SupplierForm({ supplier, types, terms, onClose }) {
    const editing = !!supplier;
    const fileRef = useRef(null);
    const [cardError, setCardError] = useState('');

    const form = useForm({
        name: supplier?.name ?? '',
        type: supplier?.type ?? 'supplier',
        contact_person: supplier?.contact_person ?? '',
        phone: supplier?.phone ?? '',
        whatsapp: supplier?.whatsapp ?? '',
        address: supplier?.address ?? '',
        payment_terms: supplier?.payment_terms ?? 'tunai',
        bank_account: supplier?.bank_account ?? '',
        lead_time_days: supplier?.lead_time_days ?? '',
        min_order: supplier?.min_order ?? '',
        notes: supplier?.notes ?? '',
        is_active: supplier?.is_active ?? true,
        card: '',
        remove_card: false,
    });
    const { data, setData, errors } = form;

    const bind = (key) => ({ value: data[key], onChange: (e) => setData(key, e.target.value) });
    const cardPreview = data.card || (data.remove_card ? null : supplier?.card_url);

    function handleCard(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setCardError('File harus berupa gambar (JPG, PNG, atau WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                setData({ ...data, card: toDataUrl(img), remove_card: false });
                setCardError('');
            };
            img.onerror = () => setCardError('Gambar tidak bisa dibaca. Coba file lain.');
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    function removeCard() {
        setData({ ...data, card: '', remove_card: !!supplier?.card_url });
    }

    function submit(e) {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        if (editing) form.put(`/supplier/${supplier.id}`, options);
        else form.post('/supplier', options);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={submit} className="my-6 w-full max-w-2xl space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Tambah'} supplier</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama *" error={errors.name}>
                        <input className={inputClass} placeholder="mis. Peternakan Pak Budi" autoComplete="off" {...bind('name')} />
                    </Field>
                    <Field label="Jenis" error={errors.type}>
                        <select className={inputClass} {...bind('type')}>
                            {types.map((t) => (
                                <option key={t} value={t}>
                                    {TYPE_LABEL[t]}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Nama kontak" error={errors.contact_person}>
                        <input className={inputClass} placeholder="mis. Pak Budi" autoComplete="off" {...bind('contact_person')} />
                    </Field>
                    <Field label="Telepon" error={errors.phone}>
                        <input className={inputClass} placeholder="mis. 031-1234567" autoComplete="off" {...bind('phone')} />
                    </Field>

                    <Field label="WhatsApp" error={errors.whatsapp} hint="Dipakai untuk tombol chat langsung.">
                        <input className={inputClass} placeholder="mis. 0812-3456-7890" autoComplete="off" {...bind('whatsapp')} />
                    </Field>
                    <Field label="Termin pembayaran" error={errors.payment_terms}>
                        <select className={inputClass} {...bind('payment_terms')}>
                            {terms.map((t) => (
                                <option key={t} value={t}>
                                    {TERM_LABEL[t]}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Alamat" error={errors.address} className="sm:col-span-2">
                        <textarea rows={2} className={inputClass} {...bind('address')} />
                    </Field>

                    <Field label="Lama pengiriman (hari)" error={errors.lead_time_days}>
                        <input type="number" min="0" className={inputClass} placeholder="mis. 2" {...bind('lead_time_days')} />
                    </Field>
                    <Field label="Minimal order" error={errors.min_order}>
                        <input className={inputClass} placeholder="mis. 50 kg" autoComplete="off" {...bind('min_order')} />
                    </Field>

                    <Field
                        label="Rekening"
                        error={errors.bank_account}
                        hint="Bank, nomor, atas nama."
                        className="sm:col-span-2"
                    >
                        <input className={inputClass} placeholder="mis. BCA 1234567890 a.n. Budi" autoComplete="off" {...bind('bank_account')} />
                    </Field>

                    <Field label="Catatan" error={errors.notes} className="sm:col-span-2">
                        <textarea rows={2} className={inputClass} placeholder="mis. Antar tiap Selasa dan Jumat" {...bind('notes')} />
                    </Field>
                </div>

                {/* Kartu nama */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Kartu nama</span>
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">
                            {cardPreview ? (
                                <img src={cardPreview} alt="Kartu nama" className="h-full w-full object-contain" />
                            ) : (
                                'Belum ada'
                            )}
                        </div>
                        <div className="space-y-2">
                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCard} className="hidden" />
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                                >
                                    {cardPreview ? 'Ganti gambar' : 'Unggah kartu nama'}
                                </button>
                                {cardPreview && (
                                    <button type="button" onClick={removeCard} className="text-sm text-red-500 hover:underline">
                                        Hapus
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-400">Foto atau hasil scan. Otomatis dikecilkan.</p>
                        </div>
                    </div>
                    {(cardError || errors.card) && <p className="mt-2 text-xs text-red-600">{cardError || errors.card}</p>}
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                    />
                    Supplier aktif
                </label>

                <div className="flex gap-3 pt-2">
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
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}