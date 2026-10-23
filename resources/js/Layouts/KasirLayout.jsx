import { Link, usePage } from '@inertiajs/react';

const menu = [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Kasir', href: '/kasir', icon: '🛒' },
    { label: 'Produk', href: '/produk', icon: '📦', roles: ['owner', 'admin'] },
    { label: 'Riwayat', href: '/riwayat', icon: '🧾' },
    { label: 'Laporan', href: '/laporan', icon: '📈', roles: ['owner', 'admin'] },
    { label: 'Pengguna', href: '/pengguna', icon: '👥', roles: ['owner'] },
    { label: 'Toko', href: '/pengaturan', icon: '🏪', roles: ['owner'] },
    { label: 'Buku Stok', href: '/buku-stok', icon: '📒', roles: ['owner', 'admin'] },
    { label: 'Opname', href: '/opname', icon: '🧮', roles: ['owner', 'admin'] },
];

const shell =
    'relative isolate min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 text-slate-800';

function Background() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
            <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
            <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-300/40 blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-200/50 blur-3xl" />
        </div>
    );
}

function Logo({ subtitle }) {
    const { store } = usePage().props;
    const name = store?.name || 'Kasir Telur';

    return (
        <div className="flex items-center gap-3">
            {store?.logo_url ? (
                <img
                    src={store.logo_url}
                    alt={name}
                    className="h-11 w-11 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-lg shadow-orange-100"
                />
            ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-2xl shadow-lg shadow-orange-200">
                    🥚
                </div>
            )}
            <div className="min-w-0">
                <div className="truncate text-lg font-bold leading-tight">{name}</div>
                {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
            </div>
        </div>
    );
}

export default function KasirLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const active = (href) => url.startsWith(href);

    // Tamu (belum login): tanpa sidebar, hanya header sederhana
    if (!user) {
        return (
            <div className={shell}>
                <Background />
                <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
                        <Logo />
                        <Link
                            href="/login"
                            className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105"
                        >
                            🔑 Masuk
                        </Link>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        );
    }

    // Sudah login: sidebar + menu bawah (HP)
    const items = menu.filter((m) => !m.roles || m.roles.includes(user.role));
    return (
        <div className={shell}>
            <Background />

            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl print:hidden lg:flex">
                <div className="px-6 py-6">
                    <Logo subtitle="Penjualan & stok" />
                </div>

                <nav className="flex-1 space-y-1 px-4">
                    {items.map((m) => (
                        <Link
                            key={m.href}
                            href={m.href}
                            className={
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ' +
                                (active(m.href)
                                    ? 'bg-amber-100 text-amber-900 shadow-sm'
                                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-800')
                            }
                        >
                            <span className="text-lg">{m.icon}</span>
                            {m.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-white/60 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                            {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{user.name}</div>
                            <Link href="/logout" method="post" as="button" className="text-xs text-red-500 hover:underline">
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-64 print:pl-0">
                <main className="pb-24 lg:pb-8">{children}</main>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-white/60 bg-white/80 backdrop-blur-xl print:hidden lg:hidden">
                {items.map((m) => (
                    <Link
                        key={m.href}
                        href={m.href}
                        className={
                            'flex min-w-[72px] flex-1 shrink-0 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ' +
                            (active(m.href) ? 'text-orange-600' : 'text-slate-400')
                        }
                    >
                        <span className="text-xl">{m.icon}</span>
                        {m.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}