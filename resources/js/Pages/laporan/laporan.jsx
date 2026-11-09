import { Head, Link, router } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import {
    Wallet, Receipt, Egg, BarChart3, Printer, Download,
    AlertTriangle, Inbox, ChevronLeft, ChevronRight, TrendingUp, Sparkles, Users, Award, FileText
} from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const TABS = [
    { key: 'harian', label: 'Harian' },
    { key: 'bulanan', label: 'Bulanan' },
    { key: 'tahunan', label: 'Tahunan' },
];

const PREV_LABEL = { harian: 'kemarin', bulanan: 'bulan lalu', tahunan: 'tahun lalu' };
const CHART_TITLE = { harian: 'Grafik Penjualan per Jam', bulanan: 'Grafik Penjualan per Hari', tahunan: 'Grafik Penjualan per Bulan' };

function convert(to, v) {
    const [y, m = '01', d = '01'] = v.split('-');
    if (to === 'tahunan') return y;
    if (to === 'bulanan') return `${y}-${m}`;
    return `${y}-${m}-${d}`;
}

function shift(type, v, dir) {
    if (type === 'tahunan') return String(Number(v) + dir);
    if (type === 'bulanan') {
        const [y, m] = v.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 7);
    }
    const [y, m, d] = v.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + dir)).toISOString().slice(0, 10);
}

function StatCard({ icon: Icon, label, value, bg, iconClass, ring, sub, subClass = 'text-slate-400' }) {
    return (
        <div className="group flex items-center gap-4 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200">
            <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ' + bg}>
                <Icon className={'h-6 w-6 ' + iconClass} strokeWidth={2.2} />
            </div>
            <div>
                <div className="text-xs font-bold text-slate-400">{label}</div>
                <div className="mt-1 text-2xl font-black tracking-tight text-slate-800">{value}</div>
                {sub && <div className={'mt-1 text-xs font-extrabold ' + subClass}>{sub}</div>}
            </div>
        </div>
    );
}

