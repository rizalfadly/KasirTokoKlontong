import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronDown, ScrollText, Search, ArrowRight } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import Pagination from '../../Components/Pagination';
import { rp } from '../../lib/format';

const CATS = [
    { key: '', label: 'Semua' },
    { key: 'product', label: 'Produk' },
    { key: 'sale', label: 'Transaksi' },
    { key: 'opname', label: 'Opname' },
    { key: 'shift', label: 'Setoran' },
    { key: 'user', label: 'Pengguna' },
    { key: 'log', label: 'Akses' },
];

const BADGE = {
    product: 'bg-sky-100 text-sky-700',
    sale: 'bg-red-100 text-red-600',
    opname: 'bg-violet-100 text-violet-700',
    shift: 'bg-emerald-100 text-emerald-700',
    user: 'bg-amber-100 text-amber-800',
    log: 'bg-slate-100 text-slate-600',
};

const FIELD_LABEL = {
    name: 'Nama',
    price: 'Harga jual',
    cost_price: 'Harga modal',
    wholesale_price: 'Harga grosir',
    wholesale_min_qty: 'Mulai grosir',
    limit_qty: 'Jatah',
    limit_orders: 'Maks. kali beli',
    role: 'Peran',
    is_active: 'Aktif',
    password: 'Sandi',
};

const MONEY = ['price', 'cost_price', 'wholesale_price'];

const fmtVal = (field, v) => {
    if (v === null || v === undefined || v === '') return '-';
    if (MONEY.includes(field)) return rp(Number(v));
    if (field === 'is_active') return Number(v) ? 'Ya' : 'Tidak';
    return String(v);
};

const fmtTime = (d) =>
    new Date(d).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

const catOf = (action) => {
    const head = String(action).split('.')[0];
    return head === 'login' || head === 'logout' ? 'log' : head;
};

export default function Log({ logs, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [openId, setOpenId] = useState(null);
    const rows = logs.data;

    function apply(next = {}) {
        router.get(
            '/log',
            { q: search || undefined, cat: filters.cat || undefined, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    // Cari otomatis 400 ms setelah berhenti mengetik
    useEffect(() => {
        if (search === (filters.q ?? '')) return;
        const t = setTimeout(() => apply({ q: search || undefined }), 400);
        return () => clearTimeout(t);
    }, [search]);

    const chip = (active) =>
        'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
        (active ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'border border-slate-200 bg-white text-slate-600 hover:bg-orange-50');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Log Aktivitas" />

            <div>
                <h1 className="text-2xl font-bold">Log Aktivitas</h1>
                <p className="text-sm text-slate-500">Catatan siapa mengubah apa. Hanya bisa ditambah, tidak bisa diubah.</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="Cari di ringkasan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {CATS.map((c) => (
                            <button key={c.key} onClick={() => apply({ cat: c.key || undefined })} className={chip((filters.cat ?? '') === c.key)}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <ScrollText className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Belum ada catatan.</p>
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-slate-100">
                            {rows.map((l) => {
                                const changes = l.changes ? Object.entries(l.changes) : [];
                                const open = openId === l.id;
                                return (
                                    <li key={l.id} className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-36 shrink-0 text-xs text-slate-400">{fmtTime(l.created_at)}</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (BADGE[catOf(l.action)] ?? BADGE.log)}>
                                                        {l.action}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {l.user?.username ?? 'Tanpa login'}
                                                        {l.ip ? ` · ${l.ip}` : ''}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-700">{l.summary}</p>

                                                {open && changes.length > 0 && (
                                                    <ul className="mt-2 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
                                                        {changes.map(([field, v]) => (
                                                            <li key={field} className="flex flex-wrap items-center gap-2">
                                                                <span className="w-32 text-slate-500">{FIELD_LABEL[field] ?? field}</span>
                                                                <span className="text-slate-400 line-through">{fmtVal(field, v.from)}</span>
                                                                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                                                <span className="font-semibold">{fmtVal(field, v.to)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {changes.length > 0 && (
                                                <button
                                                    onClick={() => setOpenId(open ? null : l.id)}
                                                    aria-label="Lihat perubahan"
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                                                >
                                                    <ChevronDown className={'h-4 w-4 transition ' + (open ? 'rotate-180' : '')} />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <Pagination paginator={logs} noun="catatan" />
                    </>
                )}
            </div>
        </div>
    );
}

Log.layout = (page) => <KasirLayout>{page}</KasirLayout>;