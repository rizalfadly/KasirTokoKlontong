import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsActive } from './menu';

export default function NavMenu({ sections, onNavigate }) {
    const active = useIsActive();

    // Grup yang dibuka/ditutup manual. Kalau belum diklik, grup yang berisi halaman aktif terbuka otomatis.
    const [openGroups, setOpenGroups] = useState({});
    const toggle = (name, current) => setOpenGroups((prev) => ({ ...prev, [name]: !current }));

    return (
        <nav className="space-y-1">
            {sections.map((s, idx) => {
                // Menu tunggal (Dashboard, Laporan)
                if (!s.items) {
                    return (
                        <div key={s.href}>
                            <Link
                                href={s.href}
                                onClick={onNavigate}
                                className={
                                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ' +
                                    (active(s.href)
                                        ? 'bg-amber-100 text-amber-900 shadow-sm'
                                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900')
                                }
                            >
                                <s.icon className="h-5 w-5 shrink-0" />
                                {s.label}
                            </Link>
                            {idx === 0 && <hr className="my-2 border-slate-200/70" />}
                        </div>
                    );
                }

                // Grup dropdown (Penjualan, Persediaan, Pengaturan)
                const hasActive = s.items.some((i) => active(i.href));
                const expanded = openGroups[s.group] ?? hasActive;

                return (
                    <div key={s.group}>
                        <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => toggle(s.group, expanded)}
                            className={
                                'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ' +
                                (hasActive
                                    ? 'text-amber-900 ' + (expanded ? '' : 'bg-amber-100/70')
                                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900')
                            }
                        >
                            <s.icon className="h-5 w-5 shrink-0" />
                            <span className="flex-1 text-left">{s.group}</span>
                            <ChevronDown
                                className={
                                    'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ' +
                                    (expanded ? 'rotate-180' : '')
                                }
                            />
                        </button>

                        <div
                            className={
                                'grid transition-all duration-200 ease-out ' +
                                (expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
                            }
                        >
                            <div className="overflow-hidden">
                                <div className="ml-7 space-y-0.5 border-l border-slate-200 py-1 pl-2">
                                    {s.items.map((i) => (
                                        <Link
                                            key={i.href}
                                            href={i.href}
                                            tabIndex={expanded ? 0 : -1}
                                            onClick={onNavigate}
                                            className={
                                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ' +
                                                (active(i.href)
                                                    ? 'bg-amber-100 font-semibold text-amber-900'
                                                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900')
                                            }
                                        >
                                            <i.icon className="h-4 w-4 shrink-0" />
                                            {i.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}