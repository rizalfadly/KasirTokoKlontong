import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { num } from '../../lib/format';
import { ArrowLeft, Ban, Printer, X } from 'lucide-react';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PAPERS = {
    58: { label: 'Struk 58 mm', width: '58mm', page: '58mm auto' },
    80: { label: 'Struk 80 mm', width: '80mm', page: '80mm auto' },
    a4: { label: 'A4', width: '100%', page: 'A4' },
};

const CHANNEL_LABEL = { offline: 'Offline', tokopedia: 'Tokopedia', shopee: 'Shopee', grosir: 'Grosir' };
const PAY_LABEL = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', marketplace: 'Via Marketplace' };

function Row({ l, r, bold }) {
    return (
        <div className={'flex justify-between gap-1 ' + (bold ? 'font-black' : '')}>
            <span className="truncate pr-1">{l}</span>
            <span className="shrink-0 text-right">{r}</span>
        </div>
    );
}

function Line() {
    return <hr className="my-2 border-t border-dashed border-slate-400 print:border-black" />;
}

export default function Nota({ sale, store }) {
    const { auth } = usePage().props;
    const canVoid = auth?.user?.id === sale.user_id && !sale.voided_at;

    const [showVoid, setShowVoid] = useState(false);
    const voidForm = useForm({ reason: '' });

    const [paper, setPaper] = useState(() => {
        try {
            const saved = localStorage.getItem('nota_paper');
            return PAPERS[saved] ? saved : '58'; // Default ke 58mm agar aman untuk printer kecil
        } catch {
            return '58';
        }
    });
    const p = PAPERS[paper];

    function changePaper(value) {
        setPaper(value);
        try {
            localStorage.setItem('nota_paper', value);
        } catch {}
    }

    function submitVoid(e) {
        e.preventDefault();
        voidForm.post(`/riwayat/${sale.id}/batal`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowVoid(false);
                voidForm.reset();
            },
        });
    }

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('print')) {
            const t = setTimeout(() => window.print(), 500);
            return () => clearTimeout(t);
        }
    }, []);

    const fmt = (d) =>
        new Date(d).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100 px-4 py-6 print:bg-white print:p-0">
            <Head title={`Nota ${sale.invoice}`} />

            <style>{`
                @media print {
                    @page { size: ${p.page}; margin: 2mm; }
                    body { background: #fff !important; }
                    .nota { width: 100% !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; font-size: 10px !important; }
                }
            `}</style>

            {/* Toolbar (tidak ikut tercetak) */}
            <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-between gap-3 print:hidden">
                <Link
                    href="/riwayat"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-indigo-600" /> Kembali ke Riwayat
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                    {canVoid && (
                        <button
                            type="button"
                            onClick={() => setShowVoid(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700 shadow-sm hover:bg-rose-100 transition-colors"
                        >
                            <Ban className="h-4 w-4" /> Batalkan Transaksi
                        </button>
                    )}
                    <select
                        value={paper}
                        onChange={(e) => changePaper(e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 cursor-pointer"
                    >
                        {Object.entries(PAPERS).map(([key, v]) => (
                            <option key={key} value={key}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                    >
                        <Printer className="h-4 w-4 text-amber-300" /> Cetak Struk
                    </button>
                </div>
            </div>

            {/* Nota Struk Box (Dioptimalkan untuk 58mm & 80mm) */}
            <div
                className={`nota mx-auto rounded-3xl bg-white p-4 md:p-6 font-mono leading-tight text-slate-900 shadow-2xl shadow-indigo-500/10 border border-slate-100 print:shadow-none print:border-none print:p-0 ${
                    paper === '58' ? 'text-[10px]' : 'text-[11px] md:text-[12px]'
                }`}
                style={{ width: p.width, maxWidth: paper === 'a4' ? '42rem' : undefined }}
            >
                {/* Header Toko */}
                <div className="text-center space-y-0.5">
                    <div className="font-black uppercase tracking-wider text-xs md:text-sm">{store?.name || 'Kasir Toko'}</div>
                    {store?.address && <div className="whitespace-pre-line text-slate-500 font-sans text-[10px]">{store.address}</div>}
                    {store?.phone && <div className="text-slate-500 font-sans text-[10px]">Telp/WA: {store.phone}</div>}
                    {store?.slogan && <div className="italic text-indigo-600 font-sans text-[10px] font-bold">{store.slogan}</div>}
                </div>

                <Line />

                {/* Status Batal */}
                {sale.voided_at && (
                    <div className="my-2 rounded-xl bg-rose-50 p-2 text-center border border-rose-200 text-rose-800 space-y-0.5">
                        <div className="font-black tracking-widest uppercase">*** DIBATALKAN ***</div>
                        <div>Alasan: {sale.void_reason}</div>
                        <div className="text-[9px]">
                            Oleh {sale.voider?.username ?? '-'} • {fmt(sale.voided_at)}
                        </div>
                        <Line />
                    </div>
                )}

                {/* Metadata Transaksi */}
                <div className="space-y-0.5 text-slate-600">
                    <Row l="No" r={sale.invoice} />
                    <Row l="Tgl" r={fmt(sale.created_at)} />
                    <Row l="Kasir" r={sale.user?.username ?? '-'} />
                    <Row l="Channel" r={CHANNEL_LABEL[sale.channel] ?? sale.channel ?? '-'} />
                    <Row l="Bayar" r={PAY_LABEL[sale.payment_method] ?? sale.payment_method ?? '-'} />
                </div>

                <Line />

                {/* Daftar Item Belanja (Diatur agar muat di 58mm tanpa tabrakan) */}
                <div className="space-y-1.5">
                    {sale.items.map((it) => (
                        <div key={it.id} className="space-y-0.5">
                            <div className="font-bold text-slate-900 break-words">{it.product?.name ?? 'Produk Dihapus'}</div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span className="shrink-0">
                                    {num(it.qty)} {it.product?.unit ?? ''} × {rp(it.price)}
                                </span>
                                <span className="font-bold text-slate-900 text-right shrink-0">{rp(it.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Line />

                {/* Total & Pembayaran */}
                <div className="space-y-1 text-slate-800">
                    <div className="flex justify-between font-black text-xs md:text-sm">
                        <span>TOTAL</span>
                        <span>{rp(sale.total)}</span>
                    </div>
                    {sale.payment_method === 'tunai' ? (
                        <>
                            <Row l="Tunai" r={rp(sale.paid)} />
                            <Row l="Kembali" r={rp(sale.change_amount)} />
                        </>
                    ) : (
                        <Row l="Status" r="LUNAS" />
                    )}
                </div>
                
                <Line />

                {/* Footer Struk */}
                <div className="whitespace-pre-line text-center text-slate-500 font-sans text-[10px] pt-0.5">
                    {store?.footer || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.'}
                </div>
            </div>

            {/* Modal Batalkan Transaksi */}
            {showVoid && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
                    <form onSubmit={submitVoid} className="w-full max-w-md space-y-5 rounded-3xl border border-white/80 bg-white p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shadow-sm">
                                <Ban className="h-6 w-6" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowVoid(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div>
                            <h2 className="text-lg font-black text-slate-900">Batalkan Transaksi Ini?</h2>
                            <p className="mt-1 text-xs md:text-sm text-slate-500 leading-relaxed">
                                Transaksi <b className="text-slate-800">{sale.invoice}</b> ({rp(sale.total)}) akan ditandai batal dan stok seluruh barang akan dikembalikan otomatis ke gudang.
                            </p>
                        </div>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Alasan Pembatalan *</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={voidForm.data.reason}
                                onChange={(e) => voidForm.setData('reason', e.target.value)}
                                placeholder="mis. Salah input jumlah, pelanggan batal beli..."
                                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {voidForm.errors.reason && (
                                <span className="mt-1 block text-xs font-extrabold text-rose-600">⚠️ {voidForm.errors.reason}</span>
                            )}
                        </label>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowVoid(false)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={voidForm.processing}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {voidForm.processing ? 'Memproses...' : 'Ya, Batalkan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}