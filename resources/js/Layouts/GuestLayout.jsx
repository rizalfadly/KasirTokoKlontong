import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Background from '../Components/Layout/Background';

export default function GuestLayout({ children }) {
    return (
        <div className="relative isolate flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50/90 via-slate-50 to-orange-50/90 px-4 py-8 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
            
            {/* Background & Efek Cahaya Bergerak */}
            <Background />
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl animate-pulse pointer-events-none duration-1000" />

            {/* Header / Logo dengan Animasi Putar Lembut */}
            <div className="relative z-10 mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                <Link href="/" className="inline-block group">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-blue-600 shadow-xl shadow-indigo-500/30 mx-auto p-4 text-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/50 group-hover:-translate-y-1">
                        
                        {/* Logo berputar pelan secara kontinu */}
                        <div className="animate-spin-slow flex items-center justify-center">
                            <ApplicationLogo className="h-12 w-12 fill-current" />
                        </div>
                        
                        {/* Kilau Cahaya Titik */}
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-300 animate-ping" />
                    </div>
                </Link>

                {/* Badge Identitas Toko */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-extrabold text-indigo-700 border border-indigo-100/80 shadow-lg shadow-indigo-500/5 backdrop-blur-md transition-transform hover:scale-105">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-bounce" />
                    <span>Brian Berkah Telur &bull; POS System</span>
                </div>
            </div>

            {/* Kartu Container Utama Form */}
            <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-white/80 bg-white/90 px-6 py-8 shadow-2xl shadow-indigo-500/15 backdrop-blur-2xl sm:max-w-md md:px-8 animate-in fade-in zoom-in-95 duration-500">
                {children}
            </div>

            {/* Fitur Keunggulan di Bawah Form */}
            <div className="relative z-10 mt-6 flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 animate-pulse" />
                    <span>Aman & Real-Time</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500 animate-bounce" />
                    <span>Super Cepat</span>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-3 text-center text-xs font-medium text-slate-400">
                &copy; {new Date().getFullYear()} Dsn Balong Dinding &bull; All rights reserved.
            </div>
        </div>
    );
}