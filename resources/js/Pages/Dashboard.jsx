import { Head, Link, usePage } from '@inertiajs/react';
import KasirLayout from '../Layouts/KasirLayout';
import GuestDashboard from '../Components/GuestDashboard';
import { num } from '../lib/format';
import { 
    Wallet, Receipt, FileCheckCorner, Package, 
    Hand, CheckCircle2, Trophy, TrendingUp, 
    ArrowUpRight, Sparkles, Activity, ShieldAlert
} from "lucide-react";

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function sapaan() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

// Komponen Stat Card dengan Full Color Gradient Background & Glow Effect
function StatCard({ icon: Icon, label, value, gradient, textAccent, badgeText }) {
    return (
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}>
            {/* Background Icon Watermark */}
            <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                <Icon className="h-32 w-32" strokeWidth={1} />
            </div>
            
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
                </div>
                {badgeText && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
                        {badgeText}
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <div className="text-xs font-medium text-white/80">{label}</div>
                <div className={`mt-1 text-2xl font-black tracking-tight ${textAccent || 'text-white'}`}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function Panel({ title, action, children, className = "" }) {
    return (
        <section className={`rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl ${className}`}>
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function Dashboard({ stats, chart, topProducts, lowStock, recent, stockList = [] }) {
    const { auth } = usePage().props;
    const isGuest = !auth?.user;

    if (isGuest || !stats) return <GuestDashboard stockList={stockList} />;

    const max = Math.max(...chart.map((c) => c.total), 1);
    const weekTotal = chart.reduce((s, c) => s + c.total, 0);
    const topMax = Math.max(...topProducts.map((p) => p.qty), 1);
    
    // Warna medali dengan latar belakang full color cerah
    const medalBadges = [
        'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/30',
        'bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-md shadow-slate-300/30',
        'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md shadow-amber-800/30'
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Dashboard Power POS" />

            {/* Banner Full Color Supreme dengan Sapaan Dinamis Nama User */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-20 pointer-events-none">
                    <Sparkles className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20">
                            <Activity className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                            <span>Sistem Kasir Aktif</span>
                        </div>
                        <p className="mt-3 text-xs font-medium text-indigo-200">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight md:text-3xl">
                            {sapaan()}, {auth?.user?.name ?? 'Kasir'}!
                            <Hand className="h-7 w-7 text-amber-300 animate-bounce" />
                        </h1>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 text-right">
                        <div className="text-xs text-indigo-200">Total Kas Hari Ini</div>
                        <div className="text-xl md:text-2xl font-black text-amber-300">{rp(stats.todaySales)}</div>
                    </div>
                </div>
            </div>

            {/* Statistik Kartu Full Color */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard 
                    icon={Wallet} 
                    label="Penjualan Hari Ini" 
                    value={rp(stats.todaySales)} 
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20" 
                    badgeText="Live"
                />
                <StatCard 
                    icon={Receipt} 
                    label="Total Transaksi" 
                    value={`${stats.todayCount} Nota`} 
                    gradient="bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/20" 
                    badgeText="Hari Ini"
                />
                <StatCard 
                    icon={FileCheckCorner} 
                    label="Item Terjual" 
                    value={`${num(stats.todayItems)} Pcs`} 
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20" 
                    badgeText="Produk"
                />
                <StatCard 
                    icon={Package} 
                    label="Stok Menipis" 
                    value={`${stats.lowStockCount} Item`} 
                    gradient="bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20" 
                    badgeText="Perhatian"
                />
            </div>

            {/* Grafik & Stok Menipis */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Panel
                        title="Grafik Penjualan 7 Hari Terakhir"
                        action={
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-600 border border-emerald-100">
                                <TrendingUp className="h-4 w-4" />
                                {rp(weekTotal)}
                            </div>
                        }
                    >
                        <div className="mt-6 flex h-52 items-end gap-3 pt-4">
                            {chart.map((c, i) => {
                                const isToday = i === chart.length - 1;
                                const h = (c.total / max) * 100;
                                return (
                                    <div key={c.label} className="group/bar relative flex h-full flex-1 items-end">
                                        <div className="pointer-events-none absolute -top-12 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl group-hover/bar:block animate-in fade-in zoom-in-95">
                                            {c.label}: {rp(c.total)}
                                        </div>
                                        <div
                                            className={
                                                'w-full rounded-t-2xl transition-all duration-500 ease-out ' +
                                                (isToday
                                                    ? 'bg-gradient-to-t from-violet-600 via-indigo-500 to-blue-400 shadow-lg shadow-indigo-500/30 group-hover/bar:brightness-110'
                                                    : 'bg-gradient-to-t from-slate-200 to-slate-100 group-hover/bar:from-indigo-300 group-hover/bar:to-indigo-200')
                                            }
                                            style={{ height: `${Math.max(h, c.total > 0 ? 5 : 3)}%` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
                            {chart.map((c, i) => (
                                <span
                                    key={c.label}
                                    className={
                                        'flex-1 text-center text-xs transition-colors ' +
                                        (i === chart.length - 1 ? 'font-black text-indigo-600' : 'font-semibold text-slate-400')
                                    }
                                >
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    </Panel>
                </div>

                {/* Panel Stok Menipis */}
                <Panel
                    title="Peringatan Stok Menipis"
                    action={
                        <Link href="/produk" className="group inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline">
                            Kelola <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    }
                >
                    {lowStock.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-slate-400">
                           <CheckCircle2 className="mb-2 h-12 w-12 text-emerald-500 animate-bounce" />
                           <span className="font-bold text-slate-700">Semua stok gudang aman!</span>
                        </div>
                    ) : (
                        <ul className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                            {lowStock.map((p) => (
                                <li key={p.id} className="group/item bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                    <div className="mb-1.5 flex justify-between text-xs md:text-sm">
                                        <span className="font-bold text-slate-800 truncate pr-2 flex items-center gap-1.5">
                                            <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                                            {p.name}
                                        </span>
                                        <span className={p.stock === 0 ? 'font-extrabold text-rose-600 shrink-0 uppercase text-[11px] bg-rose-100 px-2 py-0.5 rounded-full' : 'font-bold text-amber-600 shrink-0'}>
                                            {p.stock === 0 ? 'Habis Total' : `Sisa ${num(p.stock)} ${p.unit ?? ''}`}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-rose-100">
                                        <div
                                            className={'h-full rounded-full transition-all duration-500 ' + (p.stock <= 3 ? 'bg-rose-500' : 'bg-amber-500')}
                                            style={{ width: `${Math.min((p.stock / 10) * 100, 100)}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            {/* Produk Terlaris & Transaksi Terbaru */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Top Produk Terlaris (30 Hari)">
                    <ul className="space-y-4">
                        {topProducts.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400">Belum ada data penjualan produk</div>
                        ) : (
                            topProducts.map((p, i) => (
                                <li key={i} className="group/prod">
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="inline-flex items-center gap-2.5 font-medium text-slate-700">
                                            {i < 3 ? (
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-bold text-xs ${medalBadges[i]}`}>
                                                    {i + 1}
                                                </span>
                                            ) : (
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-500">{i + 1}</span>
                                            )}
                                            <span className="font-bold text-slate-800 truncate">{p.name}</span>
                                        </span>
                                        <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg text-xs">{num(p.qty)} terjual</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 p-0.5">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 group-hover/prod:brightness-110"
                                            style={{ width: `${(p.qty / topMax) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </Panel>

                <Panel
                    title="Transaksi Terbaru Kasir"
                    action={
                        <Link href="/riwayat" className="group inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                            Lihat Semua <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    }
                >
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-slate-400">
                            <Receipt className="mb-2 h-10 w-10 text-slate-300" />
                            <span>Belum ada transaksi hari ini</span>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {recent.map((s) => (
                                <li key={s.id} className="flex items-center gap-3 py-3 transition-all hover:bg-slate-50/80 rounded-2xl px-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-extrabold text-slate-800">{s.invoice}</div>
                                        <div className="text-xs font-medium text-slate-400">
                                            {new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </div>
                                    </div>
                                    <div className="font-black text-emerald-600 text-base">{rp(s.total)}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <KasirLayout>{page}</KasirLayout>;