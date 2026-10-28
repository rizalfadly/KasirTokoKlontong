import { Head } from '@inertiajs/react';
import { MapPin, Pencil, Phone, Plus, Search, ChevronRight, Package, Users, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import PriceCompare from '../../Components/Supplier/PriceCompare';
import SupplierDetail from '../../Components/Supplier/SupplierDetail';
import SupplierForm from '../../Components/Supplier/SupplierForm';
import { TERM_LABEL, TYPE_LABEL, TYPE_STYLE } from '../../Components/Supplier/constants';

function Stat({ icon: Icon, label, value, bg, iconClass }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-md">
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
        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ' +
        (active
            ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600');

    const tabBtn = (active) =>
        'rounded-lg px-4 py-2 text-sm font-medium transition ' +
        (active ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Supplier" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Supplier</h1>
                    <p className="text-sm text-slate-500">Supplier, distributor, dan peternak tempat kamu kulakan.</p>
                </div>
                <button
                    onClick={() => setForm('new')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                >
                    <Plus className="h-4 w-4" /> Tambah supplier
                </button>
            </div>

            {/* Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Users} label="Total supplier" value={suppliers.length} bg="bg-sky-100" iconClass="text-sky-700" />
                <Stat icon={CheckCircle2} label="Supplier aktif" value={activeCount} bg="bg-emerald-100" iconClass="text-emerald-700" />
                <Stat icon={ShoppingCart} label="Pernah kulakan" value={boughtCount} bg="bg-amber-100" iconClass="text-amber-700" />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button onClick={() => setTab('daftar')} className={tabBtn(tab === 'daftar')}>
                    Daftar supplier
                </button>
                <button onClick={() => setTab('harga')} className={tabBtn(tab === 'harga')}>
                    Bandingkan harga
                </button>
            </div>

            {tab === 'harga' ? (
                <PriceCompare suppliers={suppliers} />
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                placeholder="Cari nama, kontak, telepon, alamat"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setTypeFilter('semua')} className={chip(typeFilter === 'semua')}>
                                Semua <span className="opacity-70">{countOf('semua')}</span>
                            </button>
                            {types.map((t) => (
                                <button key={t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>
                                    {TYPE_LABEL[t]} <span className="opacity-70">{countOf(t)}</span>
                                </button>
                            ))}
                        </div>
                        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                            />
                            Tampilkan nonaktif
                        </label>
                    </div>

                    {/* Daftar */}
                    {shown.length === 0 && suppliers.length > 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-14 text-center text-slate-400">
                            <Search className="mx-auto h-10 w-10" />
                            <p className="mt-2 text-sm">Supplier tidak ditemukan.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {shown.map((s) => (
                                <div
                                    key={s.id}
                                    className={
                                        'group flex flex-col rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md ' +
                                        (s.is_active ? '' : 'opacity-60')
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={
                                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ' +
                                                TYPE_STYLE[s.type]
                                            }
                                        >
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-semibold">{s.name}</div>
                                            <div className="truncate text-sm text-slate-500">
                                                {s.contact_person || TYPE_LABEL[s.type]}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setForm(s)}
                                            aria-label="Edit supplier"
                                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
                                        {s.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 shrink-0 text-slate-400" /> {s.phone}
                                            </div>
                                        )}
                                        {s.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                <span className="line-clamp-2">{s.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + TYPE_STYLE[s.type]}>
                                            {TYPE_LABEL[s.type]}
                                        </span>
                                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                            {TERM_LABEL[s.payment_terms]}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            <Package className="h-3 w-3" /> {s.prices.length} produk
                                        </span>
                                        {s.purchase_stats && (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                Kulakan {s.purchase_stats.count}x
                                            </span>
                                        )}
                                        {!s.is_active && (
                                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setDetailId(s.id)}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                                    >
                                        Detail & harga <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Kartu tambah */}
                            <button
                                onClick={() => setForm('new')}
                                className="flex min-h-[200px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-orange-300 hover:text-orange-500"
                            >
                                <Plus className="h-5 w-5" /> Tambah supplier
                            </button>
                        </div>
                    )}
                </>
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