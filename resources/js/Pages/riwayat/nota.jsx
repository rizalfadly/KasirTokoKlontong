import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { num } from '../../lib/format';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PAPERS = {
    58: { label: 'Struk 58 mm', width: '58mm', page: '58mm auto' },
    80: { label: 'Struk 80 mm', width: '80mm', page: '80mm auto' },
    a4: { label: 'A4', width: '100%', page: 'A4' },
};
    const CHANNEL_LABEL = { offline: 'Offline', tokopedia: 'Tokopedia', shopee: 'Shopee' };
    const PAY_LABEL = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', marketplace: 'Via marketplace' };
    
function Row({ l, r, bold }) {
    return (
        <div className={'flex justify-between gap-2 ' + (bold ? 'text-sm font-bold' : '')}>
            <span>{l}</span>
            <span className="text-right">{r}</span>
        </div>
    );
}

function Line() {
    return <hr className="my-2 border-t border-dashed border-black" />;
}

export default function Nota({ sale, store }) {
    const { auth } = usePage().props;
    const canVoid = auth?.user?.id === sale.user_id && !sale.voided_at;

    const [showVoid, setShowVoid] = useState(false);
    const voidForm = useForm({ reason: '' });

    const [paper, setPaper] = useState(() => {
        try {
            const saved = localStorage.getItem('nota_paper');
            return PAPERS[saved] ? saved : '80';
        } catch {
            return '80';
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

    // Buka dengan ?print=1 -> dialog cetak muncul otomatis
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
        <div className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
            <Head title={`Nota ${sale.invoice}`} />

            <style>{`
                @media print {
                    @page { size: ${p.page}; margin: 4mm; }
                    body { background: #fff !important; }
                    .nota { width: 100% !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
                }
            `}</style>

            {/* Toolbar (tidak ikut tercetak) */}
            <div className="mx-auto mb-4 flex max-w-2xl flex-wrap items-center justify-between gap-3 print:hidden">
                <Link href="/riwayat" className="text-sm font-medium text-orange-600 hover:underline">
                    ← Kembali ke riwayat
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                    {canVoid && (
                        <button
                            onClick={() => setShowVoid(true)}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                            🚫 Batalkan transaksi
                        </button>
                    )}
                    <select
                        value={paper}
                        onChange={(e) => changePaper(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                    >
                        {Object.entries(PAPERS).map(([key, v]) => (
                            <option key={key} value={key}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => window.print()}
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                    >
                        🖨️ Cetak
                    </button>
                </div>
            </div>

            {/* Nota */}
            <div
                className="nota mx-auto rounded-xl bg-white p-4 font-mono text-[12px] leading-snug text-black shadow-lg"
                style={{ width: p.width, maxWidth: paper === 'a4' ? '42rem' : undefined }}
            >
                <div className="text-center">
                    <div className="text-base font-bold uppercase tracking-wide">{store?.name || 'Kasir Telur'}</div>
                    {store?.address && <div className="whitespace-pre-line">{store.address}</div>}
                    {store?.phone && <div>Telp/WA: {store.phone}</div>}
                    {store?.slogan && <div className="mt-1 italic">{store.slogan}</div>}
                </div>

                <Line />

                {sale.voided_at && (
                    <>
                        <div className="text-center text-sm font-bold">*** DIBATALKAN ***</div>
                        <div className="text-center">Alasan: {sale.void_reason}</div>
                        <div className="text-center">
                            Oleh {sale.voider?.username ?? '-'}, {fmt(sale.voided_at)}
                        </div>
                        <Line />
                    </>
                )}

                <div className="space-y-0.5">
                    <Row l="No" r={sale.invoice} />
                    <Row l="Tanggal" r={fmt(sale.created_at)} />
                    <Row l="Kasir" r={sale.user?.username ?? '-'} />
                    <Row l="Asal" r={CHANNEL_LABEL[sale.channel] ?? sale.channel ?? '-'} />
                    <Row l="Bayar via" r={PAY_LABEL[sale.payment_method] ?? sale.payment_method ?? '-'} />
                </div>

                <Line />

                {sale.items.map((it) => (
                    <div key={it.id} className="mb-1.5">
                        <div className="font-bold">{it.product?.name ?? 'Produk dihapus'}</div>
                        <div className="flex justify-between">
                            <span>
                                {num(it.qty)} {it.product?.unit ?? ''} x {rp(it.price)}
                            </span>
                            <span>{rp(it.subtotal)}</span>
                        </div>
                    </div>
                ))}

                <Line />

                    <div className="space-y-0.5">
                        <Row l="TOTAL" r={rp(sale.total)} bold />
                        {sale.payment_method === 'tunai' ? (
                            <>
                                <Row l="Bayar" r={rp(sale.paid)} />
                                <Row l="Kembali" r={rp(sale.change_amount)} />
                            </>
                        ) : (
                            <Row l="Status" r="LUNAS" />
                        )}
                    </div>
                    
                <Line />

                <div className="whitespace-pre-line text-center">
                    {store?.footer || 'Terima kasih sudah berbelanja'}
                </div>
            </div>

            {/* Pop-up batalkan transaksi */}
            {showVoid && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
                    <form onSubmit={submitVoid} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                        <div>
                            <h2 className="text-lg font-bold text-red-600">🚫 Batalkan transaksi?</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Transaksi <b>{sale.invoice}</b> ({rp(sale.total)}) akan ditandai batal dan stok semua barangnya
                                dikembalikan. Tindakan ini tidak bisa diurungkan.
                            </p>
                        </div>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-slate-600">Alasan pembatalan</span>
                            <textarea
                                rows={3}
                                autoFocus
                                value={voidForm.data.reason}
                                onChange={(e) => voidForm.setData('reason', e.target.value)}
                                placeholder="mis. Salah input jumlah, pelanggan batal beli"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            />
                            {voidForm.errors.reason && (
                                <span className="mt-1 block text-xs text-red-600">{voidForm.errors.reason}</span>
                            )}
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowVoid(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Kembali
                            </button>
                            <button
                                disabled={voidForm.processing}
                                className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {voidForm.processing ? 'Memproses...' : 'Ya, batalkan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}