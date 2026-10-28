import { Head, Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import Pagination from '../../Components/Pagination';
import { num, rp } from '../../lib/format';

const STATUS = {
    submitted: ['Menunggu', 'bg-sky-100 text-sky-700'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-700'],
    rejected: ['Dikembalikan', 'bg-orange-100 text-orange-700'],
};

const fmt = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Setoran({ closings, pending }) {
    const rows = closings.data;

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Setoran Shift" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Setoran Shift</h1>
                    <p className="text-sm text-slate-500">Rekap shift yang dikirim kasir untuk disetujui owner.</p>
                </div>
                <Link
                    href="/riwayat/rekap"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                >
                    <ClipboardList className="h-4 w-4" /> Rekap baru
                </Link>
            </div>

            {pending > 0 && (
                <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {pending} setoran menunggu persetujuanmu.
                </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                {rows.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <ClipboardList className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Belum ada setoran.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-sm text-slate-400">
                                        <th className="pb-3 font-medium">Kasir</th>
                                        <th className="pb-3 font-medium">Periode</th>
                                        <th className="pb-3 text-right font-medium">Total</th>
                                        <th className="pb-3 text-right font-medium">Selisih laci</th>
                                        <th className="pb-3 font-medium pl-6">Status</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rows.map((c) => {
                                        const [label, style] = STATUS[c.status] ?? [c.status, 'bg-slate-100 text-slate-600'];
                                        return (
                                            <tr key={c.id} className="transition hover:bg-amber-50/50">
                                                <td className="py-3">
                                                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                                        {c.user?.username ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-sm text-slate-500">
                                                    {fmt(c.period_start)} - {fmt(c.period_end)}
                                                    <div className="text-xs text-slate-400">{num(c.sales_count)} transaksi</div>
                                                </td>
                                                <td className="py-3 text-right font-semibold text-emerald-700">{rp(c.total)}</td>
                                                <td
                                                    className={
                                                        'py-3 text-right text-sm font-semibold ' +
                                                        (c.difference === 0 ? 'text-emerald-600' : c.difference < 0 ? 'text-red-600' : 'text-amber-600')
                                                    }
                                                >
                                                    {c.difference === 0 ? 'Cocok' : (c.difference > 0 ? '+' : '-') + rp(Math.abs(c.difference))}
                                                </td>
                                                <td className="py-3 pl-6">
                                                    <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + style}>{label}</span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link href={`/setoran/${c.id}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                        Buka
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination paginator={closings} noun="setoran" />
                    </>
                )}
            </div>
        </div>
    );
}

Setoran.layout = (page) => <KasirLayout>{page}</KasirLayout>;