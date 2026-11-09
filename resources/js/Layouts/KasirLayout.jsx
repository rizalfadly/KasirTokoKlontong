import { Link, usePage } from '@inertiajs/react';
import { LogIn, Bell } from 'lucide-react';
import Background from '../Components/Layout/Background';
import Brand from '../Components/Layout/Brand';
import MobileNav from '../Components/Layout/MobileNav';
import NotificationBell from '../Components/Layout/NotificationBell';
import Sidebar from '../Components/Layout/Sidebar';
import { menuFor } from '../Components/Layout/menu';

const shell =
    'relative isolate min-h-screen bg-gradient-to-br from-indigo-50/60 via-slate-50 to-orange-50/60 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white';

export default function KasirLayout({ children }) {
    const user = usePage().props.auth?.user;

    // Tamu (belum login)
    if (!user) {
        return (
            <div className={shell}>
                <Background />
                <header className="sticky top-0 z-20 border-b border-white/80 bg-white/80 backdrop-blur-xl shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
                        <Brand />
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Masuk Sistem</span>
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
        <div className={shell}>
            <Background />
            <Sidebar user={user} sections={sections} />

            <div className="lg:pl-64 print:pl-0">
                {/* Header atas transparan mengambang yang elegan tanpa garis putih kaku */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 md:px-8 print:hidden">
                    <div className="min-w-0 lg:hidden">
                        <Brand />
                    </div>
                    {canNotify && (
                        <div className="ml-auto flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 px-1 py-1 shadow-sm">
                            <NotificationBell />
                        </div>
                    )}
                </header>

                <main className="relative z-10 pb-24 lg:pb-8">{children}</main>
            </div>

            <MobileNav user={user} sections={sections} />
        </div>
    );
}