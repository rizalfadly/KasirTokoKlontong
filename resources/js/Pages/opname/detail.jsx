import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import { useDialog } from '../../Components/Dialog';

import {
    ArrowLeft, Send, Undo2, CheckCircle2, Printer, Download,
    Search, Calculator, Check, Sparkles, AlertTriangle, ShieldCheck, ClipboardCheck
} from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS = {
    draft: ['Sedang Dihitung', 'bg-amber-100 text-amber-800 border border-amber-200'],
    submitted: ['Menunggu Persetujuan Owner', 'bg-sky-100 text-sky-800 border border-sky-200'],
    approved: ['Disetujui & Selesai', 'bg-emerald-100 text-emerald-800 border border-emerald-200'],
};

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '-';

const hasCount = (r) => r.counted_qty !== null && r.counted_qty !== undefined;
const money = (r) => Math.round((r.difference ?? 0) * r.price);

function StatCard({ label, value, tone = 'text-slate-800', bg = 'bg-white/90', icon: Icon }) {
    return (
        <div className={'rounded-3xl border border-slate-100 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl flex items-center gap-4 ' + bg}>
            {Icon && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
                <div className={'mt-1 text-2xl font-black tracking-tight ' + tone}>{value}</div>
            </div>
        </div>
    );
}

export default function OpnameDetail({ opname, rows, uncounted, decimalUnits = ['kilo', 'liter'] }) {
    const { auth, errors } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const draft = opname.status === 'draft';
    const canCount = draft && !isOwner;
    const dialog = useDialog();

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
            setScanMsg({ ok: true, text: `✓ ${hit.name} (${hit.sku}): silakan masukkan jumlah hasil hitung.` });
            setTimeout(() => {
                const el = inputs.current[hit.product_id];
                el?.scrollIntoView({ block: 'center' });
                el?.focus();
                el?.select();
            }, 60);
        } else if (shown.length === 0) {
            setScanMsg({ ok: false, text: `⚠️ Kode "${search.trim()}" tidak ditemukan dalam cakupan opname ini.` });
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

    async function sendToOwner() {
        const ok = await dialog.confirm(
            `Kirim hasil hitungan (${counted.length} produk) ke owner?\n\nSetelah dikirim, hitungan tidak bisa diubah kecuali dikembalikan oleh owner.`,
            { title: 'Kirim ke owner', okText: 'Ya, kirim' },
        );
        if (ok) act('kirim');
    }

    async function approve() {
        const ok = await dialog.confirm(
            'Selisih akan otomatis dicatat di Buku Stok dan stok sistem disesuaikan. Tindakan ini tidak bisa diurungkan.',
            { title: 'Setujui opname', tone: 'success', okText: 'Ya, setujui' },
        );
        if (ok) act('setujui');
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

    async function remove() {
        const ok = await dialog.confirm(
            'Semua hasil hitungnya ikut terhapus dan stok sistem tidak berubah.',
            { title: 'Hapus opname', tone: 'danger', okText: 'Ya, hapus' },
        );
        if (ok) router.delete(`/opname/${opname.id}`);
    }

    const [statusLabel, statusStyle] = STATUS[opname.status] ?? [opname.status, 'bg-slate-100 text-slate-600 border border-slate-200'];
    const chip = (active) =>
        'rounded-2xl px-5 py-2.5 text-xs font-black transition-all ' +
        (active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200');

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title={`Opname ${opname.code}`} />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <ClipboardCheck className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Audit & Opname Gudang</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex flex-wrap items-center gap-3">
                            <span className="font-mono">{opname.code}</span>
                            <span className={'rounded-full px-4 py-1 text-xs font-black ' + statusStyle}>{statusLabel}</span>
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Cakupan: {opname.sku_prefix ? `SKU ${opname.sku_prefix}*` : 'Semua produk'} · Dibuat oleh <b className="text-white">{opname.creator ?? '-'}</b> pada {fmtDate(opname.created_at)}
                        </p>
                        {opname.note && <p className="mt-1 text-xs text-indigo-200 font-medium">Catatan: {opname.note}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        {draft && (
                            <>
                                <button
                                    type="button"
                                    onClick={remove}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black text-rose-700 shadow-sm hover:bg-rose-100 transition-colors"
                                >
                                    Hapus Opname
                                </button>
                                <button
                                    type="button"
                                    onClick={sendToOwner}
                                    disabled={counted.length === 0}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" /> Kirim ke Owner
                                </button>
                            </>
                        )}
                        {opname.status === 'submitted' && isOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setReturning(true)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                                >
                                    <Undo2 className="h-4 w-4 text-amber-300" /> Kembalikan ke Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={approve}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-xs font-black text-slate-900 shadow-lg shadow-emerald-400/30 transition-all hover:scale-105 hover:bg-emerald-300"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Setujui Opname
                                </button>
                            </>
                        )}
                        {!draft && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                                >
                                    <Printer className="h-4 w-4 text-amber-300" /> Cetak
                                </button>
                                <a
                                    href={`/opname/${opname.id}/export`}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                                >
                                    <Download className="h-4 w-4 text-amber-300" /> CSV
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Pesan Error / Status */}
            {errorText && (
                <div className="flex items-center gap-3 rounded-3xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-800 shadow-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                    <span>{errorText}</span>
                </div>
            )}
            {draft && opname.review_note && (
                <div className="flex items-center gap-3 rounded-3xl bg-amber-50 border border-amber-200 p-4 text-sm font-bold text-amber-800 shadow-sm">
                    <Undo2 className="h-5 w-5 shrink-0 text-amber-600" />
                    <span>Catatan pengembalian dari owner: {opname.review_note}</span>
                </div>
            )}
            {opname.status === 'submitted' && !isOwner && (
                <div className="flex items-center gap-3 rounded-3xl bg-sky-50 border border-sky-200 p-4 text-sm font-bold text-sky-800 shadow-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-sky-600" />
                    <span>Hasil hitungan opname sudah dikirim dan sedang menunggu verifikasi serta persetujuan owner.</span>
                </div>
            )}
            {opname.status === 'approved' && (
                <div className="flex items-start gap-3 rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="leading-relaxed">
                        Disetujui oleh <b className="text-slate-900">{opname.approver ?? '-'}</b> pada {fmtDate(opname.approved_at)}.
                        {opname.review_note ? ` Catatan: ${opname.review_note}.` : ''} Seluruh selisih stok telah dicatat ke Buku Stok.
                    </span>
                </div>
            )}

            {/* Ringkasan 4 Kartu */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Produk Dihitung" value={`${counted.length} dari ${rows.length}`} icon={Calculator} />
                <StatCard label="Selisih Kurang" value={rp(minus)} tone={minus < 0 ? 'text-rose-600' : 'text-slate-800'} icon={AlertTriangle} />
                <StatCard label="Selisih Lebih" value={`+${rp(plus)}`} tone={plus > 0 ? 'text-emerald-600' : 'text-slate-800'} icon={CheckCircle2} />
                <StatCard
                    label="Selisih Bersih"
                    value={`${plus + minus > 0 ? '+' : ''}${rp(plus + minus)}`}
                    tone={plus + minus < 0 ? 'text-rose-600' : plus + minus > 0 ? 'text-emerald-600' : 'text-slate-800'}
                    icon={Sparkles}
                />
            </div>

            {!draft && uncounted > 0 && (
                <p className="text-xs font-bold text-slate-400 px-2">ℹ️ {uncounted} produk dalam cakupan tidak dihitung, sehingga stok sistem tidak mengalami perubahan.</p>
            )}

            {/* Tabel Hitung Opname */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-6">
                {draft && (
                    <div className="space-y-4 print:hidden">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                                placeholder="Scan barcode / ketik SKU lalu Enter, atau cari nama produk..."
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
                                    'rounded-2xl px-4 py-3 text-sm font-bold shadow-sm ' +
                                    (scanMsg.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200')
                                }
                            >
                                {scanMsg.text}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button type="button" onClick={() => setFilter('semua')} className={chip(filter === 'semua')}>
                                Semua Produk ({rows.length})
                            </button>
                            <button type="button" onClick={() => setFilter('belum')} className={chip(filter === 'belum')}>
                                Belum Dihitung ({rows.length - counted.length})
                            </button>
                            <button type="button" onClick={() => setFilter('selisih')} className={chip(filter === 'selisih')}>
                                Ada Selisih
                            </button>
                        </div>
                    </div>
                )}

                {shown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                        <Calculator className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <span className="font-bold text-slate-700 text-base">Tidak ada produk yang cocok dengan filter</span>
                        <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-3 px-3">Produk & SKU</th>
                                    <th className="pb-3 px-3 text-right">Stok Sistem</th>
                                    <th className="pb-3 px-3 text-right">Hasil Hitung Fisik</th>
                                    <th className="pb-3 px-3 text-right">Selisih Qty</th>
                                    <th className="pb-3 px-3 text-right">Estimasi Nilai Selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {shown.map((r) => {
                                    const done = hasCount(r);
                                    const diff = r.difference ?? 0;
                                    return (
                                        <tr key={r.product_id} className="transition-colors hover:bg-indigo-50/50 group">
                                            <td className="py-4 px-3">
                                                <div className="font-extrabold text-slate-800">{r.name}</div>
                                                <div className="font-mono text-xs font-semibold text-indigo-600">{r.sku}</div>
                                            </td>
                                            <td className="py-4 px-3 text-right font-extrabold text-slate-700">
                                                {num(r.system_qty)} <span className="text-xs font-bold text-slate-400 uppercase">{r.unit}</span>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                {canCount ? (
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
                                                            className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-extrabold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-sm"
                                                        />
                                                        <span className="w-12 text-left text-xs font-bold text-slate-400 uppercase">{r.unit}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-black text-slate-800">
                                                        {num(r.counted_qty)} <span className="text-xs font-bold text-slate-400 uppercase">{r.unit}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={
                                                    'py-4 px-3 text-right font-black ' +
                                                    (!done
                                                        ? 'text-slate-300'
                                                        : diff < 0
                                                        ? 'text-rose-600'
                                                        : diff > 0
                                                        ? 'text-emerald-600'
                                                        : 'text-emerald-600')
                                                }
                                            >
                                                {!done ? '—' : diff === 0 ? (
                                                    <span className="inline-flex items-center justify-end gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                                                        <Check className="h-3.5 w-3.5" /> Cocok
                                                    </span>
                                                ) : `${diff > 0 ? '+' : ''}${num(diff)} ${r.unit}`}
                                            </td>
                                            <td
                                                className={
                                                    'py-4 px-3 text-right font-black ' +
                                                    (!done || diff === 0 ? 'text-slate-300' : diff < 0 ? 'text-rose-600' : 'text-emerald-600')
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

                <p className="text-xs font-medium text-slate-400 pt-2 border-t border-slate-100">
                    💡 Nilai selisih dihitung berdasarkan harga jual produk saat penghitungan fisik dilakukan, sebagai estimasi awal.
                </p>
            </div>

            {/* Modal Kembalikan ke Admin */}
            {returning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
                    <form onSubmit={giveBack} className="w-full max-w-md space-y-5 rounded-3xl border border-white/80 bg-white p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm mb-3">
                                <Undo2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Kembalikan Opname ke Admin</h2>
                            <p className="mt-1 text-xs md:text-sm text-slate-500 leading-relaxed">
                                Dokumen opname akan dikembalikan ke status draft supaya admin dapat memeriksa dan menghitung ulang fisik barang. Stok sistem belum berubah.
                            </p>
                        </div>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Catatan Revisi untuk Admin *</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="mis. Hitung ulang kategori telur ayam, selisih kurang terlalu besar..."
                                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {errors?.review_note && <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {errors.review_note}</span>}
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setReturning(false)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                            >
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