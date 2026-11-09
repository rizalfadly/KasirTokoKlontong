import { Head, useForm } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';
import LogoField from '../../Components/LogoField';
import { Settings, Store, ReceiptText, Sparkles, CheckCircle2, Save } from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm placeholder:font-normal placeholder:text-slate-400';

const card = 'rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-xl';

// Contoh isi nota untuk pratinjau
const SAMPLE = [
    { name: 'Telur Ayam Negeri', qty: 2, unit: 'kilo', price: 28000 },
    { name: 'Telur Bebek', qty: 10, unit: 'butir', price: 3500 },
];

function Field({ label, error, hint, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-600">{label}</span>
            {children}
            {hint && !error && <span className="block text-xs font-medium text-slate-400">{hint}</span>}
            {error && <span className="block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
        </label>
    );
}

function Row({ l, r, bold }) {
    return (
        <div className={'flex justify-between gap-2 ' + (bold ? 'text-xs font-extrabold text-slate-900' : 'text-slate-700')}>
            <span>{l}</span>
            <span className="text-right">{r}</span>
        </div>
    );
}

const Line = () => <hr className="my-2 border-t border-dashed border-slate-300" />;

export default function Pengaturan({ store }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: store.name ?? '',
        address: store.address ?? '',
        phone: store.phone ?? '',
        slogan: store.slogan ?? '',
        footer: store.footer ?? '',
        logo: '', remove_logo: false,
    });

    function submit(e) {
        e.preventDefault();
        put('/pengaturan', {
            preserveScroll: true,
            onSuccess: () => setData({ ...data, logo: '', remove_logo: false }),
        });
    }

    const total = SAMPLE.reduce((s, i) => s + i.qty * i.price, 0);

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Pengaturan Toko" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-20 pointer-events-none">
                    <Sparkles className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Store className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
                            <span>Konfigurasi Sistem Usaha</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Pengaturan Toko
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Identitas ini akan tampil secara otomatis di bagian kepala dan kaki setiap nota transaksi.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Form Pengaturan */}
                <form onSubmit={submit} className={card + ' space-y-5 self-start p-6 md:p-8'}>
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-sm">
                            <Settings className="h-5 w-5" />
                        </div>
                        <h2 className="text-base font-black text-slate-800">Form Identitas & Struk</h2>
                    </div>

                    <LogoField form={{ data, setData }} existingUrl={store.logo_url} />
                    
                    <Field label="Nama Toko / Usaha" error={errors.name}>
                        <input
                            className={inputClass}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="mis. Toko Telur Barokah"
                        />
                    </Field>

                    <Field label="Alamat Toko" error={errors.address} hint="Tekan Enter untuk pindah baris pada cetakan struk.">
                        <textarea
                            rows={3}
                            className={inputClass}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder={'Jl. Raya Merdeka No. 12\nSurabaya'}
                        />
                    </Field>

                    <Field label="Nomor Telepon / WhatsApp" error={errors.phone}>
                        <input
                            className={inputClass}
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="mis. 0812-3456-7890"
                        />
                    </Field>

                    <Field label="Slogan Toko" error={errors.slogan}>
                        <input
                            className={inputClass}
                            value={data.slogan}
                            onChange={(e) => setData('slogan', e.target.value)}
                            placeholder="mis. Segar Setiap Hari & Berkualitas"
                        />
                    </Field>

                    <Field
                        label="Pesan Penutup Nota (Footer)"
                        error={errors.footer}
                        hint="Kosongkan untuk memakai teks default 'Terima kasih sudah berbelanja'."
                    >
                        <textarea
                            rows={2}
                            className={inputClass}
                            value={data.footer}
                            onChange={(e) => setData('footer', e.target.value)}
                            placeholder={'Terima kasih atas kunjungan Anda\nBarang yang dibeli tidak dapat ditukar'}
                        />
                    </Field>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:scale-100"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                        {recentlySuccessful && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100 animate-in fade-in">
                                <CheckCircle2 className="h-4 w-4" /> Berhasil Disimpan
                            </span>
                        )}
                    </div>
                </form>

                {/* Pratinjau Nota (Live Receipt Preview) */}
                <div className="self-start lg:sticky lg:top-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <ReceiptText className="h-4 w-4 text-indigo-600" />
                        <span>Pratinjau Cetak Nota Langsung (Live Preview)</span>
                    </div>

                    <div className="mx-auto w-[310px] rounded-3xl bg-white p-5 font-mono text-[11px] leading-relaxed text-slate-900 shadow-2xl shadow-indigo-500/10 border border-slate-100/80">
                        <div className="text-center space-y-0.5">
                            <div className="text-sm font-black uppercase tracking-wider text-slate-900">{data.name || 'NAMA TOKO'}</div>
                            {data.address && <div className="whitespace-pre-line text-slate-600">{data.address}</div>}
                            {data.phone && <div className="text-slate-600">Telp/WA: {data.phone}</div>}
                            {data.slogan && <div className="mt-1 italic text-indigo-600 font-bold">{data.slogan}</div>}
                        </div>

                        <Line />
                        <Row l="No" r="INV-2611091234" />
                        <Row l="Tanggal" r="09 Nov 2026, 10:54" />
                        <Row l="Kasir" r="Brian" />
                        <Line />

                        {SAMPLE.map((it) => (
                            <div key={it.name} className="mb-2">
                                <div className="font-bold text-slate-900">{it.name}</div>
                                <div className="flex justify-between text-slate-600">
                                    <span>
                                        {it.qty} {it.unit} x {rp(it.price)}
                                    </span>
                                    <span className="font-bold">{rp(it.qty * it.price)}</span>
                                </div>
                            </div>
                        ))}

                        <Line />
                        <Row l="TOTAL" r={rp(total)} bold />
                        <Row l="Bayar" r={rp(100000)} />
                        <Row l="Kembali" r={rp(100000 - total)} />
                        <Line />

                        <div className="whitespace-pre-line text-center text-slate-600 font-medium pt-1">
                            {data.footer || 'Terima kasih sudah berbelanja'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Pengaturan.layout = (page) => <KasirLayout>{page}</KasirLayout>;