import { Head } from '@inertiajs/react';

const PESAN = {
    404: {
        emoji: '🔍',
        judul: 'Halaman tidak ditemukan',
        isi: 'Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa lagi alamatnya, atau kembali ke dashboard.',
    },
    500: {
        emoji: '🛠️',
        judul: 'Terjadi kesalahan di server',
        isi: 'Maaf, ada masalah di sisi aplikasi. Data transaksi Anda tetap aman. Coba muat ulang, dan kalau masih terjadi, hubungi admin.',
    },
    503: {
        emoji: '⏳',
        judul: 'Sedang dalam perawatan',
        isi: 'Aplikasi sedang diperbarui. Silakan coba lagi beberapa menit lagi.',
    },
};

export default function Error({ status = 500 }) {
    const m = PESAN[status] ?? PESAN[500];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6">
            <Head title={`${status} - ${m.judul}`} />

            {/* latar blur oranye + biru muda, sama seperti aplikasi */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />

            <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 text-4xl shadow-lg shadow-orange-200">
                    {m.emoji}
                </div>

                <div className="mt-5 text-6xl font-extrabold text-orange-500">{status}</div>
                <h1 className="mt-2 text-xl font-bold text-slate-800">{m.judul}</h1>
                <p className="mt-2 text-sm text-slate-500">{m.isi}</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/dashboard')}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                    >
                        ← Kembali
                    </button>
                    {/* <a> biasa (bukan Link) supaya halaman dimuat ulang penuh */}
                    <a
                        href="/dashboard"
                        className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                    >
                        🏠 Ke dashboard
                    </a>
                </div>

                {status >= 500 && (
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm text-slate-500 hover:text-orange-600 hover:underline"
                    >
                        Muat ulang halaman
                    </button>
                )}
            </div>
        </div>
    );
}