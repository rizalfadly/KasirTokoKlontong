import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { TERM_LABEL, TYPE_LABEL } from './constants';
import { Building2, X, Upload, Save } from 'lucide-react';

const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm placeholder:font-normal placeholder:text-slate-400';

function Field({ label, error, hint, className = '', children }) {
    return (
        <label className={'block space-y-1.5 ' + className}>
            <span className="block text-xs font-black uppercase tracking-wider text-slate-600">{label}</span>
            {children}
            {hint && !error && <span className="block text-xs font-medium text-slate-400">{hint}</span>}
            {error && <span className="block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Wrapper utama dibatasi tinggi maksimumnya dan difungsikan flex agar bagian isinya bisa di-scroll */}
            <div className="flex flex-col max-h-[90vh] w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
                
                {/* Header Modal (Sticky di atas) */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 md:px-8 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-black text-slate-800">
                            {editing ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Bagian Isi Form yang bisa digulir (Scrollable Content) */}
                <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nama Supplier / Toko *" error={errors.name}>
                            <input className={inputClass} placeholder="mis. Peternakan Pak Budi" autoComplete="off" {...bind('name')} />
                        </Field>
                        <Field label="Jenis Mitra" error={errors.type}>
                            <select className={inputClass + ' font-bold'} {...bind('type')}>
                                {types.map((t) => (
                                    <option key={t} value={t}>
                                        {TYPE_LABEL[t]}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Nama Kontak" error={errors.contact_person}>
                            <input className={inputClass} placeholder="mis. Pak Budi" autoComplete="off" {...bind('contact_person')} />
                        </Field>
                        <Field label="Nomor Telepon" error={errors.phone}>
                            <input className={inputClass} placeholder="mis. 031-1234567" autoComplete="off" {...bind('phone')} />
                        </Field>

                        <Field label="Nomor WhatsApp" error={errors.whatsapp} hint="Dipakai untuk tombol chat langsung.">
                            <input className={inputClass} placeholder="mis. 0812-3456-7890" autoComplete="off" {...bind('whatsapp')} />
                        </Field>
                        <Field label="Termin Pembayaran" error={errors.payment_terms}>
                            <select className={inputClass + ' font-bold'} {...bind('payment_terms')}>
                                {terms.map((t) => (
                                    <option key={t} value={t}>
                                        {TERM_LABEL[t]}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Alamat Lengkap" error={errors.address} className="sm:col-span-2">
                            <textarea rows={2} className={inputClass} placeholder="mis. Jl. Raya Peternakan No. 45, Surabaya" {...bind('address')} />
                        </Field>

                        <Field label="Lama Pengiriman (Hari)" error={errors.lead_time_days}>
                            <input type="number" min="0" className={inputClass} placeholder="mis. 2" {...bind('lead_time_days')} />
                        </Field>
                        <Field label="Minimal Order" error={errors.min_order}>
                            <input className={inputClass} placeholder="mis. 50 kg / 5 krat" autoComplete="off" {...bind('min_order')} />
                        </Field>

                        <Field
                            label="Informasi Rekening"
                            error={errors.bank_account}
                            hint="Format: Bank, nomor rekening, atas nama."
                            className="sm:col-span-2"
                        >
                            <input className={inputClass} placeholder="mis. BCA 1234567890 a.n. Budi Santoso" autoComplete="off" {...bind('bank_account')} />
                        </Field>

                        <Field label="Catatan Tambahan" error={errors.notes} className="sm:col-span-2">
                            <textarea rows={2} className={inputClass} placeholder="mis. Jadwal kirim rutin tiap Selasa dan Jumat" {...bind('notes')} />
                        </Field>
                    </div>

                    {/* Bagian Unggah Kartu Nama */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600">Dokumen Kartu Nama</span>
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white text-xs font-bold text-slate-400 shadow-sm">
                                {cardPreview ? (
                                    <img src={cardPreview} alt="Kartu nama" className="h-full w-full object-cover" />
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
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <Upload className="h-3.5 w-3.5 text-indigo-600" />
                                        {cardPreview ? 'Ganti Gambar' : 'Unggah Kartu Nama'}
                                    </button>
                                    {cardPreview && (
                                        <button type="button" onClick={removeCard} className="text-xs font-bold text-rose-500 hover:underline">
                                            Hapus
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">Foto atau hasil scan. Otomatis dikompres agar ringan.</p>
                            </div>
                        </div>
                        {(cardError || errors.card) && <p className="mt-2 text-xs font-extrabold text-rose-600">⚠️ {cardError || errors.card}</p>}
                    </div>

                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                        />
                        <span>Supplier aktif (muncul di pilihan kulakan dan perbandingan harga)</span>
                    </label>

                    {/* Footer Tombol Aksi di dalam Form agar ikut submit */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{form.processing ? 'Menyimpan...' : 'Simpan Supplier'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}