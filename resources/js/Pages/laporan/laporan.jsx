import { Head, Link, router } from '@inertiajs/react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import {
    Wallet, Receipt, Egg, BarChart3, Printer, Download,
    AlertTriangle, Inbox, ChevronLeft, ChevronRight,
} from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const TABS = [
    { key: 'harian', label: 'Harian' },
    { key: 'bulanan', label: 'Bulanan' },
    { key: 'tahunan', label: 'Tahunan' },
];

const PREV_LABEL = { harian: 'kemarin', bulanan: 'bulan lalu', tahunan: 'tahun lalu' };
const CHART_TITLE = { harian: 'Penjualan per jam', bulanan: 'Penjualan per hari', tahunan: 'Penjualan per bulan' };

// Pindah jenis laporan sambil mempertahankan tanggal yang sedang dilihat
function convert(to, v) {
    const [y, m = '01', d = '01'] = v.split('-');
    if (to === 'tahunan') return y;
    if (to === 'bulanan') return `${y}-${m}`;
    return `${y}-${m}-${d}`;
}

// Geser periode ke sebelum (-1) atau sesudah (+1)
function shift(type, v, dir) {
    if (type === 'tahunan') return String(Number(v) + dir);
    if (type === 'bulanan') {
        const [y, m] = v.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 7);
    }
    const [y, m, d] = v.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + dir)).toISOString().slice(0, 10);
}

function Stat({ icon: Icon, label, value, bg, iconClass = 'text-slate-700', sub, subClass = 'text-slate-400' }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={'flex h-11 w-11 items-center justify-center rounded-xl ' + bg}>
                <Icon className={'h-5 w-5 ' + iconClass} />
            </div>
            <div className="mt-4 text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-2xl font-bold">{value}</div>
            {sub && <div className={'mt-1 text-xs font-medium ' + subClass}>{sub}</div>}
        </div>
    );
}

