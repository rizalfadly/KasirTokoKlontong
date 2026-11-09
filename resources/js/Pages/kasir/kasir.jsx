import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { useCart } from '../../Components/Kasir/useCart';
import ProductGrid from '../../Components/Kasir/ProductGrid';
import CartList from '../../Components/Kasir/CartList';
import PaymentPanel from '../../Components/Kasir/PaymentPanel';
import SuccessModal from '../../Components/Kasir/SuccessModal';
import { ShoppingCart, Sparkles, Store } from "lucide-react";

export default function Kasir({ products, decimalUnits = ['kilo', 'liter'] }) {
    const { cart, total, add, setQty, clear, isDec, stepOf, lineTotal } = useCart(decimalUnits);

    const [search, setSearch] = useState('');
    const [scanMsg, setScanMsg] = useState(null);
    const [paid, setPaid] = useState('');
    const [channel, setChannel] = useState('offline');
    const [method, setMethod] = useState('tunai');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(null);

    const effectiveMethod = channel === 'offline' ? method : 'marketplace';
    const needsCash = effectiveMethod === 'tunai';

    const q = search.trim().toLowerCase();
    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.sku ?? '').toLowerCase().includes(q) ||
            (p.barcode ?? '').toLowerCase().includes(q),
    );

    const paidNum = needsCash ? Number(paid || 0) : total;
    const change = paidNum - total;
    const canPay = cart.length > 0 && paidNum >= total && !processing;

    function handleScan(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const code = search.trim().toLowerCase();
        if (!code) return;

        const hit = products.find(
            (p) => (p.barcode ?? '').toLowerCase() === code || (p.sku ?? '').toLowerCase() === code,
        );

        if (hit) {
            add(hit);
            setScanMsg({ ok: true, text: `Ditambahkan: ${hit.name}` });
            setSearch('');
        } else if (filtered.length === 0) {
            setScanMsg({ ok: false, text: `Kode "${search.trim()}" tidak ditemukan atau stok habis.` });
            setSearch('');
        }

        setTimeout(() => setScanMsg(null), 3000);
    }

    function checkout() {
        const snapshot = {
            total,
            paid: paidNum,
            change,
            count: cart.length,
            channel,
            method: effectiveMethod,
            needsCash,
        };
        router.post(
            '/kasir',
            {
                items: cart.map((i) => ({ product_id: i.id, qty: i.qty })),
                channel,
                payment_method: channel === 'offline' ? method : null,
                paid: needsCash ? paidNum : null,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    clear();
                    setPaid('');
                    setChannel('offline');
                    setMethod('tunai');
                    setErrors({});
                    setDone(snapshot);
                },
                onError: (e) => setErrors(e),
            },
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 md:px-8">
            <Head title="Kasir Toko - POS" />

            {/* Header Banner Kasir Full Color */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/20 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Sparkles className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Store className="h-3.5 w-3.5 text-amber-300 animate-bounce" />
                            <span>Mode Terminal Kasir Aktif</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Kasir & Penjualan Cepat 🛒
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Scan barcode produk atau pilih langsung dari daftar untuk memproses transaksi.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/15 shadow-inner">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-900 font-bold shadow">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">Keranjang Aktif</div>
                            <div className="text-sm md:text-base font-extrabold text-white">{cart.length} Jenis Produk</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Utama POS: Responsif untuk HP, iPad, & Desktop */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
                
                {/* Bagian Produk & Pencarian */}
                <div className="order-2 lg:order-1 lg:col-span-2">
                    <div className="rounded-2xl md:rounded-3xl border border-slate-100 bg-white/90 p-4 md:p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                        <ProductGrid
                            products={filtered}
                            cart={cart}
                            search={search}
                            onSearch={setSearch}
                            onScan={handleScan}
                            scanMsg={scanMsg}
                            onAdd={add}
                        />
                    </div>
                </div>

                {/* Bagian Keranjang & Panel Pembayaran */}
                <section className="order-1 lg:order-2 self-start rounded-2xl md:rounded-3xl border border-slate-100 bg-white/90 p-4 md:p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl lg:sticky lg:top-6 space-y-4 md:space-y-6">
                    <CartList
                        cart={cart}
                        setQty={setQty}
                        onClear={clear}
                        isDec={isDec}
                        stepOf={stepOf}
                        lineTotal={lineTotal}
                    />
                    <div className="border-t border-slate-100 pt-4 md:pt-5">
                        <PaymentPanel
                            total={total}
                            count={cart.length}
                            channel={channel}
                            setChannel={setChannel}
                            method={method}
                            setMethod={setMethod}
                            effectiveMethod={effectiveMethod}
                            needsCash={needsCash}
                            paid={paid}
                            setPaid={setPaid}
                            change={change}
                            errors={errors}
                            processing={processing}
                            canPay={canPay}
                            onCheckout={checkout}
                        />
                    </div>
                </section>
            </div>

            <SuccessModal done={done} onClose={() => setDone(null)} />
        </div>
    );
}

Kasir.layout = (page) => <KasirLayout>{page}</KasirLayout>;