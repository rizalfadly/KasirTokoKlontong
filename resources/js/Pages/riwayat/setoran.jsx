import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Sparkles, ShieldAlert, ArrowRight, Wallet } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import Pagination from '../../Components/Pagination';
import { num, rp } from '../../lib/format';

const STATUS = {
    submitted: ['Menunggu Persetujuan', 'bg-sky-100 text-sky-800 border border-sky-200'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-800 border border-emerald-200'],
    rejected: ['Dikembalikan', 'bg-amber-100 text-amber-800 border border-amber-200'],
};

const fmt = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Setoran({ closings, pending }) {
    const rows = closings.data;

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Setoran Shift & Grosir" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Wallet className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Pusat Keuangan & Kasir</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Setoran Shift
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Rekapitulasi penjualan shift dan grosir yang dikirimkan untuk diverifikasi oleh owner.
                        </p>
                    </div>

                    <Link
                        href="/riwayat/rekap"
                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300"
                    >
                        <ClipboardList className="h-4 w-4" /> Buat Rekap Baru
                    </Link>
                </div>
            </div>

            {/* Alert Pending */}
            {pending > 0 && (
                <div className="flex items-center gap-3 rounded-3xl bg-sky-50 border border-sky-200 p-4 text-sm font-bold text-sky-800 shadow-sm">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-sky-600" />
                    <span>Ada <b>{pending} setoran</b> yang sedang menunggu verifikasi dan persetujuan dari kamu.</span>
                </div>
            )}

            {/* Tabel Riwayat Setoran */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black text-slate-800">Riwayat Pengiriman Setoran</h2>
                    <span className="text-xs font-bold text-slate-400">Total: {rows.length} catatan</span>
                </div>

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <span className="font-bold text-slate-700 text-base">Belum ada setoran tercatat</span>
                        <p className="text-xs text-slate-400 mt-1">Buat rekap setoran baru melalui tombol di atas.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[750px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <th className="pb-3 px-3">Kasir / Admin</th>
                                        <th className="pb-3 px-3">Periode Waktu</th>
                                        <th className="pb-3 px-3 text-right">Total Omset</th>
                                        <th className="pb-3 px-3 text-right">Selisih Laci</th>
                                        <th className="pb-3 px-3">Status Verifikasi</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {rows.map((c) => {
                                        const [label, style] = STATUS[c.status] ?? [c.status, 'bg-slate-100 text-slate-600 border border-slate-200'];
                                        return (
                                            <tr key={c.id} className="transition-colors hover:bg-indigo-50/50 group">
                                                <td className="py-4 px-3">
                                                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                                                        {c.user?.username ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-xs font-bold text-slate-500">
                                                    <div>{fmt(c.period_start)} s.d. {fmt(c.period_end)}</div>
                                                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{num(c.sales_count)} transaksi sukses</div>
                                                </td>
                                                <td className="py-4 px-3 text-right font-black text-emerald-600">{rp(c.total)}</td>
                                                <td
                                                    className={
                                                        'py-4 px-3 text-right font-extrabold ' +
                                                        (c.difference === 0 ? 'text-emerald-600' : c.difference < 0 ? 'text-rose-600' : 'text-amber-600')
                                                    }
                                                >
                                                    {c.difference === 0 ? 'Laci Cocok' : (c.difference > 0 ? '+' : '-') + rp(Math.abs(c.difference))}
                                                </td>
                                                <td className="py-4 px-3">
                                                    <span className={'rounded-full px-3 py-1 text-xs font-black ' + style}>{label}</span>
                                                </td>
                                                <td className="py-4 px-3 text-right">
                                                    <Link
                                                        href={`/setoran/${c.id}`}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Buka <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                            <Pagination paginator={closings} noun="setoran" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

Setoran.layout = (page) => <KasirLayout>{page}</KasirLayout>;