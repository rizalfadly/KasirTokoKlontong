import { Head, Link, usePage } from '@inertiajs/react';
import KasirLayout from '../Layouts/KasirLayout';
import GuestDashboard from '../Components/GuestDashboard';
import { num } from '../lib/format';
import { Wallet, Receipt, FileCheckCorner, Package,
        Egg, Hand, MailCheck, CheckCircle2, ShoppingBag, Medal,
 } from "lucide-react";

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const card = 'rounded-2xl border border-white/70 bg-white/75 shadow-sm backdrop-blur-md';

function sapaan() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

function Stat({ icon: Icon, label, value, bg, iconClass = "text-slate-700", valueClass = "text-slate-900" }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
            <Icon className={`h-5 w-5 ${iconClass}`} strokeWidth={2} />
        </div>
        <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
        </div>
        </div>
    );
}

function Panel({ title, action, children }) {
    return (
        <section className={card + ' p-5'}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function Dashboard({ stats, chart, topProducts, lowStock, recent, pendingOpnames = 0, stockList = [] }) {
    const { auth } = usePage().props;
    const isGuest = !auth?.user;

    // Tamu (belum login) melihat tampilan ketersediaan stok
    if (isGuest || !stats) return <GuestDashboard stockList={stockList} />;

    const nama = auth.user.name?.split(' ')[0] ?? 'Kasir';
    const max = Math.max(...chart.map((c) => c.total), 1);
    const weekTotal = chart.reduce((s, c) => s + c.total, 0);
    const topMax = Math.max(...topProducts.map((p) => p.qty), 1);
    const medalColors = ['text-amber-500', 'text-slate-400', 'text-orange-700'];

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Dashboard" />

            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-200 md:p-8">
                <div className="pointer-events-none absolute -right-6 -top-8 select-none opacity-20">
                    <Egg className="h-40 w-40" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-orange-50">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold md:text-3xl">
                    {sapaan()}!
                    <Hand className="h-7 w-7" />
                </h1>
                <p className="mt-1 text-orange-50">
                    Penjualan hari ini <b className="text-white">{rp(stats.todaySales)}</b> dari {stats.todayCount} transaksi.
                </p>
                {/* <Link
                    href="/kasir"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-orange-600 shadow-md transition hover:scale-105 hover:shadow-xl"
                >
                    🛒 Mulai Transaksi
                </Link> */}
            </div>

                {pendingOpnames > 0 && (
                    <Link
                        href="/opname"
                        className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sky-700 transition hover:bg-sky-100"
                    >
                        <MailCheck className="h-5 w-5 shrink-0" />
                        <span>
                            <b>{pendingOpnames}</b> opname menunggu persetujuanmu. Klik untuk meninjau →
                        </span>
                    </Link>
                )}

            {/* Statistik */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat icon={Wallet} label="Penjualan hari ini" value={rp(stats.todaySales)} bg="bg-emerald-100" iconClass="text-emerald-700" valueClass="text-emerald-700" />
                <Stat icon={Receipt} label="Transaksi hari ini" value={stats.todayCount} bg="bg-sky-100" iconClass="text-sky-700" />
                <Stat icon={FileCheckCorner} label="Item terjual hari ini" value={num(stats.todayItems)} bg="bg-amber-100" iconClass="text-amber-700" />
                <Stat
                    icon={Package}
                    label="Stok menipis"
                    value={stats.lowStockCount}
                    bg="bg-red-100"
                    iconClass="text-red-600"
                    valueClass={stats.lowStockCount > 0 ? 'text-red-600' : undefined}
                />
            </div>

            {/* Grafik + stok menipis */}
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Panel
                        title="Penjualan 7 hari terakhir"
                        action={<span className="text-sm font-semibold text-emerald-700">{rp(weekTotal)}</span>}
                    >
                        <div className="mt-6 flex h-48 items-end gap-3">
                            {chart.map((c, i) => {
                                const isToday = i === chart.length - 1;
                                const h = (c.total / max) * 100;
                                return (
                                    <div key={c.label} className="group relative flex h-full flex-1 items-end">
                                        <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-white group-hover:block">
                                            {rp(c.total)}
                                        </div>
                                        <div
                                            className={
                                                'w-full rounded-t-xl transition-all ' +
                                                (isToday
                                                    ? 'bg-gradient-to-t from-orange-500 to-amber-300'
                                                    : 'bg-gradient-to-t from-amber-200 to-amber-100 group-hover:from-amber-400 group-hover:to-amber-200')
                                            }
                                            style={{ height: `${Math.max(h, c.total > 0 ? 4 : 2)}%` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 flex gap-3">
                            {chart.map((c, i) => (
                                <span
                                    key={c.label}
                                    className={
                                        'flex-1 text-center text-xs ' +
                                        (i === chart.length - 1 ? 'font-bold text-orange-600' : 'text-slate-400')
                                    }
                                >
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    </Panel>
                </div>

                <Panel
                    title="Stok menipis"
                    action={
                        <Link href="/produk" className="text-sm text-orange-600 hover:underline">
                            Kelola →
                        </Link>
                    }
                >
                    {lowStock.length === 0 && (
                        <div className="py-6 text-center text-sm text-slate-400">
                           <CheckCircle2 className="mx-auto mb-1 h-8 w-8 text-emerald-500" />
                            Semua stok aman
                        </div>
                    )}
                    <ul className="space-y-4">
                        {lowStock.map((p) => (
                            <li key={p.id}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium">{p.name}</span>
                                    <span className={p.stock === 0 ? 'font-bold text-red-600' : 'font-semibold text-orange-600'}>
                                        {p.stock === 0 ? 'Habis' : `Sisa ${num(p.stock)} ${p.unit ?? ''}`}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={'h-full rounded-full ' + (p.stock <= 3 ? 'bg-red-400' : 'bg-orange-400')}
                                        style={{ width: `${Math.min((p.stock / 10) * 100, 100)}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            {/* Terlaris + transaksi terbaru */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Produk terlaris (30 hari)">
                    {topProducts.length === 0 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Receipt className="h-5 w-5" />
                        </div>
                    )}
                    <ul className="space-y-4">
                        {topProducts.map((p, i) => (
                            <li key={i}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                        {i < 3 ? (
                                            <Medal className={`h-4 w-4 ${medalColors[i]}`} />
                                        ) : (
                                            <span className="w-4 text-center text-slate-400">{i + 1}.</span>
                                        )}
                                        {p.name}
                                    </span>
                                    <span className="font-semibold text-slate-600">{num(p.qty)} terjual</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
                                        style={{ width: `${(p.qty / topMax) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel
                    title="Transaksi terbaru"
                    action={
                        <Link href="/riwayat" className="text-sm text-orange-600 hover:underline">
                            Lihat semua →
                        </Link>
                    }
                >
                    {recent.length === 0 && (
                        <div className="py-6 text-center text-sm text-slate-400">
                            <Receipt className="mx-auto mb-1 h-8 w-8" />
                            Belum ada transaksi
                        </div>
                    )}
                    <ul className="divide-y divide-slate-100">
                        {recent.map((s) => (
                            <li key={s.id} className="flex items-center gap-3 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
                                    🧾
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium">{s.invoice}</div>
                                    <div className="text-xs text-slate-400">
                                        {new Date(s.created_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                                <div className="font-semibold text-emerald-700">{rp(s.total)}</div>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <KasirLayout>{page}</KasirLayout>;