function Panel({ title, action, children }) {
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function Laporan({ type, value, label, summary, chart, topProducts, transactions, perKasir = [] }) {
    // console.log('perKasir:', perKasir);
    function go(nextType, nextValue) {
        router.get('/laporan', { type: nextType, value: nextValue }, { preserveScroll: true, preserveState: true });
    }

    const navBtn = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50';
    const inputCls =
        'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

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
        subClass = diff >= 0 ? 'text-emerald-600' : 'text-red-500';
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
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Laporan" />

            <div>
                <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
                <p className="text-sm text-slate-500">{label}</p>
            </div>

            {/* Kontrol periode */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
                <div className="flex rounded-xl bg-slate-100 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => go(t.key, convert(t.key, value))}
                            className={
                                'rounded-lg px-4 py-2 text-sm font-medium transition ' +
                                (type === t.key ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800')
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1.5">
                    <button onClick={() => go(type, shift(type, value, -1))} className={navBtn} aria-label="Sebelumnya">
                        <ChevronLeft className="h-4 w-4" />
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

                    <button onClick={() => go(type, shift(type, value, 1))} className={navBtn} aria-label="Berikutnya">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                    >
                        <Printer className="h-4 w-4" /> Cetak
                    </button>
                    <a
                        href={`/laporan/export?type=${type}&value=${value}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Download className="h-4 w-4" /> CSV
                    </a>
                </div>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat icon={Wallet}    label="Total penjualan"       value={rp(summary.total)}   bg="bg-emerald-100" iconClass="text-emerald-700" sub={sub} subClass={subClass} />
                <Stat icon={Receipt}   label="Jumlah transaksi"      value={summary.count}       bg="bg-sky-100"     iconClass="text-sky-700" />
                <Stat icon={Egg}       label="Item terjual"          value={num(summary.items)}  bg="bg-amber-100"   iconClass="text-amber-700" />
                <Stat icon={BarChart3} label="Rata-rata / transaksi" value={rp(summary.average)} bg="bg-violet-100"  iconClass="text-violet-700" />
            </div>
            {pf && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
                        <div className="text-sm text-slate-500">Laba kotor</div>
                        <div className={'mt-1 text-xl font-bold ' + (pf.profit < 0 ? 'text-red-600' : 'text-emerald-700')}>
                            {rp(pf.profit)}
                        </div>
                        <div className="text-xs text-slate-400">
                            penjualan {rp(pf.revenue)} − modal {rp(pf.cogs)}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
                        <div className="text-sm text-slate-500">Margin</div>
                        <div className="mt-1 text-xl font-bold">{marginPct}%</div>
                        <div className="text-xs text-slate-400">dari penjualan yang punya data modal</div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
                        <div className="text-sm text-slate-500">Kelengkapan data modal</div>
                        <div className={'mt-1 text-xl font-bold ' + (pf.coverage !== null && pf.coverage < 100 ? 'text-orange-600' : '')}>
                            {pf.coverage === null ? '-' : `${pf.coverage}%`}
                        </div>
                        <div className="text-xs text-slate-400">penjualan periode ini yang sudah punya harga beli</div>
                    </div>
                </div>
            )}
            {summary.voidedCount > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        {summary.voidedCount} transaksi dibatalkan pada periode ini ({rp(summary.voidedTotal)}). Tidak dihitung
                        dalam angka di atas. Lihat detailnya di Riwayat.
                    </span>
                </div>
            )}
            {summary.count === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
                    <Inbox className="mx-auto h-10 w-10" />
                    <p className="mt-2 text-sm">Belum ada transaksi pada periode ini.</p>
                </div>
            )}

            {/* Grafik */}
            <Panel title={CHART_TITLE[type]}>
                <div className="mt-4 flex h-48 items-end gap-1">
                    {chart.map((c, i) => (
                        <div key={i} title={tip(c)} className="group flex h-full flex-1 items-end">
                            <div
                                className="w-full rounded-t bg-gradient-to-t from-orange-500 to-amber-300 opacity-80 transition group-hover:opacity-100"
                                style={{ height: `${Math.max((c.total / max) * 100, c.total > 0 ? 3 : 0.5)}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex gap-1">
                    {chart.map((c, i) => (
                        <span key={i} className="flex-1 text-center text-[10px] text-slate-400">
                            {chart.length <= 12 || i % 3 === 0 ? c.label : ''}
                        </span>
                    ))}
                </div>
                <p className="mt-2 text-xs text-slate-400 print:hidden">Arahkan kursor ke batang untuk melihat nominalnya.</p>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Produk terlaris */}
                <Panel title="Produk terlaris">
                    {topProducts.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Belum ada penjualan.</p>}
                    <ul className="space-y-4">
                        {topProducts.map((p, i) => (
                            <li key={i}>
                                <div className="mb-1 flex justify-between gap-3 text-sm">
                                    <span className="font-medium">
                                        {i + 1}. {p.name}
                                    </span>
                                    <span className="whitespace-nowrap text-slate-500">
                                        {num(p.qty)} {p.unit} · <b className="text-slate-800">{rp(p.revenue)}</b>
                                        {p.profit != null && <span className="text-emerald-700"> · laba {rp(p.profit)}</span>}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
                                        style={{ width: `${(p.revenue / topMax) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Panel>

                {/* Rincian perkasir */}
                <Panel title="Penjualan per kasir">
                        {perKasir.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-400">Belum ada transaksi.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {perKasir.map((k, i) => (
                                    <li key={i} className="flex items-center gap-3 py-3 text-sm">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700">
                                            {k.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="flex-1 font-medium">{k.username}</span>
                                        <span className="text-slate-400">{k.count} transaksi</span>
                                        <span className="font-semibold text-emerald-700">{rp(k.total)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                {/* Rincian */}
                <Panel title={type === 'harian' ? 'Transaksi hari ini' : type === 'bulanan' ? 'Rincian per hari' : 'Rincian per bulan'}>
                    {type === 'harian' ? (
                        transactions.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-400">Belum ada transaksi.</p>
                        ) : (
                            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto print:max-h-none">
                                {transactions.map((t) => (
                                    <li key={t.id} className="flex items-center gap-3 py-3 text-sm">
                                        <span className="w-12 text-slate-400">{t.time}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-medium">{t.invoice}</div>
                                            <div className="text-xs text-slate-400">{t.kasir}</div>
                                        </div>
                                        <span className="font-semibold text-emerald-700">{rp(t.total)}</span>
                                        <Link href={`/riwayat/${t.id}`} className="text-orange-600 hover:underline print:hidden">
                                            Nota
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : breakdown.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-400">Belum ada transaksi.</p>
                    ) : (
                        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto print:max-h-none">
                            {breakdown.map((c) => (
                                <li key={c.i} className="flex items-center gap-3 py-3 text-sm">
                                    <span className="w-16 font-medium">{type === 'bulanan' ? `Tgl ${c.label}` : c.label}</span>
                                    <span className="flex-1 text-slate-400">{c.count} transaksi</span>
                                    <span className="font-semibold text-emerald-700">{rp(c.total)}</span>
                                    <button onClick={() => drill(c)} className="text-orange-600 hover:underline print:hidden">
                                        Detail →
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </div>
    );
}

Laporan.layout = (page) => <KasirLayout>{page}</KasirLayout>;