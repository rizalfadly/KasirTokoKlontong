import { useMemo, useState } from 'react';
import { round3 } from '../../lib/format';

export function useCart(decimalUnits, grosir = false) {
    const [cart, setCart] = useState([]);

    const isDec = (unit) => decimalUnits.includes(unit);
    const stepOf = (unit) => (isDec(unit) ? 0.5 : 1);
    const STEP = 1000; // harus sama dengan di server
    const roundUp = (n) => Math.ceil(Math.round((n / STEP) * 1e6) / 1e6) * STEP;

    const unitPrice = (i) =>
        grosir && i.wholesale_price != null && i.qty >= Number(i.wholesale_min_qty ?? 10)
            ? i.wholesale_price
            : i.price;
    const lineTotal = (i) =>
    isDec(i.unit) ? roundUp(unitPrice(i) * i.qty) : Math.round(unitPrice(i) * i.qty);

    const total = useMemo(() => cart.reduce((s, i) => s + lineTotal(i), 0), [cart]);

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

    const clear = () => setCart([]);

    return { cart, total, add, setQty, clear, isDec, stepOf, lineTotal, unitPrice };
}