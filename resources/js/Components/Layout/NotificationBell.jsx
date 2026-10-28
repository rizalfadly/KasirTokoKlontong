import { router } from '@inertiajs/react';
import { Ban, Bell, CheckCheck, ClipboardCheck, Info, Package, PackagePlus, SlidersHorizontal, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_MS = 10000; // cek notifikasi baru tiap 20 detik

const KIND = {
    opname: [ClipboardCheck, 'bg-sky-100 text-sky-700'],
    shift: [Wallet, 'bg-emerald-100 text-emerald-700'],
    void: [Ban, 'bg-red-100 text-red-600'],
    stock_low: [Package, 'bg-orange-100 text-orange-600'],
    stock_out: [Package, 'bg-red-100 text-red-600'],
    purchase: [PackagePlus, 'bg-emerald-100 text-emerald-700'],
    adjustment: [SlidersHorizontal, 'bg-violet-100 text-violet-700'],
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
        <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' + style}>
            <Icon className="h-4 w-4" />
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
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-white/80"
            >
                <Bell className="h-5 w-5" />
                {data.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                        {data.unread > 9 ? '9+' : data.unread}
                    </span>
                )}
            </button>

            {/* Pemberitahuan singkat saat ada notifikasi baru */}
            {toast && !open && (
                <button
                    type="button"
                    onClick={() => openItem(toast)}
                    className="absolute right-0 top-full z-50 mt-2 flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-2xl"
                >
                    <KindIcon kind={toast.kind} />
                    <div className="min-w-0">
                        <div className="text-sm font-semibold">{toast.title}</div>
                        <div className="line-clamp-2 text-xs text-slate-500">{toast.body}</div>
                    </div>
                </button>
            )}

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div className="text-sm font-semibold">Notifikasi</div>
                        {data.unread > 0 && (
                            <button
                                type="button"
                                onClick={readAll}
                                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline"
                            >
                                <CheckCheck className="h-3.5 w-3.5" /> Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {data.items.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-slate-400">
                            <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                            Belum ada notifikasi.
                        </div>
                    ) : (
                        <ul className="max-h-96 divide-y divide-slate-50 overflow-y-auto">
                            {data.items.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => openItem(n)}
                                        className={
                                            'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-amber-50/60 ' +
                                            (n.read ? '' : 'bg-sky-50/60')
                                        }
                                    >
                                        <KindIcon kind={n.kind} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={'truncate text-sm ' + (n.read ? 'font-medium' : 'font-bold')}>
                                                    {n.title}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-slate-400">{ago(n.time)}</span>
                                            </div>
                                            <div className="line-clamp-2 text-xs text-slate-500">{n.body}</div>
                                        </div>
                                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
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