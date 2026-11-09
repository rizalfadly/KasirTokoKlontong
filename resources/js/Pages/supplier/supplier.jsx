import { Head } from '@inertiajs/react';
import { MapPin, Pencil, Phone, Plus, Search, ChevronRight, Package, Users, CheckCircle2, ShoppingCart, Truck, Building2 } from 'lucide-react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import PriceCompare from '../../Components/Supplier/PriceCompare';
import SupplierDetail from '../../Components/Supplier/SupplierDetail';
import SupplierForm from '../../Components/Supplier/SupplierForm';
import { TERM_LABEL, TYPE_LABEL, TYPE_STYLE } from '../../Components/Supplier/constants';

function Stat({ icon: Icon, label, value, bg, iconClass }) {
    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center gap-4">
                <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 ' + bg}>
                    <Icon className={'h-6 w-6 ' + iconClass} strokeWidth={2.2} />
                </div>
                <div>
                    <div className="text-2xl font-black tracking-tight leading-none text-slate-800">{value}</div>
                    <div className="mt-1.5 text-xs font-bold text-slate-400">{label}</div>
                </div>
            </div>
        </div>
    );
}

export default function Supplier({ suppliers, products, types, terms }) {
    const [tab, setTab] = useState('daftar');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('semua');
    const [showInactive, setShowInactive] = useState(false);
    const [form, setForm] = useState(null); // null | 'new' | objek supplier yang diedit
    const [detailId, setDetailId] = useState(null);

    const detail = suppliers.find((s) => s.id === detailId);
    const q = search.trim().toLowerCase();

    const visible = suppliers.filter((s) => showInactive || s.is_active);
    const countOf = (t) => (t === 'semua' ? visible.length : visible.filter((s) => s.type === t).length);

    const shown = visible.filter(
        (s) =>
            (typeFilter === 'semua' || s.type === typeFilter) &&
            (!q || [s.name, s.contact_person, s.phone, s.address].some((v) => (v ?? '').toLowerCase().includes(q))),
    );

    const activeCount = suppliers.filter((s) => s.is_active).length;
    const boughtCount = suppliers.filter((s) => s.purchase_stats?.count > 0).length;

    const chip = (active) =>
        'inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-300 shadow-sm ' +
        (active
            ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white shadow-indigo-500/25 scale-105'
            : 'border border-slate-200 bg-white/90 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200');

    const tabBtn = (active) =>
        'rounded-2xl px-5 py-2.5 text-xs font-black transition-all duration-300 ' +
        (active 
            ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Manajemen Supplier & Kulakan" />

            {/* Banner Full Color Supreme dengan Truk Berjalan */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                
                {/* Animasi Truk Berjalan dari Kiri ke Kanan secara Terus-menerus */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none animate-truck-drive">
                    <Truck className="h-48 w-48" strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Building2 className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
                            <span>Jaringan Mitra Bisnis</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Supplier & Kulakan 
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Kelola distributor, peternak, dan bandingkan harga kulakan terbaik untuk toko Anda.
                        </p>
                    </div>
                    <button
                        onClick={() => setForm('new')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all duration-300 hover:scale-105 hover:bg-amber-300 shrink-0"
                    >
                        <Plus className="h-4 w-4" /> Tambah Supplier
                    </button>
                </div>
            </div>

            {/* Ringkasan Statistik */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Users} label="Total Supplier" value={suppliers.length} bg="bg-sky-100/80" iconClass="text-sky-700" />
                <Stat icon={CheckCircle2} label="Supplier Aktif" value={activeCount} bg="bg-emerald-100/80" iconClass="text-emerald-700" />
                <Stat icon={ShoppingCart} label="Pernah Kulakan" value={boughtCount} bg="bg-amber-100/80" iconClass="text-amber-700" />
            </div>

            {/* Navigasi Tab */}
            <div className="inline-flex rounded-2xl bg-slate-200/60 p-1.5 backdrop-blur-md border border-white/50">
                <button onClick={() => setTab('daftar')} className={tabBtn(tab === 'daftar')}>
                    Daftar Supplier
                </button>
                <button onClick={() => setTab('harga')} className={tabBtn(tab === 'harga')}>
                    Bandingkan Harga
                </button>
            </div>

            {tab === 'harga' ? (
                <PriceCompare suppliers={suppliers} />
            ) : (
                <div className="space-y-6">
                    {/* Toolbar Pencarian & Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-80">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:font-normal placeholder:text-slate-400"
                                placeholder="Cari nama, kontak, telepon, alamat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setTypeFilter('semua')} className={chip(typeFilter === 'semua')}>
                                Semua <span className="opacity-80">({countOf('semua')})</span>
                            </button>
                            {types.map((t) => (
                                <button key={t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>
                                    {TYPE_LABEL[t]} <span className="opacity-80">({countOf(t)})</span>
                                </button>
                            ))}
                        </div>
                        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-500 bg-white/80 px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                            />
                            Tampilkan Nonaktif
                        </label>
                    </div>

                    {/* Daftar Kartu Supplier */}
                    {shown.length === 0 && suppliers.length > 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center text-slate-400 backdrop-blur-xl">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 mb-3 text-slate-300 shadow-inner">
                                <Search className="h-8 w-8" />
                            </div>
                            <span className="font-bold text-slate-700 text-base">Supplier tidak ditemukan</span>
                            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {shown.map((s) => (
                                <div
                                    key={s.id}
                                    className={
                                        'group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ' +
                                        (s.is_active ? '' : 'opacity-60 bg-slate-50')
                                    }
                                >
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={
                                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-inner ' +
                                                    TYPE_STYLE[s.type]
                                                }
                                            >
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{s.name}</div>
                                                <div className="truncate text-xs font-bold text-slate-400 mt-0.5">
                                                    {s.contact_person || TYPE_LABEL[s.type]}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setForm(s)}
                                                aria-label="Edit supplier"
                                                className="rounded-xl p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4 space-y-2 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                                            {s.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 shrink-0 text-slate-400" /> 
                                                    <span className="font-bold">{s.phone}</span>
                                                </div>
                                            )}
                                            {s.address && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                    <span className="line-clamp-2">{s.address}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                                            <span className={'rounded-full px-3 py-1 text-[11px] font-black ' + TYPE_STYLE[s.type]}>
                                                {TYPE_LABEL[s.type]}
                                            </span>
                                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black text-amber-800">
                                                {TERM_LABEL[s.payment_terms]}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                                                <Package className="h-3 w-3" /> {s.prices.length} Produk
                                            </span>
                                            {s.purchase_stats && (
                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-700">
                                                    Kulakan {s.purchase_stats.count}x
                                                </span>
                                            )}
                                            {!s.is_active && (
                                                <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-black text-slate-500">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setDetailId(s.id)}
                                        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-50 py-3 text-xs font-black text-indigo-600 transition-all hover:bg-indigo-100 hover:scale-[1.01]"
                                    >
                                        <span>Detail & Daftar Harga</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Kartu Tombol Tambah Cepat */}
                            <button
                                onClick={() => setForm('new')}
                                className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white/40 p-6 text-slate-400 backdrop-blur-xl transition-all duration-300 hover:border-indigo-300 hover:bg-white/80 hover:text-indigo-600 hover:scale-[1.01]"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-inner">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="font-black text-sm text-slate-600 group-hover:text-indigo-600">Tambah Supplier Baru</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {form && (
                <SupplierForm
                    key={form === 'new' ? 'new' : form.id}
                    supplier={form === 'new' ? null : form}
                    types={types}
                    terms={terms}
                    onClose={() => setForm(null)}
                />
            )}

            {detail && (
                <SupplierDetail
                    key={detail.id}
                    supplier={detail}
                    products={products}
                    onClose={() => setDetailId(null)}
                    onEdit={() => {
                        setForm(detail);
                        setDetailId(null);
                    }}
                />
            )}
        </div>
    );
}

Supplier.layout = (page) => <KasirLayout>{page}</KasirLayout>;