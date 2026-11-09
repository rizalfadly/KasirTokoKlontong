import { Link } from '@inertiajs/react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useState } from 'react';
import Brand from './Brand';
import NavMenu from './NavMenu';
import UserProfile from './UserProfile';
import { quickItems, useIsActive } from './menu';

export default function MobileNav({ user, sections }) {
    const [open, setOpen] = useState(false);
    const active = useIsActive();
    const close = () => setOpen(false);
    const quick = quickItems(sections);

    return (
        <>
            {/* Bar bawah (Mobile): item utama + tombol Menu dengan efek Glassmorphism */}
            <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/80 bg-white/85 px-2 py-1 backdrop-blur-2xl print:hidden lg:hidden shadow-lg shadow-slate-900/10">
                {quick.map((i) => {
                    const isActive = active(i.href);
                    return (
                        <Link
                            key={i.href}
                            href={i.href}
                            className={
                                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition-all duration-300 ' +
                                (isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600')
                            }
                        >
                            <i.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                            <span className="truncate max-w-[64px]">{i.label}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                >
                    <MenuIcon className="h-5 w-5" />
                    <span>Menu</span>
                </button>
            </nav>

            {/* Laci Menu (Bottom Sheet) */}
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden print:hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={close} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <Brand />
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Tutup menu"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <NavMenu sections={sections} onNavigate={close} />
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <UserProfile user={user} onNavigate={close} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}