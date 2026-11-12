<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>503 - Layanan Sedang Pemeliharaan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
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
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

    <div class="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        
        <!-- Area Ilustrasi / Animasi Karakter -->
        <div class="relative w-48 h-40 mx-auto mb-6 flex items-center justify-center animate-float">
            <!-- Lingkaran Cahaya Belakang -->
            <div class="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-xl"></div>
            
            <!-- SVG Animasi Orang/Teknisi Sedang Memperbaiki Sistem -->
            <svg class="relative w-36 h-36 drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Kepala & Topi Teknisi -->
                <circle cx="100" cy="70" r="28" fill="#fb923c" />
                <path d="M72 65C72 50 85 40 100 40C115 40 128 50 128 65H72Z" fill="#f97316" />
                <rect x="65" y="62" width="70" height="8" rx="4" fill="#ea580c" />
                
                <!-- Badan / Jaket -->
                <path d="M60 135C60 110 78 100 100 100C122 100 140 110 140 135V155H60V135Z" fill="#334155" />
                <path d="M85 100L100 120L115 100V155H85V100Z" fill="#475569" />

                <!-- Tangan & Kunci Pas yang Bergerak Dikit -->
                <circle cx="55" cy="125" r="10" fill="#fb923c" />
                <path d="M40 115L55 125L48 140" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

                <!-- Kacamata / Ekspresi Fokus -->
                <rect x="85" y="62" width="14" height="8" rx="3" fill="#0f172a" />
                <rect x="101" y="62" width="14" height="8" rx="3" fill="#0f172a" />
                <line x1="99" y1="65" x2="101" y2="65" stroke="#0f172a" stroke-width="2" />

                <!-- Efek Gigi Roda / Server Mengambang di Sekitar -->
                <circle cx="150" cy="50" r="8" fill="#38bdf8" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="80" r="6" fill="#f43f5e" opacity="0.8">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>

        <!-- Kode & Judul -->
        <div class="inline-block px-3 py-1 mb-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase">
            Error 503 • Server Sibuk
        </div>
        <h1 class="text-xl font-bold text-slate-100 tracking-tight">Sistem Sedang Istirahat Sebentar</h1>
        
        <!-- Pesan Ramah -->
        <p class="mt-2 text-sm text-slate-400 leading-relaxed">
            Tenang, data transaksi dan stok toko Anda tetap aman di database. Teknisi kami sedang memperbaikinya.
        </p>

        <!-- Tombol Aksi -->
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button onclick="window.location.reload();" class="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700/60 active:scale-95">
                Muat Ulang
            </button>
            <a href="/dashboard" class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center">
                Ke Dashboard
            </a>
        </div>

        <!-- Catatan Footer Kecil -->
        <div class="mt-6 text-xs text-slate-500">
            TOKO BERIAN BERKAH TELUR &bull; Sistem POS v2.4
        </div>
    </div>

</body>
</html>