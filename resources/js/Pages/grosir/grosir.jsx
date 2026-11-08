import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { useCart } from '../../Components/Kasir/useCart';
import ProductGrid from '../../Components/Kasir/ProductGrid';
import CartList from '../../Components/Kasir/CartList';
import PaymentPanel from '../../Components/Kasir/PaymentPanel';
import SuccessModal from '../../Components/Kasir/SuccessModal';

const box = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

export default function Grosir({ products, customers, quotas = {},orders = {}, decimalUnits = ['kilo', 'liter'] }) {
    const { cart, total, add, setQty, clear, isDec, stepOf, lineTotal, unitPrice } = useCart(decimalUnits, true);

    const [search, setSearch] = useState('');
    const [scanMsg, setScanMsg] = useState(null);
    const [paid, setPaid] = useState('');
    const [method, setMethod] = useState('transfer');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(null);
    const [customerId, setCustomerId] = useState('');
    const [newC, setNewC] = useState(null);

    const needsCash = method === 'tunai';
    const q = search.trim().toLowerCase();
    const filtered = products.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q) || (p.barcode ?? '').toLowerCase().includes(q),
    );

    const paidNum = needsCash ? Number(paid || 0) : total;
    const change = paidNum - total;
    const canPay = cart.length > 0 && customerId !== '' && paidNum >= total && !processing;

    function pick(id) {
        setCustomerId(String(id));
        router.get('/grosir', id ? { customer: id } : {}, {
            only: ['quotas', 'orders'], preserveState: true, preserveScroll: true, replace: true,
        });
    }

    function saveCustomer(e) {
        e.preventDefault();
        router.post('/pelanggan', newC, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const c = page.props.customers.find((x) => x.name === newC.name && (x.phone ?? '') === (newC.phone ?? ''));
                if (c) pick(c.id);
                setNewC(null);
            },
            onError: (er) => setErrors(er),
        });
    }

    function handleScan(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const code = search.trim().toLowerCase();
        if (!code) return;
        const hit = products.find((p) => (p.barcode ?? '').toLowerCase() === code || (p.sku ?? '').toLowerCase() === code);
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
        const snapshot = { total, paid: paidNum, change, count: cart.length, channel: 'grosir', method, needsCash };
        router.post(
            '/grosir',
            {
                items: cart.map((i) => ({ product_id: i.id, qty: i.qty })),
                customer_id: customerId,
                payment_method: method,
                paid: needsCash ? paidNum : null,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    clear();
                    setPaid('');
                    setMethod('transfer');
                    setErrors({});
                    setDone(snapshot);
                    pick('');
                },
                onError: (e) => setErrors(e),
            },
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Penjualan Grosir" />

            <div>
                <h1 className="text-2xl font-bold">Penjualan Grosir</h1>
                <p className="text-sm text-slate-500">Harga grosir otomatis berlaku mulai batas jumlah tiap produk.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <ProductGrid products={filtered} cart={cart} search={search} onSearch={setSearch}
                    onScan={handleScan} scanMsg={scanMsg} onAdd={add} />

                <section className="self-start rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Pelanggan *</span>
                            <button type="button" onClick={() => setNewC({ name: '', phone: '' })}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline">
                                <UserPlus className="h-3.5 w-3.5" /> Pelanggan baru
                            </button>
                        </div>
                        <select className={box} value={customerId} onChange={(e) => pick(e.target.value)}>
                            <option value="">Pilih pelanggan...</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="text-xs text-red-600">{errors.customer_id}</p>}

                        {newC && (
                            <form onSubmit={saveCustomer} className="space-y-2 rounded-xl bg-slate-50 p-3">
                                <input className={box} placeholder="Nama pelanggan" autoFocus value={newC.name}
                                    onChange={(e) => setNewC({ ...newC, name: e.target.value })} />
                                <input className={box} placeholder="No. HP (opsional)" value={newC.phone}
                                    onChange={(e) => setNewC({ ...newC, phone: e.target.value })} />
                                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setNewC(null)}
                                        className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600">Batal</button>
                                    <button className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white">Simpan</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <CartList cart={cart} setQty={setQty} onClear={clear} isDec={isDec} stepOf={stepOf}
                        lineTotal={lineTotal} unitPrice={unitPrice} quotas={quotas} orders={orders} grosir />
                    <PaymentPanel
                        grosir
                        total={total} count={cart.length}
                        channel="grosir" setChannel={() => {}}
                        method={method} setMethod={setMethod}
                        effectiveMethod={method} needsCash={needsCash}
                        paid={paid} setPaid={setPaid} change={change}
                        errors={errors} processing={processing} canPay={canPay} onCheckout={checkout}
                    />
                </section>
            </div>

            <SuccessModal done={done} onClose={() => setDone(null)} />
        </div>
    );
}

Grosir.layout = (page) => <KasirLayout>{page}</KasirLayout>;