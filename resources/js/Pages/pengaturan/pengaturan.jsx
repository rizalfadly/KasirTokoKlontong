import { Head, useForm } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

const card = 'rounded-2xl border border-white/70 bg-white/75 shadow-sm backdrop-blur-md';

// Contoh isi nota untuk pratinjau
const SAMPLE = [
    { name: 'Telur Ayam Negeri', qty: 2, unit: 'kilo', price: 28000 },
    { name: 'Telur Bebek', qty: 10, unit: 'butir', price: 3500 },
];

function Field({ label, error, hint, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function Row({ l, r, bold }) {
    return (
        <div className={'flex justify-between gap-2 ' + (bold ? 'text-sm font-bold' : '')}>
            <span>{l}</span>
            <span className="text-right">{r}</span>
        </div>
    );
}

const Line = () => <hr className="my-2 border-t border-dashed border-black" />;

export default function Pengaturan({ store }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: store.name ?? '',
        address: store.address ?? '',
        phone: store.phone ?? '',
        slogan: store.slogan ?? '',
        footer: store.footer ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put('/pengaturan', { preserveScroll: true });
    }

    const total = SAMPLE.reduce((s, i) => s + i.qty * i.price, 0);

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Pengaturan Toko" />

            <div>
                <h1 className="text-2xl font-bold">Pengaturan Toko</h1>
                <p className="text-sm text-slate-500">Identitas ini tampil di bagian atas dan bawah setiap nota.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Form */}
                <form onSubmit={submit} className={card + ' space-y-4 self-start p-5'}>
                    <Field label="Nama toko" error={errors.name}>
                        <input
                            className={inputClass}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="mis. Toko Telur Barokah"
                        />
                    </Field>

                    <Field label="Alamat" error={errors.address} hint="Tekan Enter untuk pindah baris.">
                        <textarea
                            rows={3}
                            className={inputClass}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder={'Jl. Raya Merdeka No. 12\nSurabaya'}
                        />
                    </Field>

                    <Field label="Telepon / WhatsApp" error={errors.phone}>
                        <input
                            className={inputClass}
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="mis. 0812-3456-7890"
                        />
                    </Field>

                    <Field label="Slogan" error={errors.slogan}>
                        <input
                            className={inputClass}
                            value={data.slogan}
                            onChange={(e) => setData('slogan', e.target.value)}
                            placeholder="mis. Segar Setiap Hari"
                        />
                    </Field>

                    <Field
                        label="Pesan penutup nota"
                        error={errors.footer}
                        hint="Kosongkan untuk memakai 'Terima kasih sudah berbelanja'."
                    >
                        <textarea
                            rows={2}
                            className={inputClass}
                            value={data.footer}
                            onChange={(e) => setData('footer', e.target.value)}
                            placeholder={'Terima kasih atas kunjungan Anda\nBarang yang dibeli tidak dapat ditukar'}
                        />
                    </Field>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={processing}
                            className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        {recentlySuccessful && <span className="text-sm font-medium text-emerald-600">✓ Tersimpan</span>}
                    </div>
                </form>

                {/* Pratinjau nota */}
                <div className="self-start lg:sticky lg:top-6">
                    <div className="mb-2 text-sm font-medium text-slate-500">Pratinjau nota</div>
                    <div className="mx-auto w-[300px] rounded-xl bg-white p-4 font-mono text-[12px] leading-snug text-black shadow-lg">
                        <div className="text-center">
                            <div className="text-base font-bold uppercase tracking-wide">{data.name || 'NAMA TOKO'}</div>
                            {data.address && <div className="whitespace-pre-line">{data.address}</div>}
                            {data.phone && <div>Telp/WA: {data.phone}</div>}
                            {data.slogan && <div className="mt-1 italic">{data.slogan}</div>}
                        </div>

                        <Line />
                        <Row l="No" r="INV-261020123456" />
                        <Row l="Tanggal" r="20 Okt 2026, 10.30" />
                        <Row l="Kasir" r="KasirB" />
                        <Line />

                        {SAMPLE.map((it) => (
                            <div key={it.name} className="mb-1.5">
                                <div className="font-bold">{it.name}</div>
                                <div className="flex justify-between">
                                    <span>
                                        {it.qty} {it.unit} x {rp(it.price)}
                                    </span>
                                    <span>{rp(it.qty * it.price)}</span>
                                </div>
                            </div>
                        ))}

                        <Line />
                        <Row l="TOTAL" r={rp(total)} bold />
                        <Row l="Bayar" r={rp(100000)} />
                        <Row l="Kembali" r={rp(100000 - total)} />
                        <Line />

                        <div className="whitespace-pre-line text-center">
                            {data.footer || 'Terima kasih sudah berbelanja'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Pengaturan.layout = (page) => <KasirLayout>{page}</KasirLayout>;