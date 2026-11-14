import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsActive } from './menu';

export default function NavMenu({ sections, onNavigate, minimized = false }) {
    const active = useIsActive();

    const [openGroups, setOpenGroups] = useState({});
    const [flyout, setFlyout] = useState(null); // { group, top, left }
    const flyoutRef = useRef(null);
    const navRef = useRef(null);

    const toggle = (name, current) => setOpenGroups((prev) => ({ ...prev, [name]: !current }));

    // Tutup flyout saat sidebar dibuka lagi
    useEffect(() => {
        if (!minimized) setFlyout(null);
    }, [minimized]);

    // Tutup flyout: klik di luar, tombol Escape, atau scroll
    useEffect(() => {
        if (!flyout) return;

        const onMouseDown = (e) => {
            const insideNav = navRef.current?.contains(e.target);
            const insideFlyout = flyoutRef.current?.contains(e.target);
            if (!insideNav && !insideFlyout) setFlyout(null);
        };
        const onKey = (e) => e.key === 'Escape' && setFlyout(null);
        const onScroll = () => setFlyout(null);

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKey);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [flyout]);

    const openFlyout = (e, group, itemCount) => {
        if (flyout?.group === group) return setFlyout(null);
        const rect = e.currentTarget.getBoundingClientRect();
        const estimatedHeight = itemCount * 44 + 56;
        const top = Math.max(8, Math.min(rect.top, window.innerHeight - estimatedHeight - 8));
        setFlyout({ group, top, left: rect.right + 12 });
    };

    return (
        <nav ref={navRef} className="space-y-1.5 px-2">
            {sections.map((s, idx) => {
                // Menu tunggal (Dashboard, Laporan)
                if (!s.items) {
                    const isActive = active(s.href);
                    return (
                        <div key={s.href}>
                            <Link
                                href={s.href}
                                onClick={onNavigate}
                                title={minimized ? s.label : undefined}
                                className={
                                    'flex w-full items-center gap-3 rounded-2xl py-3 text-sm font-bold transition-all duration-300 ' +
                                    (minimized ? 'justify-center px-2' : 'px-4') + ' ' +
                                    (isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                }
                            >
                                <s.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                {!minimized && <span className="tracking-tight truncate">{s.label}</span>}
                            </Link>
                            {idx === 0 && <hr className={`my-3 border-slate-200/85 ${minimized ? 'mx-1' : 'mx-2'}`} />}
                        </div>
                    );
                }

                // Grup dropdown (Penjualan, Persediaan, Pengaturan)
                const hasActive = s.items.some((i) => active(i.href));
                const expanded = openGroups[s.group] ?? hasActive;
                const flyoutOpen = minimized && flyout?.group === s.group;

                const highlighted = minimized ? hasActive || flyoutOpen : hasActive && !expanded;

                return (
                    <div key={s.group} className="space-y-1">
                        <button
                            type="button"
                            aria-expanded={minimized ? flyoutOpen : expanded}
                            aria-haspopup={minimized ? 'menu' : undefined}
                            onClick={(e) =>
                                minimized
                                    ? openFlyout(e, s.group, s.items.length)
                                    : toggle(s.group, expanded)
                            }
                            title={minimized ? s.group : undefined}
                            className={
                                'flex w-full items-center gap-3 rounded-2xl py-3 text-sm font-bold transition-all duration-300 ' +
                                (minimized ? 'justify-center px-2' : 'px-4') + ' ' +
                                (highlighted
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/60'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                            }
                        >
                            <s.icon className={`h-5 w-5 shrink-0 ${hasActive || flyoutOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
                            {!minimized && (
                                <>
                                    <span className="flex-1 text-left tracking-tight truncate">{s.group}</span>
                                    <ChevronDown
                                        className={
                                            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ' +
                                            (expanded ? 'rotate-180 text-indigo-600' : '')
                                        }
                                    />
                                </>
                            )}
                        </button>

                        {/* Sub-menu inline (hanya saat sidebar tidak minimize) */}
                        {!minimized && (
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
                                                    <span className="truncate">{i.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Flyout saat minimize, dirender di body via portal */}
                        {flyoutOpen &&
                            createPortal(
                                <div
                                    ref={flyoutRef}
                                    role="menu"
                                    style={{ position: 'fixed', top: flyout.top, left: flyout.left }}
                                    className="z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
                                >
                                    <p className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                        {s.group}
                                    </p>
                                    {s.items.map((i) => {
                                        const isItemActive = active(i.href);
                                        return (
                                            <Link
                                                key={i.href}
                                                href={i.href}
                                                role="menuitem"
                                                onClick={() => {
                                                    setFlyout(null);
                                                    onNavigate?.();
                                                }}
                                                className={
                                                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ' +
                                                    (isItemActive
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                                }
                                            >
                                                <i.icon className={`h-4 w-4 shrink-0 ${isItemActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span className="truncate">{i.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>,
                                document.body
                            )}
                    </div>
                );
            })}
        </nav>
    );
}