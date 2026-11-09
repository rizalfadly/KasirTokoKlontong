import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ClipboardList, UserPlus, Sparkles, Store, ShoppingCart } from 'lucide-react';
import KasirLayout from '../../Layouts/KasirLayout';
import { useCart } from '../../Components/Kasir/useCart';
import ProductGrid from '../../Components/Kasir/ProductGrid';
import CartList from '../../Components/Kasir/CartList';
import PaymentPanel from '../../Components/Kasir/PaymentPanel';
import SuccessModal from '../../Components/Kasir/SuccessModal';

const box = 'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 placeholder:font-normal';

export default function Grosir({ products, customers, quotas = {}, orders = {}, decimalUnits = ['kilo', 'liter'] }) {
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
            setScanMsg({ ok: true, text: `✓ Berhasil ditambahkan: ${hit.name}` });
            setSearch('');
        } else if (filtered.length === 0) {
            setScanMsg({ ok: false, text: `⚠️ Kode "${search.trim()}" tidak ditemukan atau stok habis.` });
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
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
            <Head title="Penjualan Grosir & Agen" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none">
                    <Store className="h-64 w-64 animate-pulse" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Pusat Distribusi & Grosir Agen</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Penjualan Grosir
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Harga khusus grosir & agen otomatis berlaku berdasarkan jumlah pembelian produk.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/setoran"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:bg-white/25"
                        >
                            <ClipboardList className="h-4 w-4 text-amber-300" /> Setoran Saya
                        </Link>
                        <Link
                            href="/grosir/rekap"
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:scale-105 hover:bg-amber-300"
                        >
                            <ShoppingCart className="h-4 w-4" /> Rekap Grosir
                        </Link>
                    </div>
                </div>
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

                <section className="self-start rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl lg:sticky lg:top-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Pelanggan / Agen *</span>
                            <button
                                type="button"
                                onClick={() => setNewC({ name: '', phone: '' })}
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700"
                            >
                                <UserPlus className="h-3.5 w-3.5" /> Pelanggan Baru
                            </button>
                        </div>
                        <select className={box} value={customerId} onChange={(e) => pick(e.target.value)}>
                            <option value="">-- Pilih Pelanggan / Agen --</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{c.phone ? ` (${c.phone})` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="text-xs font-bold text-rose-600">⚠️ {errors.customer_id}</p>}

                        {newC && (
                            <form onSubmit={saveCustomer} className="space-y-3 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100 animate-in fade-in duration-200">
                                <div className="text-xs font-extrabold text-indigo-900 mb-1">Tambah Pelanggan Baru</div>
                                <input
                                    className={box}
                                    placeholder="Nama lengkap / Nama Agen"
                                    autoFocus
                                    value={newC.name}
                                    onChange={(e) => setNewC({ ...newC, name: e.target.value })}
                                />
                                <input
                                    className={box}
                                    placeholder="No. HP / WhatsApp (opsional)"
                                    value={newC.phone}
                                    onChange={(e) => setNewC({ ...newC, phone: e.target.value })}
                                />
                                {errors.name && <p className="text-xs font-extrabold text-rose-600">⚠️ {errors.name}</p>}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setNewC(null)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <CartList
                        cart={cart}
                        setQty={setQty}
                        onClear={clear}
                        isDec={isDec}
                        stepOf={stepOf}
                        lineTotal={lineTotal}
                        unitPrice={unitPrice}
                        quotas={quotas}
                        orders={orders}
                        grosir
                    />

                    <PaymentPanel
                        grosir
                        total={total}
                        count={cart.length}
                        channel="grosir"
                        setChannel={() => {}}
                        method={method}
                        setMethod={setMethod}
                        effectiveMethod={method}
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

Grosir.layout = (page) => <KasirLayout>{page}</KasirLayout>;