function Panel({ title, action, children, icon: Icon }) {
    return (
        <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2.5">
                    {Icon && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                    <span>{title}</span>
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function Laporan({ type, value, label, summary, chart, topProducts, transactions, perKasir = [] }) {
    function go(nextType, nextValue) {
        router.get('/laporan', { type: nextType, value: nextValue }, { preserveScroll: true, preserveState: true });
    }

    const navBtn = 'flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600';
    const inputCls =
        'rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 cursor-pointer';

    const thisYear = new Date().getFullYear();
    const yearOptions = [...new Set([...Array.from({ length: 8 }, (_, i) => thisYear - i), Number(value.slice(0, 4))])].sort(
        (a, b) => b - a,
    );

    const max = Math.max(...chart.map((c) => c.total), 1);
    const topMax = Math.max(...topProducts.map((p) => p.revenue), 1);

    const prev = summary.prevTotal;
    const diff = prev > 0 ? Math.round(((summary.total - prev) / prev) * 100) : null;
    let sub = '';
    let subClass = 'text-slate-400';
    if (diff !== null) {
        sub = `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)}% dari ${PREV_LABEL[type]}`;
        subClass = diff >= 0 ? 'text-emerald-600 font-black' : 'text-rose-600 font-black';
    } else if (summary.total > 0) {
        sub = `Belum ada data ${PREV_LABEL[type]}`;
    }

    const tip = (c) =>
        `${type === 'harian' ? c.label + ':00' : type === 'bulanan' ? 'Tgl ' + c.label : c.label} — ${rp(c.total)} (${c.count} transaksi)`;

    const breakdown = chart.map((c, i) => ({ ...c, i })).filter((c) => c.count > 0);

    function drill(c) {
        if (type === 'bulanan') go('harian', `${value}-${String(c.label).padStart(2, '0')}`);
        if (type === 'tahunan') go('bulanan', `${value}-${String(c.i + 1).padStart(2, '0')}`);
    }

    const pf = summary.profit;
    const marginPct = pf && pf.revenue > 0 ? Math.round((pf.profit / pf.revenue) * 1000) / 10 : 0;

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Laporan Penjualan" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <TrendingUp className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Pusat Analisis Finansial Toko</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Menampilkan data analitik untuk periode: <b className="text-white underline">{label}</b>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 print:hidden">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300"
                        >
                            <Printer className="h-4 w-4" /> Cetak Laporan
                        </button>
                        <a
                            href={`/laporan/export?type=${type}&value=${value}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                        >
                            <Download className="h-4 w-4 text-amber-300" /> Export CSV
                        </a>
                    </div>
                </div>
            </div>

            {/* Kontrol Periode & Navigasi */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl print:hidden">
                <div className="flex rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => go(t.key, convert(t.key, value))}
                            className={
                                'rounded-xl px-5 py-2.5 text-xs font-black transition-all ' +
                                (type === t.key ? 'bg-white text-indigo-600 shadow-md shadow-slate-200 scale-105' : 'text-slate-500 hover:text-slate-800')
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => go(type, shift(type, value, -1))} className={navBtn} aria-label="Sebelumnya">
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {type === 'harian' && (
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => e.target.value && go(type, e.target.value)}
                            className={inputCls}
                        />
                    )}
                    {type === 'bulanan' && (
                        <input
                            type="month"
                            value={value}
                            onChange={(e) => e.target.value && go(type, e.target.value)}
                            className={inputCls}
                        />
                    )}
                    {type === 'tahunan' && (
                        <select value={value} onChange={(e) => go(type, e.target.value)} className={inputCls}>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    )}

                    <button type="button" onClick={() => go(type, shift(type, value, 1))} className={navBtn} aria-label="Berikutnya">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Ringkasan Statistik Utama (4 Kartu) */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Wallet} label="Total Penjualan" value={rp(summary.total)} bg="bg-emerald-100/80" iconClass="text-emerald-700" ring="ring-emerald-400" sub={sub} subClass={subClass} />
                <StatCard icon={Receipt} label="Jumlah Transaksi" value={summary.count} bg="bg-sky-100/80" iconClass="text-sky-700" ring="ring-sky-400" sub="Nota sukses tercetak" subClass="text-sky-600 font-bold" />
                <StatCard icon={Egg} label="Item Terjual" value={num(summary.items)} bg="bg-amber-100/80" iconClass="text-amber-700" ring="ring-amber-400" sub="Total kuantiti barang" subClass="text-amber-600 font-bold" />
                <StatCard icon={BarChart3} label="Rata-Rata / Transaksi" value={rp(summary.average)} bg="bg-violet-100/80" iconClass="text-violet-700" ring="ring-violet-400" sub="Nilai keranjang belanja" subClass="text-violet-600 font-bold" />
            </div>

            {/* Panel Laba Kotor & Margin */}
            {pf && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimasi Laba Kotor</div>
                        <div className={'mt-2 text-2xl font-black ' + (pf.profit < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                            {rp(pf.profit)}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                            Penjualan {rp(pf.revenue)} − Modal {rp(pf.cogs)}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Margin Keuntungan</div>
                        <div className="mt-2 text-2xl font-black text-indigo-600">{marginPct}%</div>
                        <div className="mt-1 text-xs font-medium text-slate-500">Dari total omset produk berdata modal</div>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelengkapan Data Modal</div>
                        <div className={'mt-2 text-2xl font-black ' + (pf.coverage !== null && pf.coverage < 100 ? 'text-amber-600' : 'text-slate-800')}>
                            {pf.coverage === null ? '-' : `${pf.coverage}%`}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">Produk periode ini yang sudah punya harga beli</div>
                    </div>
                </div>
            )}

            {/* Peringatan Transaksi Dibatalkan */}
            {summary.voidedCount > 0 && (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 border border-rose-200 p-5 text-sm text-rose-800 shadow-sm">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div className="font-medium leading-relaxed">
                        <b>{summary.voidedCount} transaksi dibatalkan</b> pada periode ini dengan total nilai <b>{rp(summary.voidedTotal)}</b>. Transaksi batal tidak dihitung ke dalam omset bersih di atas. Cek menu Riwayat untuk rincian alasan pembatalan.
                    </div>
                </div>
            )}

            {/* Kondisi Kosong */}
            {summary.count === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/90 py-16 text-center text-slate-400 shadow-xl backdrop-blur-xl">
                    <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <span className="font-bold text-slate-700 text-base">Belum ada transaksi pada periode ini</span>
                    <p className="text-xs text-slate-400 mt-1">Lakukan transaksi kasir baru untuk mulai merekam data laporan.</p>
                </div>
            )}

            {/* Grafik Analitik Penjualan */}
            <Panel title={CHART_TITLE[type]} icon={BarChart3}>
                <div className="mt-4 flex h-56 items-end gap-1.5 pt-4">
                    {chart.map((c, i) => (
                        <div key={i} title={tip(c)} className="group relative flex h-full flex-1 items-end">
                            <div
                                className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 via-violet-600 to-amber-300 opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-y-105 shadow-md"
                                style={{ height: `${Math.max((c.total / max) * 100, c.total > 0 ? 4 : 1)}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex gap-1 border-t border-slate-100 pt-2">
                    {chart.map((c, i) => (
                        <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400 truncate">
                            {chart.length <= 12 || i % 3 === 0 ? c.label : ''}
                        </span>
                    ))}
                </div>
                <p className="mt-3 text-xs font-medium text-slate-400 text-center print:hidden">💡 Arahkan kursor ke batang grafik untuk melihat detail nominal transaksi.</p>
            </Panel>

            {/* Grid 2 Kolom: Produk Terlaris & Penjualan per Kasir */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Produk Terlaris & Kontributor Omset" icon={Award}>
                    {topProducts.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">Belum ada data penjualan produk.</p>
                    ) : (
                        <ul className="space-y-4">
                            {topProducts.map((p, i) => (
                                <li key={i} className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                        <span className="font-extrabold text-slate-800">
                                            {i + 1}. {p.name}
                                        </span>
                                        <span className="whitespace-nowrap text-xs font-bold text-slate-600">
                                            {num(p.qty)} {p.unit} · <b className="text-emerald-600">{rp(p.revenue)}</b>
                                            {p.profit != null && <span className="text-indigo-600 ml-1">· Laba {rp(p.profit)}</span>}
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70 shadow-inner">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-amber-400 transition-all duration-500"
                                            style={{ width: `${(p.revenue / topMax) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Kinerja Penjualan per Kasir" icon={Users}>
                    {perKasir.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">Belum ada transaksi tercatat.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {perKasir.map((k, i) => (
                                <li key={i} className="flex items-center gap-4 py-3.5 text-sm">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 font-black text-indigo-700 shadow-sm">
                                        {k.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-slate-800">{k.username}</div>
                                        <div className="text-xs font-bold text-slate-400">{k.count} transaksi berhasil</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-600">{rp(k.total)}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            {/* Rincian Transaksi / Rincian Periode */}
            <Panel title={type === 'harian' ? 'Daftar Transaksi Hari Ini' : type === 'bulanan' ? 'Rincian Per Hari' : 'Rincian Per Bulan'} icon={FileText}>
                {type === 'harian' ? (
                    transactions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">Belum ada transaksi pada hari ini.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <th className="pb-3 px-3">Waktu</th>
                                        <th className="pb-3 px-3">No. Invoice</th>
                                        <th className="pb-3 px-3">Kasir</th>
                                        <th className="pb-3 px-3 text-right">Total Nominal</th>
                                        <th className="pb-3 px-3 text-right print:hidden">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="transition-colors hover:bg-indigo-50/50">
                                            <td className="py-3.5 px-3 font-semibold text-slate-500">{t.time}</td>
                                            <td className="py-3.5 px-3 font-extrabold text-slate-800">{t.invoice}</td>
                                            <td className="py-3.5 px-3 text-xs font-bold text-slate-600">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1">{t.kasir}</span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-black text-emerald-600">{rp(t.total)}</td>
                                            <td className="py-3.5 px-3 text-right print:hidden">
                                                <Link
                                                    href={`/riwayat/${t.id}`}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Lihat Nota
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : breakdown.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Belum ada rincian data transaksi.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-3 px-3">Periode</th>
                                    <th className="pb-3 px-3">Jumlah Transaksi</th>
                                    <th className="pb-3 px-3 text-right">Total Omset</th>
                                    <th className="pb-3 px-3 text-right print:hidden">Navigasi Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {breakdown.map((c) => (
                                    <tr key={c.i} className="transition-colors hover:bg-indigo-50/50">
                                        <td className="py-3.5 px-3 font-extrabold text-slate-800">
                                            {type === 'bulanan' ? `Tanggal ${c.label}` : c.label}
                                        </td>
                                        <td className="py-3.5 px-3 font-bold text-slate-600">{c.count} transaksi</td>
                                        <td className="py-3.5 px-3 text-right font-black text-emerald-600">{rp(c.total)}</td>
                                        <td className="py-3.5 px-3 text-right print:hidden">
                                            <button
                                                type="button"
                                                onClick={() => drill(c)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                            >
                                                Detail Rincian →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        </div>
    );
}

Laporan.layout = (page) => <KasirLayout>{page}</KasirLayout>;