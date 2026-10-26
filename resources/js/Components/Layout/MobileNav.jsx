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
            {/* Bar bawah: item utama + tombol Menu */}
            <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/60 bg-white/80 backdrop-blur-xl print:hidden lg:hidden">
                {quick.map((i) => (
                    <Link
                        key={i.href}
                        href={i.href}
                        className={
                            'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ' +
                            (active(i.href) ? 'text-orange-600' : 'text-slate-400')
                        }
                    >
                        <i.icon className="h-5 w-5" />
                        {i.label}
                    </Link>
                ))}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-400"
                >
                    <MenuIcon className="h-5 w-5" />
                    Menu
                </button>
            </nav>

            {/* Laci menu */}
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden print:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={close} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <Brand />
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Tutup menu"
                                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <NavMenu sections={sections} onNavigate={close} />
                        <div className="mt-4 border-t border-slate-200 pt-4">
                            <UserProfile user={user} onNavigate={close} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}