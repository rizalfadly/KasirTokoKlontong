import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingCart, Package, TrendingUp, Hand, Eye, EyeOff, ArrowLeft, Sparkles, Lock, User } from 'lucide-react';

const inputCls =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 placeholder:font-normal focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm';

const FEATURES = [
    { icon: ShoppingCart, text: 'Transaksi cepat dengan kalkulasi kembalian otomatis' },
    { icon: Package, text: 'Stok gudang & satuan produk selalu terpantau real-time' },
    { icon: TrendingUp, text: 'Laporan omset harian, bulanan, dan rekap setoran owner' },
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
                className={`${box} shrink-0 rounded-3xl bg-white object-contain p-1 shadow-xl shadow-indigo-500/10 border border-slate-100`}
            />
            <div className={size === 'lg' ? 'text-3xl font-black tracking-tight text-slate-900' : 'text-xl font-black tracking-tight text-slate-900'}>
                {name}
            </div>
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

    const usernameError =
        errors.username === 'These credentials do not match our records.'
            ? 'Username atau kata sandi yang kamu masukkan salah.'
            : errors.username;

    function submit(e) {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    }

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-amber-50 text-slate-800">
            <Head title="Masuk ke Sistem" />

            {/* Background: gumpalan warna blur */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-indigo-300/30 blur-3xl animate-pulse" />
                <div className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-amber-300/30 blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl" />
            </div>

            <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
                {/* Sisi kiri: branding & fitur (desktop) */}
                <div className="hidden lg:block space-y-6">
                    <Brand />

                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-black text-indigo-700 shadow-sm border border-indigo-200">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Sistem Kasir & POS Profesional</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                            Kelola penjualan toko <br />
                            jadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">lebih mudah & akurat</span>.
                        </h1>
                        <p className="max-w-md text-sm font-medium text-slate-600 leading-relaxed">
                            Catat transaksi harian, pantau stok telur dan sembako, serta kelola setoran keuangan dalam satu aplikasi terpadu.
                        </p>
                    </div>

                    <ul className="space-y-3.5 pt-4">
                        {FEATURES.map((f) => (
                            <li
                                key={f.text}
                                className="flex max-w-md items-center gap-4 rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm">
                                    <f.icon className="h-5 w-5" />
                                </span>
                                <span className="text-xs font-extrabold text-slate-700 leading-snug">{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sisi kanan: form login */}
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-6 flex justify-center lg:hidden">
                        <Brand size="md" />
                    </div>

                    <div className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 text-2xl font-black text-slate-900">
                                <span>Selamat Datang</span>
                                <Hand className="h-6 w-6 text-amber-500 animate-bounce" />
                            </div>
                            <p className="mt-1 text-xs md:text-sm font-medium text-slate-500">
                                Masuk untuk membuka kasir, stok opname, dan laporan.
                            </p>
                        </div>

                        {status && (
                            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm">
                                <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{status}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Username Karyawan / Admin
                                </label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Masukkan username kamu..."
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        autoFocus
                                        className={inputCls + ' pl-11'}
                                    />
                                </div>
                                {usernameError && <p className="mt-1 text-xs font-extrabold text-rose-600">⚠️ {usernameError}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Kata Sandi
                                    </label>
                                    {canResetPassword && (
                                        <Link href="/forgot-password" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700">
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="password"
                                        type={show ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi..."
                                        autoComplete="current-password"
                                        className={inputCls + ' pl-11 pr-12'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        aria-label={show ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                    >
                                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs font-extrabold text-rose-600">⚠️ {errors.password}</p>}
                            </div>

                            <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-temp pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded-lg border-slate-300 accent-indigo-600 cursor-pointer"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Memproses Masuk...' : 'Masuk ke Sistem Kasir'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Halaman Utama
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

Login.layout = (page) => page;