import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { convert, shift, todayValue } from '../../lib/period';

const MODES = [
    { key: 'terbaru', label: 'Terbaru' },
    { key: 'harian', label: 'Harian' },
    { key: 'bulanan', label: 'Bulanan' },
    { key: 'tahunan', label: 'Tahunan' },
];

const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

// path: alamat halaman, period: {mode, value, label} dari server,
// extra: isian filter lain yang harus ikut terkirim (mis. kata pencarian)
export default function PeriodFilter({ path, period, extra = {} }) {
    const { mode, value } = period;

    function go(nextMode, nextValue) {
        router.get(
            path,
            { ...extra, mode: nextMode, value: nextValue },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    function pick(nextMode) {
        if (nextMode === 'terbaru') return go('terbaru', '');

        go(nextMode, value ? convert(nextMode, value) : todayValue(nextMode));
    }

    const tab = (active) =>
        'rounded-lg px-3.5 py-2 text-sm font-medium transition ' +
        (active ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800');

    const arrow = 'rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50';

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
                {MODES.map((m) => (
                    <button key={m.key} type="button" onClick={() => pick(m.key)} className={tab(mode === m.key)}>
                        {m.label}
                    </button>
                ))}
            </div>

            {mode !== 'terbaru' && (
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => go(mode, shift(mode, value, -1))} className={arrow} aria-label="Sebelumnya">
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {mode === 'harian' && (
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => e.target.value && go(mode, e.target.value)}
                            className={inputCls}
                        />
                    )}
                    {mode === 'bulanan' && (
                        <input
                            type="month"
                            value={value}
                            onChange={(e) => e.target.value && go(mode, e.target.value)}
                            className={inputCls}
                        />
                    )}
                    {mode === 'tahunan' && (
                        <span className="min-w-24 rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold">
                            {value}
                        </span>
                    )}

                    <button type="button" onClick={() => go(mode, shift(mode, value, 1))} className={arrow} aria-label="Berikutnya">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}