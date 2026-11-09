import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsActive } from './menu';

export default function NavMenu({ sections, onNavigate }) {
    const active = useIsActive();

    const [openGroups, setOpenGroups] = useState({});
    const toggle = (name, current) => setOpenGroups((prev) => ({ ...prev, [name]: !current }));

    return (
        <nav className="space-y-1.5 px-2">
            {sections.map((s, idx) => {
                // Menu tunggal (Dashboard, Laporan)
                if (!s.items) {
                    const isActive = active(s.href);
                    return (
                        <div key={s.href}>
                            <Link
                                href={s.href}
                                onClick={onNavigate}
                                className={
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ' +
                                    (isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                }
                            >
                                <s.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                <span className="tracking-tight">{s.label}</span>
                            </Link>
                            {idx === 0 && <hr className="my-3 border-slate-200/80 mx-2" />}
                        </div>
                    );
                }

                // Grup dropdown (Penjualan, Persediaan, Pengaturan)
                const hasActive = s.items.some((i) => active(i.href));
                const expanded = openGroups[s.group] ?? hasActive;

                return (
                    <div key={s.group} className="space-y-1">
                        <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => toggle(s.group, expanded)}
                            className={
                                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ' +
                                (hasActive && !expanded
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/60'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                            }
                        >
                            <s.icon className={`h-5 w-5 shrink-0 ${hasActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="flex-1 text-left tracking-tight">{s.group}</span>
                            <ChevronDown
                                className={
                                    'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ' +
                                    (expanded ? 'rotate-180 text-indigo-600' : '')
                                }
                            />
                        </button>

                        <div
                            className={
                                'grid transition-all duration-300 ease-in-out ' +
                                (expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
                            }
                        >
                            <div className="overflow-hidden">
                                <div className="ml-5 space-y-1 border-l-2 border-indigo-100 py-1.5 pl-3">
                                    {s.items.map((i) => {
                                        const isItemActive = active(i.href);
                                        return (
                                            <Link
                                                key={i.href}
                                                href={i.href}
                                                tabIndex={expanded ? 0 : -1}
                                                onClick={onNavigate}
                                                className={
                                                    'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ' +
                                                    (isItemActive
                                                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                                                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900')
                                                }
                                            >
                                                <i.icon className={`h-4 w-4 shrink-0 ${isItemActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span>{i.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}