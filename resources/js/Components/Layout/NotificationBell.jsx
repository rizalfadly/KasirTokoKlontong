import { router } from '@inertiajs/react';
import { Ban, Bell, CheckCheck, ClipboardCheck, Info, Package, PackagePlus, SlidersHorizontal, Wallet, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_MS = 10000; // cek notifikasi baru tiap 10 detik

const KIND = {
    opname: [ClipboardCheck, 'bg-sky-100 text-sky-700 shadow-sm shadow-sky-100'],
    shift: [Wallet, 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100'],
    void: [Ban, 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-100'],
    stock_low: [Package, 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100'],
    stock_out: [Package, 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-100'],
    purchase: [PackagePlus, 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100'],
    adjustment: [SlidersHorizontal, 'bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-100'],
};

const xsrf = () => decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] ?? '');

const post = (url) =>
    fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-XSRF-TOKEN': xsrf(), 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
    });

function ago(iso) {
    const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return 'baru saja';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
}

function KindIcon({ kind }) {
    const [Icon, style] = KIND[kind] ?? [Info, 'bg-slate-100 text-slate-600'];

    return (
        <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ' + style}>
            <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
    );
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({ unread: 0, items: [] });
    const [toast, setToast] = useState(null);
    const lastUnread = useRef(null);
    const box = useRef(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/notifikasi', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;
            const json = await res.json();

            // Ada notifikasi baru sejak pengecekan terakhir -> tampilkan pemberitahuan singkat
            if (lastUnread.current !== null && json.unread > lastUnread.current) {
                const latest = json.items.find((n) => !n.read);
                if (latest) {
                    setToast(latest);
                    setTimeout(() => setToast(null), 6000);
                }
            }

            lastUnread.current = json.unread;
            setData(json);
        } catch {
            // jaringan terputus: coba lagi pada putaran berikutnya
        }
    }, []);

    // Cek berkala, dan langsung cek saat tab kembali dibuka
    useEffect(() => {
        load();

        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') load();
        }, POLL_MS);

        const onVisible = () => document.visibilityState === 'visible' && load();
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [load]);

    // Klik di luar panel -> panel menutup
    useEffect(() => {
        if (!open) return;

        const close = (e) => {
            if (box.current && !box.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);

        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    function openItem(n) {
        setOpen(false);
        setToast(null);

        if (!n.read) {
            post(`/notifikasi/${n.id}/baca`);
            setData((d) => ({
                unread: Math.max(0, d.unread - 1),
                items: d.items.map((i) => (i.id === n.id ? { ...i, read: true } : i)),
            }));
            lastUnread.current = Math.max(0, (lastUnread.current ?? 1) - 1);
        }

        if (n.url) router.visit(n.url);
    }

    async function readAll() {
        await post('/notifikasi/baca-semua');
        lastUnread.current = 0;
        setData((d) => ({ unread: 0, items: d.items.map((i) => ({ ...i, read: true })) }));
    }

    return (
        <div ref={box} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Notifikasi"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 border border-slate-200/80 text-slate-600 shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            >
                <Bell className="h-5 w-5" strokeWidth={2} />
                {data.unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white shadow-md shadow-rose-500/40 animate-pulse">
                        {data.unread > 9 ? '9+' : data.unread}
                    </span>
                )}
            </button>

            {/* Pemberitahuan singkat (Toast) saat ada notifikasi baru */}
            {toast && !open && (
                <button
                    type="button"
                    onClick={() => openItem(toast)}
                    className="absolute right-0 top-full z-50 mt-3 flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-3xl border border-indigo-100 bg-white/95 p-4 text-left shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-300 hover:border-indigo-300 transition-all"
                >
                    <KindIcon kind={toast.kind} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-0.5">
                            <Sparkles className="h-3.5 w-3.5" /> Notifikasi Baru
                        </div>
                        <div className="text-sm font-bold text-slate-800 truncate">{toast.title}</div>
                        <div className="line-clamp-2 text-xs text-slate-500 mt-0.5">{toast.body}</div>
                    </div>
                </button>
            )}

            {/* Popover Panel Daftar Notifikasi */}
            {open && (
                <div className="absolute right-0 top-full z-50 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-extrabold text-slate-800">Notifikasi</div>
                            {data.unread > 0 && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                    {data.unread} baru
                                </span>
                            )}
                        </div>
                        {data.unread > 0 && (
                            <button
                                type="button"
                                onClick={readAll}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-sm text-slate-400">
                            <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                            <span className="font-semibold text-slate-600">Belum ada notifikasi</span>
                            <p className="text-xs text-slate-400 mt-1">Informasi aktivitas toko akan muncul di sini.</p>
                        </div>
                    ) : (
                        <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
                            {data.items.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => openItem(n)}
                                        className={
                                            'flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition-all hover:bg-indigo-50/50 ' +
                                            (n.read ? 'bg-white' : 'bg-indigo-50/30 font-semibold')
                                        }
                                    >
                                        <KindIcon kind={n.kind} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className={'truncate text-sm ' + (n.read ? 'font-bold text-slate-700' : 'font-extrabold text-slate-900')}>
                                                    {n.title}
                                                </span>
                                                <span className="shrink-0 text-[11px] font-medium text-slate-400">{ago(n.time)}</span>
                                            </div>
                                            <div className="line-clamp-2 text-xs text-slate-500 leading-relaxed">{n.body}</div>
                                        </div>
                                        {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600 shadow-sm shadow-indigo-400" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}