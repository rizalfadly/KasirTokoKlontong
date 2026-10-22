import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

const FEATURES = [
    { icon: '🛒', text: 'Transaksi cepat dengan kembalian otomatis' },
    { icon: '📦', text: 'Stok dan satuan produk selalu terpantau' },
    { icon: '📈', text: 'Laporan harian, bulanan, dan tahunan' },
];

function Brand({ size = 'lg' }) {
    const { store } = usePage().props;
    const name = store?.name || 'Brian Berkah Telur';
    const logo = store?.logo_url || '/images/logotoko.png';
    const box = size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';

    return (
        <div className="flex items-center gap-4">
            <img
                src={logo}
                alt={name}
                className={`${box} shrink-0 rounded-3xl bg-white object-contain p-1 shadow-lg shadow-orange-200`}
            />
            <div className={size === 'lg' ? 'text-3xl font-bold' : 'text-xl font-bold'}>{name}</div>
        </div>
    );
}

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });
    const [show, setShow] = useState(false);

    // Pesan bawaan Laravel (bahasa Inggris) diganti ke bahasa Indonesia
    const usernameError =
        errors.username === 'These credentials do not match our records.'
            ? 'Username atau kata sandi salah.'
            : errors.username;

    function submit(e) {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    }

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-orange-50 text-slate-800">
            <Head title="Masuk" />

            {/* Background: gumpalan warna blur */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
                <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-300/40 blur-3xl" />
                <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-200/50 blur-3xl" />
            </div>

            <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
                {/* Sisi kiri: branding (desktop) */}
                <div className="hidden lg:block">
                    <Brand />

                    <h1 className="mt-10 text-4xl font-bold leading-tight">
                        Kelola penjualan tokomu
                        <br />
                        jadi lebih <span className="text-orange-500">mudah</span>.
                    </h1>
                    <p className="mt-4 max-w-md text-slate-500">
                        Catat transaksi, pantau stok, dan lihat laporan penjualan dalam satu aplikasi.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {FEATURES.map((f) => (
                            <li
                                key={f.text}
                                className="flex max-w-md items-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur"
                            >
                                <span className="text-xl">{f.icon}</span>
                                <span className="text-sm font-medium text-slate-600">{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sisi kanan: form */}
                <div className="mx-auto w-full max-w-md">
                    {/* Logo (HP) */}
                    <div className="mb-6 flex justify-center lg:hidden">
                        <Brand size="md" />
                    </div>

                    <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-orange-100 backdrop-blur-xl">
                        <h2 className="text-2xl font-bold">Selamat datang 👋</h2>
                        <p className="mt-1 text-sm text-slate-500">Masuk untuk membuka kasir dan laporan.</p>

                        {status && (
                            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-600">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    autoFocus
                                    className={inputCls}
                                />
                                {usernameError && <p className="mt-1 text-xs text-red-600">{usernameError}</p>}
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                                        Kata sandi
                                    </label>
                                    {canResetPassword && (
                                        <Link href="/forgot-password" className="text-xs font-medium text-orange-600 hover:underline">
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={show ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi"
                                        autoComplete="current-password"
                                        className={inputCls + ' pr-20'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                                    >
                                        {show ? 'Sembunyikan' : 'Lihat'}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <button
                                disabled={processing}
                                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-5 text-center">
                        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-orange-600">
                            ← Kembali ke dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}