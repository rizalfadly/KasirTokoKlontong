import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { num } from '../../lib/format';
import ProductThumb from '../../Components/ProductThumb';

const rp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const round3 = (n) => Math.round(n * 1000) / 1000;

// Asal penjualan (channel) dan cara bayar (khusus offline)
const CHANNELS = [
    { key: 'offline', label: '🏪 Offline' },
    { key: 'tokopedia', label: '🟢 Tokopedia' },
    { key: 'shopee', label: '🟠 Shopee' },
];
const METHODS = [
    { key: 'tunai', label: '💵 Tunai' },
    { key: 'qris', label: '📱 QRIS' },
    { key: 'transfer', label: '🏦 Transfer' },
];
const PAY_LABEL = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', marketplace: 'Via marketplace' };

export default function Kasir({ products, decimalUnits = ['kilo', 'liter'] }) {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [paid, setPaid] = useState('');
    const [channel, setChannel] = useState('offline');
    const [method, setMethod] = useState('tunai');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(null);
    const [tick, setTick] = useState(0); // memaksa kolom jumlah menyegarkan tampilannya
    const [scanMsg, setScanMsg] = useState(null);

    const isDec = (unit) => decimalUnits.includes(unit);
    const stepOf = (unit) => (isDec(unit) ? 0.5 : 1);
    const lineTotal = (i) => Math.round(i.price * i.qty);

    // Offline: kasir memilih cara bayar. Tokopedia/Shopee: selalu via marketplace.
    const effectiveMethod = channel === 'offline' ? method : 'marketplace';
    const needsCash = effectiveMethod === 'tunai';

    //const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    const q = search.trim().toLowerCase();
        const filtered = products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.sku ?? '').toLowerCase().includes(q) ||
                (p.barcode ?? '').toLowerCase().includes(q),
    );

    const total = useMemo(() => cart.reduce((sum, i) => sum + lineTotal(i), 0), [cart]);
    const paidNum = needsCash ? Number(paid || 0) : total;
    const change = paidNum - total;
    const canPay = cart.length > 0 && paidNum >= total && !processing;

    function add(p) {
        setCart((prev) => {
            const found = prev.find((i) => i.id === p.id);
            if (found) {
                const next = round3(Math.min(found.qty + stepOf(p.unit), p.stock));
                if (next === found.qty) return prev;
                return prev.map((i) => (i.id === p.id ? { ...i, qty: next } : i));
            }
            return [...prev, { ...p, qty: Math.min(1, p.stock) }];
        });
    }

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

    function setQty(id, value) {
        const n = parseFloat(String(value).replace(',', '.'));
        if (!Number.isFinite(n)) return;

        setCart((prev) =>
            n <= 0
                ? prev.filter((i) => i.id !== id)
                : prev.map((i) => {
                      if (i.id !== id) return i;
                      const dec = isDec(i.unit);
                      const clean = dec ? round3(n) : Math.floor(n);
                      const min = dec ? 0.001 : 1;
                      return { ...i, qty: Math.max(Math.min(clean, i.stock), min) };
                  }),
        );
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
                    setCart([]);
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

    const quick = [
        { label: 'Uang pas', value: total },
        { label: '20.000', value: 20000 },
        { label: '50.000', value: 50000 },
        { label: '100.000', value: 100000 },
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Kasir" />

            <div>
                <h1 className="text-2xl font-bold">Kasir</h1>
                <p className="text-sm text-slate-500">Pilih produk, atur jumlah, lalu terima pembayaran.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Daftar produk */}
                <section className="space-y-4 lg:col-span-2">
                    <div className="relative">
                        {scanMsg && (
                            <div
                                className={
                                    'mt-2 rounded-xl px-4 py-2 text-sm font-medium ' +
                                    (scanMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')
                                }
                            >
                                {scanMsg.text}
                            </div>
                        )}
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            placeholder="Scan barcode atau cari produk..."
                            onKeyDown={handleScan}
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
                            <div className="text-4xl">🥚</div>
                            <p className="mt-2 text-sm">Produk tidak ditemukan atau stok habis.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {filtered.map((p) => {
                            const inCart = cart.find((i) => i.id === p.id)?.qty ?? 0;
                            const full = inCart >= p.stock;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => add(p)}
                                    disabled={full}
                                    className={
                                        'relative rounded-2xl border bg-white p-4 text-left shadow-sm transition ' +
                                        (full
                                            ? 'cursor-not-allowed border-slate-100 opacity-50'
                                            : 'border-slate-100 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md active:scale-95')
                                    }
                                >
                                    {inCart > 0 && (
                                        <span className="absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-bold text-white">
                                            {num(inCart)}
                                        </span>
                                    )}
                                    <ProductThumb product={p} />
                                    <div className="mt-3 line-clamp-2 font-semibold leading-snug">{p.name}</div>
                                    <div className="mt-1 font-bold text-orange-600">
                                        {rp(p.price)}
                                        <span className="text-xs font-normal text-slate-400"> / {p.unit}</span>
                                    </div>
                                    <div
                                        className={
                                            'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            (p.stock <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700')
                                        }
                                    >
                                        Stok {num(p.stock)} {p.unit}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Keranjang */}
                <section className="self-start rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">🛒 Keranjang</h2>
                        {cart.length > 0 && (
                            <button onClick={() => setCart([])} className="text-sm text-red-500 hover:underline">
                                Kosongkan
                            </button>
                        )}
                    </div>

                    {cart.length === 0 ? (
                        <div className="py-10 text-center text-slate-400">
                            <div className="text-4xl">🧺</div>
                            <p className="mt-2 text-sm">Belum ada item. Klik produk untuk menambah.</p>
                        </div>
                    ) : (
                        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
                            {cart.map((i) => (
                                <li key={i.id} className="rounded-xl bg-slate-50 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">{i.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {rp(i.price)} / {i.unit}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">{rp(lineTotal(i))}</div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-1.5">
                                        <button
                                            onClick={() => setQty(i.id, round3(i.qty - stepOf(i.unit)))}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold hover:bg-slate-100"
                                        >
                                            -
                                        </button>
                                        <input
                                            key={`${i.id}-${i.qty}-${tick}`}
                                            type="number"
                                            min="0"
                                            step={isDec(i.unit) ? '0.001' : '1'}
                                            defaultValue={i.qty}
                                            onBlur={(e) => {
                                                setQty(i.id, e.target.value);
                                                setTick((t) => t + 1);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            className="w-20 rounded-lg border border-slate-200 bg-white py-1 text-center text-sm font-semibold outline-none focus:border-orange-400"
                                        />
                                        <button
                                            onClick={() => setQty(i.id, round3(i.qty + stepOf(i.unit)))}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold hover:bg-slate-100"
                                        >
                                            +
                                        </button>
                                        <span className="text-xs text-slate-500">{i.unit}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-4 space-y-3 border-t border-dashed border-slate-200 pt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Total ({cart.length} jenis)</span>
                            <span className="text-2xl font-bold">{rp(total)}</span>
                        </div>

                        {/* Asal penjualan */}
                        <div>
                            <div className="mb-1.5 text-xs font-medium text-slate-500">Asal penjualan</div>
                            <div className="flex flex-wrap gap-2">
                                {CHANNELS.map((c) => (
                                    <button
                                        key={c.key}
                                        type="button"
                                        onClick={() => setChannel(c.key)}
                                        className={
                                            'rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                                            (channel === c.key
                                                ? 'bg-orange-500 text-white shadow'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                                        }
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cara bayar (hanya offline) */}
                        {channel === 'offline' && (
                            <div>
                                <div className="mb-1.5 text-xs font-medium text-slate-500">Cara bayar</div>
                                <div className="flex flex-wrap gap-2">
                                    {METHODS.map((m) => (
                                        <button
                                            key={m.key}
                                            type="button"
                                            onClick={() => setMethod(m.key)}
                                            className={
                                                'rounded-lg px-3 py-1.5 text-xs font-semibold transition ' +
                                                (method === m.key
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200')
                                            }
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {needsCash ? (
                            <>
                                <input
                                    type="number"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                    placeholder="Uang dibayar"
                                    value={paid}
                                    onChange={(e) => setPaid(e.target.value)}
                                />

                                {cart.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {quick.map((q) => (
                                            <button
                                                key={q.label}
                                                onClick={() => setPaid(String(q.value))}
                                                className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div
                                    className={
                                        'flex items-center justify-between rounded-xl px-4 py-3 ' +
                                        (paid && change < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')
                                    }
                                >
                                    <span className="text-sm font-medium">{paid && change < 0 ? 'Kurang' : 'Kembalian'}</span>
                                    <span className="text-lg font-bold">{paid ? rp(Math.abs(change)) : '-'}</span>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                                Pembayaran <b>{PAY_LABEL[effectiveMethod]}</b> sebesar <b>{rp(total)}</b>. Tidak ada kembalian.
                            </div>
                        )}

                        {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
                        {errors.paid && <p className="text-sm text-red-600">{errors.paid}</p>}
                        {errors.channel && <p className="text-sm text-red-600">{errors.channel}</p>}
                        {errors.payment_method && <p className="text-sm text-red-600">{errors.payment_method}</p>}

                        <button
                            onClick={checkout}
                            disabled={!canPay}
                            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        >
                            {processing ? 'Memproses...' : '✅ Bayar'}
                        </button>
                    </div>
                </section>
            </div>

            {/* Pop-up sukses */}
            {done && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                            ✅
                        </div>
                        <h2 className="mt-4 text-xl font-bold">Transaksi berhasil!</h2>
                        <div className="mt-5 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total ({done.count} jenis)</span>
                                <span className="font-semibold">{rp(done.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Asal</span>
                                <span className="font-semibold">
                                    {CHANNELS.find((c) => c.key === done.channel)?.label.replace(/^\S+\s/, '')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">{done.needsCash ? 'Dibayar' : 'Bayar via'}</span>
                                <span className="font-semibold">
                                    {done.needsCash ? rp(done.paid) : PAY_LABEL[done.method]}
                                </span>
                            </div>
                        </div>
                        {done.needsCash && (
                            <div className="mt-4 rounded-2xl bg-emerald-50 py-4">
                                <div className="text-xs text-emerald-700">Kembalian</div>
                                <div className="text-3xl font-bold text-emerald-700">{rp(done.change)}</div>
                            </div>
                        )}
                        <a
                            href="/riwayat/terakhir"
                            target="_blank"
                            rel="noopener"
                            className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-center font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                        >
                            🖨️ Cetak Nota
                        </a>
                        <button
                            onClick={() => setDone(null)}
                            className="mt-3 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-700"
                        >
                            Transaksi Baru
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

Kasir.layout = (page) => <KasirLayout>{page}</KasirLayout>;
