import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import {
    ArrowLeft, Send, Undo2, CheckCircle2, Printer, Download,
    Search, Calculator, Check,
} from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS = {
    draft: ['Sedang dihitung', 'bg-amber-100 text-amber-800'],
    submitted: ['Menunggu persetujuan owner', 'bg-sky-100 text-sky-700'],
    approved: ['Disetujui', 'bg-emerald-100 text-emerald-700'],
};

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '-';

const hasCount = (r) => r.counted_qty !== null && r.counted_qty !== undefined;
const money = (r) => Math.round((r.difference ?? 0) * r.price);

function Stat({ label, value, tone = '' }) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-md">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={'mt-1 text-xl font-bold ' + tone}>{value}</div>
        </div>
    );
}

export default function OpnameDetail({ opname, rows, uncounted, decimalUnits = ['kilo', 'liter'] }) {
    const { auth, errors } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const draft = opname.status === 'draft';

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('semua');
    const [scanMsg, setScanMsg] = useState(null);
    const [saveError, setSaveError] = useState('');
    const [returning, setReturning] = useState(false);
    const [returnNote, setReturnNote] = useState('');
    const inputs = useRef({});

    const counted = rows.filter(hasCount);
    const minus = counted.filter((r) => r.difference < 0).reduce((s, r) => s + money(r), 0);
    const plus = counted.filter((r) => r.difference > 0).reduce((s, r) => s + money(r), 0);

    const q = search.trim().toLowerCase();
    const shown = rows.filter((r) => {
        const matchQ =
            !q ||
            (r.name ?? '').toLowerCase().includes(q) ||
            (r.sku ?? '').toLowerCase().includes(q) ||
            (r.barcode ?? '').toLowerCase().includes(q);
        const matchF =
            filter === 'semua' ||
            (filter === 'belum' && !hasCount(r)) ||
            (filter === 'selisih' && hasCount(r) && r.difference !== 0);
        return matchQ && matchF;
    });

    const errorText = saveError || errors?.status || errors?.counted_qty || '';

    // Simpan hasil hitung satu produk saat kolomnya ditinggalkan / Enter
    function save(row, value) {
        const v = String(value).trim().replace(',', '.');
        const current = hasCount(row) ? String(row.counted_qty) : '';
        if (v === current) return;

        router.post(
            `/opname/${opname.id}/hitung`,
            { product_id: row.product_id, counted_qty: v === '' ? null : Number(v) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSaveError(''),
                onError: (e) => setSaveError(Object.values(e)[0]),
            },
        );
    }

    // Scanner: ketik kode lalu Enter -> lompat ke kolom hitung produk itu
    function handleScan(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const code = search.trim().toLowerCase();
        if (!code) return;

        const hit = rows.find(
            (r) => (r.barcode ?? '').toLowerCase() === code || (r.sku ?? '').toLowerCase() === code,
        );

        if (hit) {
            setSearch('');
            setFilter('semua');
            setScanMsg({ ok: true, text: `${hit.name} (${hit.sku}): isi jumlah hasil hitung.` });
            setTimeout(() => {
                const el = inputs.current[hit.product_id];
                el?.scrollIntoView({ block: 'center' });
                el?.focus();
                el?.select();
            }, 60);
        } else if (shown.length === 0) {
            setScanMsg({ ok: false, text: `Kode "${search.trim()}" tidak ada dalam opname ini.` });
            setSearch('');
        }

        setTimeout(() => setScanMsg(null), 4000);
    }

    const act = (path, data = {}, extra = {}) =>
        router.post(`/opname/${opname.id}/${path}`, data, {
            preserveScroll: true,
            onError: (e) => setSaveError(Object.values(e)[0]),
            ...extra,
        });

    function sendToOwner() {
        if (confirm(`Kirim hasil hitungan (${counted.length} produk) ke owner?\n\nSetelah dikirim, hitungan tidak bisa diubah kecuali dikembalikan owner.`)) {
            act('kirim');
        }
    }

    function approve() {
        if (confirm('Setujui opname ini?\n\nSelisih akan dicatat di Buku Stok dan stok sistem disesuaikan. Ini tidak bisa diurungkan.')) {
            act('setujui');
        }
    }

    function giveBack(e) {
        e.preventDefault();
        act('kembalikan', { review_note: returnNote }, {
            onSuccess: () => {
                setReturning(false);
                setReturnNote('');
            },
        });
    }

    function remove() {
        if (confirm('Hapus opname ini? Semua hasil hitungnya ikut terhapus. Stok tidak berubah.')) {
            router.delete(`/opname/${opname.id}`);
        }
    }

    const [statusLabel, statusStyle] = STATUS[opname.status] ?? [opname.status, 'bg-slate-100 text-slate-600'];
    const chip = (active) =>
        'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
        (active ? 'bg-slate-900 text-white shadow' : 'bg-white/80 text-slate-600 hover:bg-white');

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title={`Opname ${opname.code}`} />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Link href="/opname" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline print:hidden">
                        <ArrowLeft className="h-4 w-4" /> Semua opname
                    </Link>
                    <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold">
                        <span className="font-mono">{opname.code}</span>
                        <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + statusStyle}>{statusLabel}</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Cakupan: {opname.sku_prefix ? `SKU ${opname.sku_prefix}*` : 'Semua produk'} · Dibuat oleh{' '}
                        {opname.creator ?? '-'}, {fmtDate(opname.created_at)}
                    </p>
                    {opname.note && <p className="text-sm text-slate-500">Catatan: {opname.note}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    {draft && (
                        <>
                            <button
                                onClick={remove}
                                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={sendToOwner}
                                disabled={counted.length === 0}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105 disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" /> Kirim ke owner
                            </button>
                        </>
                    )}
                    {opname.status === 'submitted' && isOwner && (
                        <>
                            <button
                                onClick={() => setReturning(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <Undo2 className="h-4 w-4" /> Kembalikan
                            </button>
                            <button
                                onClick={approve}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Setujui
                            </button>
                        </>
                    )}
                    {!draft && (
                        <>
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" /> Cetak
                            </button>
                            <a
                                href={`/opname/${opname.id}/export`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4" /> CSV
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Pesan status */}
            {errorText && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorText}</div>}
            {draft && opname.review_note && (
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                    <Undo2 className="h-4 w-4 shrink-0" />
                    <span>Dikembalikan owner: {opname.review_note}</span>
                </div>
            )}
            {opname.status === 'submitted' && !isOwner && (
                <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    Hasil hitungan sudah dikirim dan menunggu persetujuan owner.
                </div>
            )}
            {opname.status === 'approved' && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        Disetujui oleh {opname.approver ?? '-'} pada {fmtDate(opname.approved_at)}.
                        {opname.review_note ? ` Catatan: ${opname.review_note}.` : ''} Selisih sudah dicatat di Buku Stok.
                    </span>
                </div>
            )}

            {/* Ringkasan */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Produk dihitung" value={`${counted.length} dari ${rows.length}`} />
                <Stat label="Selisih kurang" value={rp(minus)} tone={minus < 0 ? 'text-red-600' : ''} />
                <Stat label="Selisih lebih" value={`+${rp(plus)}`} tone={plus > 0 ? 'text-emerald-700' : ''} />
                <Stat
                    label="Selisih bersih"
                    value={`${plus + minus > 0 ? '+' : ''}${rp(plus + minus)}`}
                    tone={plus + minus < 0 ? 'text-red-600' : plus + minus > 0 ? 'text-emerald-700' : ''}
                />
            </div>
            {!draft && uncounted > 0 && (
                <p className="text-sm text-slate-500">{uncounted} produk dalam cakupan tidak dihitung, jadi stoknya tidak diubah.</p>
            )}

            {/* Tabel hitung */}
            <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-md">
                {draft && (
                    <div className="mb-4 space-y-3 print:hidden">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                placeholder="Scan barcode / ketik SKU lalu Enter, atau cari nama produk"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleScan}
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                        {scanMsg && (
                            <div
                                className={
                                    'rounded-xl px-4 py-2 text-sm font-medium ' +
                                    (scanMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')
                                }
                            >
                                {scanMsg.text}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setFilter('semua')} className={chip(filter === 'semua')}>
                                Semua ({rows.length})
                            </button>
                            <button onClick={() => setFilter('belum')} className={chip(filter === 'belum')}>
                                Belum dihitung ({rows.length - counted.length})
                            </button>
                            <button onClick={() => setFilter('selisih')} className={chip(filter === 'selisih')}>
                                Ada selisih
                            </button>
                        </div>
                    </div>
                )}

                {shown.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <Calculator className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Tidak ada produk yang cocok.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm text-slate-400">
                                    <th className="pb-3 font-medium">Produk</th>
                                    <th className="pb-3 text-right font-medium">Stok sistem</th>
                                    <th className="pb-3 text-right font-medium">Hasil hitung</th>
                                    <th className="pb-3 text-right font-medium">Selisih</th>
                                    <th className="pb-3 text-right font-medium">Nilai selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {shown.map((r) => {
                                    const done = hasCount(r);
                                    const diff = r.difference ?? 0;
                                    return (
                                        <tr key={r.product_id} className="transition hover:bg-amber-50/50">
                                            <td className="py-3">
                                                <div className="font-medium">{r.name}</div>
                                                <div className="font-mono text-xs text-slate-400">{r.sku}</div>
                                            </td>
                                            <td className="py-3 text-right text-sm">
                                                {num(r.system_qty)} {r.unit}
                                            </td>
                                            <td className="py-3 text-right">
                                                {draft ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <input
                                                            ref={(el) => (inputs.current[r.product_id] = el)}
                                                            key={`${r.product_id}-${done ? r.counted_qty : ''}`}
                                                            type="number"
                                                            min="0"
                                                            step={decimalUnits.includes(r.unit) ? '0.001' : '1'}
                                                            defaultValue={done ? r.counted_qty : ''}
                                                            onBlur={(e) => save(r, e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                            className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                                        />
                                                        <span className="w-12 text-left text-xs text-slate-400">{r.unit}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-semibold">
                                                        {num(r.counted_qty)} {r.unit}
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={
                                                    'py-3 text-right text-sm font-semibold ' +
                                                    (!done
                                                        ? 'text-slate-300'
                                                        : diff < 0
                                                          ? 'text-red-600'
                                                          : diff > 0
                                                            ? 'text-emerald-700'
                                                            : 'text-emerald-600')
                                                }
                                            >
                                                {!done ? '—' : diff === 0 ? (
                                                    <span className="inline-flex items-center justify-end gap-1">
                                                        <Check className="h-4 w-4" /> Cocok
                                                    </span>
                                                ) : `${diff > 0 ? '+' : ''}${num(diff)} ${r.unit}`}
                                            </td>
                                            <td
                                                className={
                                                    'py-3 text-right text-sm ' +
                                                    (!done || diff === 0 ? 'text-slate-300' : diff < 0 ? 'text-red-600' : 'text-emerald-700')
                                                }
                                            >
                                                {!done || diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${rp(money(r))}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="mt-3 text-xs text-slate-400">
                    Nilai selisih dihitung dari harga jual saat produk dihitung, sebagai perkiraan.
                </p>
            </div>

            {/* Pop-up kembalikan */}
            {returning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
                    <form onSubmit={giveBack} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Undo2 className="h-5 w-5 text-orange-500" /> Kembalikan ke admin
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Opname dibuka lagi supaya admin bisa menghitung ulang. Stok belum berubah.
                            </p>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-600">Catatan untuk admin</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="mis. Hitung ulang telur ayam, selisihnya terlalu besar"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            />
                            {errors?.review_note && <span className="mt-1 block text-xs text-red-600">{errors.review_note}</span>}
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setReturning(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button className="flex-1 rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600">
                                Kembalikan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

OpnameDetail.layout = (page) => <KasirLayout>{page}</KasirLayout>;