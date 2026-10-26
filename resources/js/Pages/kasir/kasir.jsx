import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { useCart } from '../../Components/Kasir/useCart';
import ProductGrid from '../../Components/Kasir/ProductGrid';
import CartList from '../../Components/Kasir/CartList';
import PaymentPanel from '../../Components/Kasir/PaymentPanel';
import SuccessModal from '../../Components/Kasir/SuccessModal';

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

    // Offline: kasir memilih cara bayar. Tokopedia/Shopee: selalu via marketplace.
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

    // Scanner mengetik kode lalu menekan Enter: produk yang cocok langsung masuk keranjang
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
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Kasir" />

            <div>
                <h1 className="text-2xl font-bold">Kasir</h1>
                <p className="text-sm text-slate-500">Pilih produk, atur jumlah, lalu terima pembayaran.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <ProductGrid
                    products={filtered}
                    cart={cart}
                    search={search}
                    onSearch={setSearch}
                    onScan={handleScan}
                    scanMsg={scanMsg}
                    onAdd={add}
                />

                <section className="self-start rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <CartList
                        cart={cart}
                        setQty={setQty}
                        onClear={clear}
                        isDec={isDec}
                        stepOf={stepOf}
                        lineTotal={lineTotal}
                    />
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
                </section>
            </div>

            <SuccessModal done={done} onClose={() => setDone(null)} />
        </div>
    );
}

Kasir.layout = (page) => <KasirLayout>{page}</KasirLayout>;