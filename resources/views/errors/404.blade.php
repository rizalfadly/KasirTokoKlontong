<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - GAK ADA WOY</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
        }
    </style>
</head>
<body class="bg-slate-950 min-h-screen flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
    
    <!-- Background Glow Dekoratif -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

    <div class="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        
        <!-- Area Ilustrasi / Animasi Karakter Bingung Nyari Barang -->
        <div class="relative w-48 h-40 mx-auto mb-6 flex items-center justify-center animate-float">
            <!-- Lingkaran Cahaya Belakang -->
            <div class="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
            
            <!-- SVG Animasi Orang/Kasir Bingung Sambil Bawa Kaca Pembesar -->
            <svg class="relative w-36 h-36 drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Kepala & Rambut -->
                <circle cx="100" cy="70" r="28" fill="#fbcfe8" />
                <path d="M75 60C75 45 88 38 100 38C112 38 125 45 125 60V70H75V60Z" fill="#334155" />

                <!-- Badan / Kaos Kasir -->
                <path d="M60 135C60 110 78 100 100 100C122 100 140 110 140 135V155H60V135Z" fill="#0ea5e9" />

                <!-- Mata Melotot Bingung -->
                <circle cx="91" cy="68" r="3" fill="#0f172a" />
                <circle cx="109" cy="68" r="3" fill="#0f172a" />
                <!-- Mulut Menganga O -->
                <ellipse cx="100" cy="80" rx="4" ry="6" fill="#0f172a" />

                <!-- Tangan Memegang Kaca Pembesar yang Bergerak -->
                <circle cx="130" cy="115" r="18" stroke="#38bdf8" stroke-width="6" fill="rgba(56, 189, 248, 0.1)" />
                <line x1="143" y1="128" x2="165" y2="150" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" />

                <!-- Tanda Tanya Mengambang -->
                <text x="40" y="60" fill="#fbbf24" font-size="28" font-weight="bold" class="animate-pulse">?</text>
                <text x="150" y="50" fill="#f43f5e" font-size="20" font-weight="bold" class="animate-pulse">?</text>
            </svg>
        </div>

        <!-- Kode & Judul Khas -->
        <div class="inline-block px-3 py-1 mb-3 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wider uppercase">
            Error 404 &bull; Halaman Hilang
        </div>
        <h1 class="text-xl font-bold text-slate-100 tracking-tight">NYARI APA ? GAK ADA WOY</h1>
        
        <!-- Pesan Khas -->
        <p class="mt-2 text-sm text-slate-400 leading-relaxed">
            BALIK SANA BALIK, BALIK. Halaman yang kamu cari gak ketemu di sistem toko ini.
        </p>

        <!-- Tombol Aksi -->
        <div class="mt-6">
            <a href="/dashboard" class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center">
                Balik ke Dashboard Saja
            </a>
        </div>

        <!-- Catatan Footer Kecil -->
        <div class="mt-6 text-xs text-slate-500">
            TOKO BERIAN BERKAH TELUR &bull; Sistem POS v2.4
        </div>
    </div>

</body>
</html>