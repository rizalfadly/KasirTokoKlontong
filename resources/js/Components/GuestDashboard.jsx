import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { num } from '../lib/format';
import ProductThumb from './ProductThumb';
import { Hand, Egg, Package, CheckCircle2, AlertTriangle, Ban, Search } from 'lucide-react';

const STATUS = {
    tersedia: { label: 'Tersedia', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400' },
    menipis: { label: 'Menipis', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
    habis: { label: 'Habis', badge: 'bg-red-100 text-red-700', bar: 'bg-red-400' },
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'tersedia', label: 'Tersedia' },
    { key: 'menipis', label: 'Menipis' },
    { key: 'habis', label: 'Habis' },
];

const statusOf = (stock) => (stock === 0 ? 'habis' : stock <= 10 ? 'menipis' : 'tersedia');

function sapaan() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

function Chip({ icon: Icon, label, value, bg, iconClass = 'text-slate-700' }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
            <div className={'flex h-11 w-11 items-center justify-center rounded-xl ' + bg}>
                <Icon className={'h-5 w-5 ' + iconClass} />
            </div>
            <div>
                <div className="text-2xl font-bold leading-none">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
            </div>
        </div>
    );
}

export default function GuestDashboard({ stockList }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('semua');

    const counts = { tersedia: 0, menipis: 0, habis: 0 };
    stockList.forEach((p) => counts[statusOf(p.stock)]++);

    const shown = stockList.filter(
        (p) =>
            (filter === 'semua' || statusOf(p.stock) === filter) &&
            p.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Ketersediaan Stok" />

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
                <p className="mt-1 text-orange-50">Cek ketersediaan stok produk kami hari ini.</p>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Chip icon={Package} label="Total produk" value={stockList.length} bg="bg-sky-100" iconClass="text-sky-700" />
                <Chip icon={CheckCircle2} label="Tersedia" value={counts.tersedia} bg="bg-emerald-100" iconClass="text-emerald-700" />
                <Chip icon={AlertTriangle} label="Menipis" value={counts.menipis} bg="bg-orange-100" iconClass="text-orange-700" />
                <Chip icon={Ban} label="Habis" value={counts.habis} bg="bg-red-100" iconClass="text-red-600" />
            </div>

            {/* Cari + filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={
                                'rounded-full px-4 py-2 text-sm font-medium transition ' +
                                (filter === f.key
                                    ? 'bg-slate-900 text-white shadow'
                                    : 'bg-white/80 text-slate-600 hover:bg-white')
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kartu produk */}
            {shown.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-14 text-center text-slate-400">
                    <Package className="mx-auto h-10 w-10" />
                    <p className="mt-2 text-sm">
                        {stockList.length === 0 ? 'Belum ada produk.' : 'Produk tidak ditemukan.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {shown.map((p) => {
                        const st = STATUS[statusOf(p.stock)];
                        return (
                            <div
                                key={p.id}
                                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <ProductThumb product={p} size="h-11 w-11" text="text-xl" />
                                    <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + st.badge}>
                                        {st.label}
                                    </span>
                                </div>
                                <div className="mt-3 line-clamp-2 font-semibold leading-snug">{p.name}</div>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{num(p.stock)}</span>
                                    <span className="text-sm text-slate-500">{p.unit}</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={'h-full rounded-full ' + st.bar}
                                        style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}