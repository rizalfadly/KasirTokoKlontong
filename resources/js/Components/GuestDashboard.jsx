import { usePage, Head } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingCart, Package, CheckCircle2, AlertTriangle, Ban, Search, MapPin, MessageCircle, X, Sparkles } from 'lucide-react';
import { num } from '../lib/format';
import ProductThumb from './ProductThumb';

const PAGE = 24;

const STATUS = {
    tersedia: { label: 'Tersedia', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', card: 'border-slate-100/80' },
    menipis: { label: 'Stok Menipis', badge: 'bg-amber-100 text-amber-800 border border-amber-200', card: 'border-amber-200 bg-amber-50/40' },
    habis: { label: 'Habis Total', badge: 'bg-rose-100 text-rose-800 border border-rose-200', card: 'border-rose-100 opacity-60 bg-slate-50' },
};

const statusOf = (stock) => (stock === 0 ? 'habis' : stock <= 10 ? 'menipis' : 'tersedia');

function sapaan() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

const waLink = (phone) => {
    const d = String(phone ?? '').replace(/\D/g, '');
    if (!d) return null;
    return 'https://wa.me/' + (d.startsWith('0') ? '62' + d.slice(1) : d);
};

function StatCard({ icon: Icon, label, value, bg, iconClass, ring, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                'group flex items-center gap-4 rounded-3xl border p-5 text-left shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ' +
                (active ? `bg-white ring-4 ${ring} border-transparent shadow-indigo-500/10` : 'border-white/80 bg-white/90 hover:border-indigo-200')
            }
        >
            <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ' + bg}>
                <Icon className={'h-6 w-6 ' + iconClass} strokeWidth={2.2} />
            </div>
            <div>
                <div className="text-2xl font-black tracking-tight leading-none text-slate-800">{value}</div>
                <div className="mt-1.5 text-xs font-bold text-slate-400">{label}</div>
            </div>
        </button>
    );
}

export default function GuestDashboard({ stockList }) {
    const { store, auth } = usePage().props;
    const user = auth?.user;
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
        setFilter((cur) => (cur === key ? 'semua' : key));
        setLimit(PAGE);
    }

    // Menentukan sapaan dinamis berdasarkan status login user
    const greetingText = user 
        ? `${sapaan()}, ${user.name ?? 'Kasir'}` 
        : sapaan();

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Ketersediaan Stok Toko" />

            {/* Banner Full Color Supreme dengan Animasi Troli */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                
                {/* Ikon Troli Belanja menggantikan siluet telur */}
                <div className="absolute right-4 -bottom-6 z-0 opacity-25 pointer-events-none transform -rotate-12">
                    <ShoppingCart className="h-56 w-56 animate-bounce duration-1000 text-white" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
                        <span>Informasi Stok Real-Time</span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-indigo-200">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                        {greetingText}!
                    </h1>
                    <p className="mt-2 text-xs md:text-sm text-indigo-100/90 font-medium leading-relaxed max-w-2xl">
                        Stok diperbarui langsung dari sistem kasir toko. <b className="font-bold text-white underline decoration-white/40 underline-offset-4">{counts.tersedia + counts.menipis}</b> dari{' '}
                        {stockList.length} produk siap dibeli hari ini.
                    </p>

                    {(store?.address || wa) && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 pt-2">
                            {wa && (
                                <a
                                    href={wa}
                                    target="_blank"
                                    rel="noopener"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all duration-300 hover:scale-105 hover:bg-amber-300"
                                >
                                    <MessageCircle className="h-4 w-4" /> Tanya Stok via WhatsApp
                                </a>
                            )}
                            {store?.address && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-100 bg-white/10 px-3.5 py-2.5 rounded-2xl backdrop-blur-md border border-white/15">
                                    <MapPin className="h-4 w-4 shrink-0 text-amber-300" />
                                    <span className="line-clamp-1">{store.address}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Ringkasan Filter Kartu */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    icon={Package}
                    label="Semua Produk"
                    value={stockList.length}
                    bg="bg-sky-100/80"
                    iconClass="text-sky-700"
                    ring="ring-sky-400"
                    active={filter === 'semua'}
                    onClick={() => { setFilter('semua'); setLimit(PAGE); }}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Tersedia"
                    value={counts.tersedia}
                    bg="bg-emerald-100/80"
                    iconClass="text-emerald-700"
                    ring="ring-emerald-400"
                    active={filter === 'tersedia'}
                    onClick={() => pick('tersedia')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Stok Menipis"
                    value={counts.menipis}
                    bg="bg-amber-100/80"
                    iconClass="text-amber-700"
                    ring="ring-amber-400"
                    active={filter === 'menipis'}
                    onClick={() => pick('menipis')}
                />
                <StatCard
                    icon={Ban}
                    label="Stok Habis"
                    value={counts.habis}
                    bg="bg-rose-100/80"
                    iconClass="text-rose-600"
                    ring="ring-rose-400"
                    active={filter === 'habis'}
                    onClick={() => pick('habis')}
                />
            </div>

            {/* Kolom Pencarian */}
            <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 pl-12 pr-10 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Cari produk (mis. telur, beras, minyak)..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setLimit(PAGE); }}
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Hapus pencarian"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Grid Kartu Produk Tamu */}
            {matched.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-slate-400 backdrop-blur-xl">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 mb-3 text-slate-300 shadow-inner">
                        <Package className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-slate-700 text-base">Produk tidak ditemukan</span>
                    <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {shown.map((p) => {
                            const key = statusOf(p.stock);
                            const st = STATUS[key];
                            return (
                                <div
                                    key={p.id}
                                    className={
                                        'group flex flex-col justify-between rounded-3xl border bg-white/90 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 ' +
                                        st.card
                                    }
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="overflow-hidden rounded-2xl bg-slate-50 p-2">
                                                <ProductThumb product={p} size="h-12 w-12" text="text-xl" />
                                            </div>
                                            <span className={'rounded-full px-3 py-1 text-[11px] font-black tracking-wide ' + st.badge}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <div className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                                            {p.name}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                                        <div>
                                            <span className={'text-xl font-black ' + (key === 'habis' ? 'text-slate-400' : 'text-slate-800')}>
                                                {num(p.stock)}
                                            </span>
                                            <span className="ml-1 text-xs font-bold text-slate-400 uppercase">{p.unit}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">Stok Toko</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-4">
                        <p className="text-xs font-bold text-slate-400">
                            Menampilkan <span className="text-slate-700">{shown.length}</span> dari <span className="text-slate-700">{matched.length}</span> produk
                        </p>
                        {matched.length > shown.length && (
                            <button
                                type="button"
                                onClick={() => setLimit((l) => l + PAGE)}
                                className="rounded-2xl border border-slate-200 bg-white px-8 py-3 text-sm font-extrabold text-slate-700 shadow-md transition-all hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 hover:scale-105"
                            >
                                Tampilkan Lebih Banyak Produk
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}