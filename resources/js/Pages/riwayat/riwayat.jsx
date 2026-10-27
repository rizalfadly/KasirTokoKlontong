import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Receipt, Wallet, BarChart3, Search, Printer } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import Pagination from '../../Components/Pagination';
import { num, rp } from '../../lib/format';

function Stat({ icon: Icon, label, value, bg, iconClass = 'text-slate-700' }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={'flex h-12 w-12 items-center justify-center rounded-xl ' + bg}>
                <Icon className={'h-6 w-6 ' + iconClass} />
            </div>
            <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </div>
    );
}

const fmt = (d) =>
    new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Riwayat({ sales, filters, summary }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const onlyVoid = filters.void;
    const rows = sales.data;

    //console.log(sales);

    function apply(next = {}) {
        router.get(
            '/riwayat',
            { q: search || undefined, void: onlyVoid ? 1 : undefined, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    // Cari otomatis 400 ms setelah berhenti mengetik
    useEffect(() => {
        if (search === (filters.q ?? '')) return;
        const t = setTimeout(() => apply({ q: search || undefined }), 400);
        return () => clearTimeout(t);
    }, [search]);

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Riwayat" />

            <div>
                <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
                <p className="text-sm text-slate-500">Daftar semua transaksi, 20 per halaman.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Receipt} label="Jumlah transaksi" value={num(summary.count)} bg="bg-sky-100" iconClass="text-sky-700" />
                <Stat icon={Wallet} label="Total penjualan" value={rp(summary.total)} bg="bg-emerald-100" iconClass="text-emerald-700" />
                <Stat icon={BarChart3} label="Rata-rata per transaksi" value={rp(summary.average)} bg="bg-amber-100" iconClass="text-amber-700" />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold">Daftar transaksi</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => apply({ void: undefined })}
                            className={
                                'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
                                (!onlyVoid ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                            }
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => apply({ void: 1 })}
                            className={
                                'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
                                (onlyVoid ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100')
                            }
                        >
                            Dibatalkan ({num(summary.voidCount)})
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="Cari invoice atau kasir..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <Receipt className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">
                            {search || onlyVoid ? 'Transaksi tidak ditemukan.' : 'Belum ada transaksi.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-sm text-slate-400">
                                        <th className="pb-3 font-medium">Invoice</th>
                                        <th className="pb-3 font-medium">Waktu</th>
                                        <th className="pb-3 font-medium">Kasir</th>
                                        <th className="pb-3 font-medium">Item</th>
                                        <th className="pb-3 text-right font-medium">Total</th>
                                        <th className="pb-3 text-right font-medium">Dibayar</th>
                                        <th className="pb-3 text-right font-medium">Kembalian</th>
                                        <th className="pb-3 text-center font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rows.map((s) => (
                                        <tr
                                            key={s.id}
                                            className={'transition hover:bg-amber-50/50 ' + (s.voided_at ? 'bg-red-50/40' : '')}
                                        >
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                                        <Receipt className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{s.invoice}</span>
                                                            {s.voided_at && (
                                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                                                                    Batal
                                                                </span>
                                                            )}
                                                        </div>
                                                        {s.voided_at && (
                                                            <div className="mt-0.5 text-xs text-red-500">
                                                                Alasan: {s.void_reason} · {s.voider?.username ?? '-'}, {fmt(s.voided_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-slate-500">{fmt(s.created_at)}</td>
                                            <td className="py-3">
                                                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                                    {s.user?.username ?? '-'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                    {s.items_count} jenis
                                                </span>
                                            </td>
                                            <td
                                                className={
                                                    'py-3 text-right font-semibold ' +
                                                    (s.voided_at ? 'text-slate-400 line-through' : 'text-emerald-700')
                                                }
                                            >
                                                {rp(s.total)}
                                            </td>
                                            <td className="py-3 text-right text-sm text-slate-500">{rp(s.paid)}</td>
                                            <td className="py-3 text-right text-sm text-slate-500">{rp(s.change_amount)}</td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={`/riwayat/${s.id}`}
                                                    className="mr-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                                >
                                                    Lihat
                                                </Link>
                                                <a
                                                    href={`/riwayat/${s.id}?print=1`}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-200"
                                                >
                                                    <Printer className="h-4 w-4" /> Cetak
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination paginator={sales} noun="transaksi" />
                    </>
                )}
            </div>
        </div>
    );
}

Riwayat.layout = (page) => <KasirLayout>{page}</KasirLayout>;