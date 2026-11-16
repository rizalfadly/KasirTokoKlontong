import { useEffect, useRef } from 'react';
import { CheckCircle2, Printer, PlusCircle } from 'lucide-react';
import { rp, num } from '../../lib/format';

// ====== Format struk: disamakan dengan resources/js/Pages/riwayat/nota.jsx ======
const PAPERS = {
    58: { width: '58mm', page: '58mm auto' },
    80: { width: '80mm', page: '80mm auto' },
    a4: { width: '100%', page: 'A4' },
};
const CHANNEL_LABEL = { offline: 'Offline', tokopedia: 'Tokopedia', shopee: 'Shopee', grosir: 'Grosir' };
const PAY_LABEL = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', marketplace: 'Via Marketplace' };

const rpNota = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
    new Date(d).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const esc = (v) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

// Ukuran kertas mengikuti pilihan di halaman nota riwayat (disimpan di localStorage yang sama)
function getPaper() {
    try {
        const saved = localStorage.getItem('nota_paper');
        return PAPERS[saved] ? saved : '58';
    } catch {
        return '58';
    }
}

// Ambil data transaksi terakhir kasir (JSON kecil, tanpa memuat halaman React)
async function fetchLastSale() {
    const res = await fetch('/riwayat/terakhir', {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
    });
    if (!res.ok) throw new Error('Gagal mengambil data nota');
    return res.json();
}

function buildReceiptHtml({ sale, store }) {
    const paperKey = getPaper();
    const p = PAPERS[paperKey];
    const row = (l, r, bold = false) =>
        `<div class="row${bold ? ' bold' : ''}"><span class="l">${esc(l)}</span><span class="r">${esc(r)}</span></div>`;

    const items = (sale.items ?? [])
        .map(
            (it) => `
            <div class="item">
                <div class="name">${esc(it.product?.name ?? 'Produk Dihapus')}</div>
                <div class="row">
                    <span>${esc(num(it.qty))} ${esc(it.product?.unit ?? '')} × ${esc(rpNota(it.price))}</span>
                    <span class="bold">${esc(rpNota(it.subtotal))}</span>
                </div>
            </div>`,
        )
        .join('');

    const pay =
        sale.payment_method === 'tunai'
            ? row('Tunai', rpNota(sale.paid)) + row('Kembali', rpNota(sale.change_amount))
            : row('Status', 'LUNAS');

    const footer = store?.footer || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Nota ${esc(sale.invoice)}</title>
<style>
    @page { size: ${p.page}; margin: 2mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body {
        width: 100%;
        font-family: ui-monospace, 'Courier New', monospace;
        font-size: 10px;
        line-height: 1.25;
        color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: 800; }
    .store-name { font-weight: 900; text-transform: uppercase; letter-spacing: .05em; font-size: 12px; }
    .sans { font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
    .slogan { font-style: italic; font-weight: 700; }
    .pre { white-space: pre-line; }
    .line { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; gap: 4px; }
    .row .l { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 4px; }
    .row .r { flex-shrink: 0; text-align: right; }
    .item { margin-bottom: 6px; }
    .name { font-weight: 700; word-break: break-word; }
    .total { font-weight: 900; font-size: 12px; }
</style>
</head>
<body>
    <div class="center">
        <div class="store-name">${esc(store?.name || 'Kasir Toko')}</div>
        ${store?.address ? `<div class="sans pre">${esc(store.address)}</div>` : ''}
        ${store?.phone ? `<div class="sans">Telp/WA: ${esc(store.phone)}</div>` : ''}
        ${store?.slogan ? `<div class="sans slogan">${esc(store.slogan)}</div>` : ''}
    </div>
    <hr class="line" />
    ${row('No', sale.invoice)}
    ${row('Tgl', fmtDate(sale.created_at))}
    ${row('Kasir', sale.user?.username ?? '-')}
    ${row('Channel', CHANNEL_LABEL[sale.channel] ?? sale.channel ?? '-')}
    ${row('Bayar', PAY_LABEL[sale.payment_method] ?? sale.payment_method ?? '-')}
    <hr class="line" />
    ${items}
    <hr class="line" />
    <div class="row total"><span>TOTAL</span><span>${esc(rpNota(sale.total))}</span></div>
    ${pay}
    <hr class="line" />
    <div class="center sans pre">${esc(footer)}</div>
</body>
</html>`;
}

// Cetak hanya struk lewat iframe tersembunyi (tanpa memuat aplikasi lagi, jadi cepat)
function printReceipt(data) {
    const old = document.getElementById('print-frame-nota');
    if (old) old.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-frame-nota';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    const cleanup = () => iframe.remove();

    iframe.onload = () => {
        const win = iframe.contentWindow;
        if (!win) return cleanup();
        win.onafterprint = cleanup;
        win.focus();
        win.print();
        setTimeout(cleanup, 120000); // jaga-jaga kalau afterprint tidak terpanggil
    };

    iframe.srcdoc = buildReceiptHtml(data);
    document.body.appendChild(iframe);
}

export default function SuccessModal({ done, onClose }) {
    const cache = useRef(null);

    // Ambil data nota di belakang layar begitu modal muncul, supaya klik cetak langsung jalan
    useEffect(() => {
        cache.current = null;
        if (!done) return;

        let alive = true;
        fetchLastSale()
            .then((d) => {
                if (alive) cache.current = d;
            })
            .catch(() => {});

        return () => {
            alive = false;
        };
    }, [done]);

    async function handlePrint() {
        try {
            const data = cache.current ?? (await fetchLastSale());
            printReceipt(data);
            onClose(); // tutup notif sukses, iframe cetak tetap jalan karena ada di document.body
        } catch {
            alert('Nota gagal dimuat. Coba lagi atau cetak dari halaman Riwayat.');
        }
    }

    if (!done) return null;

    const { total, paid, change, count, channel, method, needsCash } = done;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">

                {/* Header Sukses dengan Gradien Supreme */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-6 text-center text-white">
                    <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xl shadow-emerald-900/20 mb-3 animate-bounce">
                            <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Transaksi Selesai!</h2>
                        <p className="mt-1 text-xs font-bold text-emerald-100 uppercase tracking-wider">
                            Pembayaran Berhasil Diproses · {channel === 'grosir' ? 'Grosir / Agen' : 'Toko Offline'}
                        </p>
                    </div>
                </div>

                {/* Konten Rincian Transaksi */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm font-bold">
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Total Belanja</span>
                            <span className="text-base font-black text-slate-800">{rp(total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Jumlah Item</span>
                            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                {num(count)} Jenis Produk
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Metode Bayar</span>
                            <span className="capitalize text-xs font-extrabold text-slate-700 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                {method}
                            </span>
                        </div>

                        {needsCash && (
                            <>
                                <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-2.5">
                                    <span className="text-xs uppercase tracking-wider text-slate-400">Nominal Tunai</span>
                                    <span className="text-sm font-black text-slate-700">{rp(paid)}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-emerald-100">
                                    <span className="text-xs font-black uppercase tracking-wider">Uang Kembalian</span>
                                    <span className="text-lg font-black">{rp(change)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tombol Aksi Cepat */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:bg-indigo-700"
                        >
                            <Printer className="h-4 w-4 text-amber-300" /> Cetak Nota / Struk Transaksi
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <PlusCircle className="h-4 w-4 text-indigo-600" /> Mulai Transaksi Baru Lainnya
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}