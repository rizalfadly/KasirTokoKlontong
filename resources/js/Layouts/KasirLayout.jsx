import { Link, usePage } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import Background from '../Components/Layout/Background';
import Brand from '../Components/Layout/Brand';
import MobileNav from '../Components/Layout/MobileNav';
import NotificationBell from '../Components/Layout/NotificationBell';
import Sidebar from '../Components/Layout/Sidebar';
import { menuFor } from '../Components/Layout/menu';

const shell =
    'relative isolate min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 text-slate-800';

export default function KasirLayout({ children }) {
    const user = usePage().props.auth?.user;

    // Tamu (belum login): tanpa sidebar, hanya header sederhana
    if (!user) {
        return (
            <div className={shell}>
                <Background />
                <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
                        <Brand />
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105"
                        >
                            <LogIn className="h-4 w-4" />
                            Masuk
                        </Link>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        );
    }

    // Sudah login: menu disaring sesuai peran
    const sections = menuFor(user.role);
    const canNotify = ['owner', 'admin', 'kasir'].includes(user.role);

    return (
        <div className={shell}>
            <Background />
            <Sidebar user={user} sections={sections} />

            <div className="lg:pl-64 print:pl-0">
                {/* Bar atas: logo (HP) dan lonceng notifikasi */}
                <header
                    className={
                        'sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/60 bg-white/60 px-4 backdrop-blur-xl md:px-8 print:hidden ' +
                        (canNotify ? '' : 'lg:hidden')
                    }
                >
                    <div className="min-w-0 lg:hidden">
                        <Brand />
                    </div>
                    {canNotify && (
                        <div className="ml-auto">
                            <NotificationBell />
                        </div>
                    )}
                </header>

                <main className="pb-24 lg:pb-8">{children}</main>
            </div>

            <MobileNav user={user} sections={sections} />
        </div>
    );
}