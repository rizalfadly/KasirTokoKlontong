import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
    success: { icon: CheckCircle2, box: 'border-emerald-200 bg-emerald-50 text-emerald-800', ic: 'text-emerald-600', ms: 4000 },
    error: { icon: XCircle, box: 'border-red-200 bg-red-50 text-red-800', ic: 'text-red-600', ms: 6000 },
    warning: { icon: AlertTriangle, box: 'border-amber-200 bg-amber-50 text-amber-800', ic: 'text-amber-600', ms: 5000 },
    info: { icon: Info, box: 'border-sky-200 bg-sky-50 text-sky-800', ic: 'text-sky-600', ms: 4000 },
};

export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const seq = useRef(0);

    const dismiss = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), []);

    const push = useCallback(
        (message, tone = 'info') => {
            if (!message) return;
            const id = ++seq.current;
            setItems((l) => [...l.slice(-3), { id, message, tone }]); // maksimal 4 sekaligus
            setTimeout(() => dismiss(id), (TONES[tone] ?? TONES.info).ms);
        },
        [dismiss],
    );

    const api = {
        success: (m) => push(m, 'success'),
        error: (m) => push(m, 'error'),
        warning: (m) => push(m, 'warning'),
        info: (m) => push(m, 'info'),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}

            <div className="pointer-events-none fixed inset-x-4 top-4 z-[90] flex flex-col items-end gap-2 print:hidden sm:inset-x-auto sm:right-4">
                {items.map((t) => {
                    const tone = TONES[t.tone] ?? TONES.info;
                    return (
                        <div
                            key={t.id}
                            role="status"
                            className={'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5 shadow-lg ' + tone.box}
                        >
                            <tone.icon className={'mt-0.5 h-5 w-5 shrink-0 ' + tone.ic} />
                            <p className="min-w-0 flex-1 text-sm font-medium">{t.message}</p>
                            <button onClick={() => dismiss(t.id)} aria-label="Tutup" className="rounded-md p-0.5 opacity-60 hover:opacity-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

// Membaca pesan flash dari Laravel dan menampilkannya otomatis
export function FlashToasts() {
    const flash = usePage().props.flash;
    const toast = useToast();

    useEffect(() => {
        if (!flash) return;
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.info) toast.info(flash.info);
    }, [flash]);

    return null;
}