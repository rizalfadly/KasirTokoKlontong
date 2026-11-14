import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LogIn, Menu } from 'lucide-react'; // Tambahkan icon Menu
import Background from '../Components/Layout/Background';
import Brand from '../Components/Layout/Brand';
import MobileNav from '../Components/Layout/MobileNav';
import NotificationBell from '../Components/Layout/NotificationBell';
import Sidebar from '../Components/Layout/Sidebar';
import { menuFor } from '../Components/Layout/menu';
import { DialogProvider } from '../Components/Dialog';
import { FlashToasts, ToastProvider } from '../Components/Toast';

const shell =
    'relative isolate min-h-screen bg-gradient-to-br from-indigo-50/60 via-slate-50 to-orange-50/60 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white';

export default function KasirLayout({ children }) {
    const user = usePage().props.auth?.user;
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Tamu (belum login)
    if (!user) {
        return (
            <div className={shell}>
                <Background />
                <header className="sticky top-0 z-20 border-b border-white/20 bg-transparent backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
                        <Brand />
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Masuk</span>
                        </Link>
                    </div>
                </header>
                <main className="relative z-10">{children}</main>
            </div>
        );
    }

    const sections = menuFor(user.role);
    const canNotify = ['owner', 'admin', 'kasir'].includes(user.role);

    return (
        <DialogProvider>
            <ToastProvider>
                <FlashToasts />
                <div className={shell}>
                    <Background />
                    
                    <Sidebar 
                        user={user} 
                        sections={sections} 
                        isCollapsed={isCollapsed} 
                    />

            <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'} print:pl-0`}>
                {/* Header Atas */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 md:px-8 print:hidden bg-transparent">
                    <div className="flex items-center gap-3">
                        {/* Tombol Garis Tiga di Pojok Kiri Atas khusus Desktop */}
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-600 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                            title={isCollapsed ? "Perbesar Sidebar" : "Kecilkan Sidebar"}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 lg:hidden">
                            <Brand />
                        </div>
                    </div>

                    {canNotify && (
                        <div className="ml-auto flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 px-1 py-1 shadow-sm">
                            <NotificationBell />
                        </div>
                    )}
                </header>

                <main className="relative z-10 pb-24 lg:pb-8">{children}</main>
            </div>

            <MobileNav user={user} sections={sections} />
        </div>
        </ToastProvider>
    </DialogProvider>
    );
}