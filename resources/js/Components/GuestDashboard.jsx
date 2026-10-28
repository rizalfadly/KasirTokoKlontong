import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Egg, Package, CheckCircle2, AlertTriangle, Ban, Search, MapPin, MessageCircle, X } from 'lucide-react';
import { num } from '../lib/format';
import ProductThumb from './ProductThumb';

const PAGE = 24;

const STATUS = {
    tersedia: { label: 'Tersedia', badge: 'bg-emerald-100 text-emerald-700', card: 'border-white/70' },
    menipis: { label: 'Menipis', badge: 'bg-orange-100 text-orange-700', card: 'border-orange-200 bg-orange-50/40' },
    habis: { label: 'Habis', badge: 'bg-red-100 text-red-700', card: 'border-red-100 opacity-70' },
};

const statusOf = (stock) => (stock === 0 ? 'habis' : stock <= 10 ? 'menipis' : 'tersedia');

function sapaan() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

// 08123456789 -> 628123456789
const waLink = (phone) => {
    const d = String(phone ?? '').replace(/\D/g, '');
    if (!d) return null;
    return 'https://wa.me/' + (d.startsWith('0') ? '62' + d.slice(1) : d);
};

function StatCard({ icon: Icon, label, value, bg, iconClass, ring, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={
                'flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md ' +
                (active ? `bg-white ring-2 ${ring} border-transparent` : 'border-white/70 bg-white/75')
            }
        >
            <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' + bg}>
                <Icon className={'h-5 w-5 ' + iconClass} />
            </div>
            <div>
                <div className="text-2xl font-bold leading-none">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
            </div>
        </button>
    );
}

export default function GuestDashboard({ stockList }) {
    const { store } = usePage().props;
    const wa = waLink(store?.phone);

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('semua');
    const [limit, setLimit] = useState(PAGE);

    const counts = { tersedia: 0, menipis: 0, habis: 0 };
    stockList.forEach((p) => counts[statusOf(p.stock)]++);

    const q = search.trim().toLowerCase();
    const matched = stockList.filter(
        (p) => (filter === 'semua' || statusOf(p.stock) === filter) && p.name.toLowerCase().includes(q),
    );
    const shown = matched.slice(0, limit);

    function pick(key) {
        // klik kartu yang sedang aktif = kembali ke semua
        setFilter((cur) => (cur === key ? 'semua' : key));
        setLimit(PAGE);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Ketersediaan Stok" />

            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-200 md:p-8">
                <div className="pointer-events-none absolute -right-6 -top-8 select-none opacity-20">
                    <Egg className="h-44 w-44" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-orange-50">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl">{sapaan()}!</h1>
                <p className="mt-1 text-orange-50">
                    Stok diperbarui langsung dari toko. <b className="text-white">{counts.tersedia + counts.menipis}</b> dari{' '}
                    {stockList.length} produk siap dibeli hari ini.
                </p>

                {(store?.address || wa) && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {wa && (
                            <a
                                href={wa}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-md transition hover:scale-105"
                            >
                                <MessageCircle className="h-4 w-4" /> Tanya via WhatsApp
                            </a>
                        )}
                        {store?.address && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-orange-50">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{store.address}</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Ringkasan = filter */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    icon={Package}
                    label="Semua produk"
                    value={stockList.length}
                    bg="bg-sky-100"
                    iconClass="text-sky-700"
                    ring="ring-sky-400"
                    active={filter === 'semua'}
                    onClick={() => { setFilter('semua'); setLimit(PAGE); }}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Tersedia"
                    value={counts.tersedia}
                    bg="bg-emerald-100"
                    iconClass="text-emerald-700"
                    ring="ring-emerald-400"
                    active={filter === 'tersedia'}
                    onClick={() => pick('tersedia')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Menipis"
                    value={counts.menipis}
                    bg="bg-orange-100"
                    iconClass="text-orange-700"
                    ring="ring-orange-400"
                    active={filter === 'menipis'}
                    onClick={() => pick('menipis')}
                />
                <StatCard
                    icon={Ban}
                    label="Habis"
                    value={counts.habis}
                    bg="bg-red-100"
                    iconClass="text-red-600"
                    ring="ring-red-400"
                    active={filter === 'habis'}
                    onClick={() => pick('habis')}
                />
            </div>

            {/* Cari */}
            <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="Cari produk, mis. beras atau telur..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setLimit(PAGE); }}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        aria-label="Hapus pencarian"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Kartu produk */}
            {matched.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-14 text-center text-slate-400">
                    <Package className="mx-auto h-10 w-10" />
                    <p className="mt-2 text-sm">
                        {stockList.length === 0 ? 'Belum ada produk.' : 'Produk tidak ditemukan.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {shown.map((p) => {
                            const key = statusOf(p.stock);
                            const st = STATUS[key];
                            return (
                                <div
                                    key={p.id}
                                    className={
                                        'rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ' +
                                        st.card
                                    }
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <ProductThumb product={p} size="h-12 w-12" text="text-xl" />
                                        <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + st.badge}>
                                            {st.label}
                                        </span>
                                    </div>
                                    <div className="mt-3 line-clamp-2 min-h-[2.5rem] font-semibold leading-snug">{p.name}</div>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className={'text-2xl font-bold ' + (key === 'habis' ? 'text-slate-400' : '')}>
                                            {num(p.stock)}
                                        </span>
                                        <span className="text-sm text-slate-500">{p.unit}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-slate-400">
                            Menampilkan {shown.length} dari {matched.length} produk
                        </p>
                        {matched.length > shown.length && (
                            <button
                                onClick={() => setLimit((l) => l + PAGE)}
                                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-orange-50 hover:text-orange-600"
                            >
                                Tampilkan lebih banyak
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}