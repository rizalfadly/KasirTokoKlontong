import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const DialogContext = createContext(null);

const TONES = {
    info: { icon: Info, box: 'bg-sky-100 text-sky-600', btn: 'bg-sky-600 hover:bg-sky-700' },
    warning: { icon: AlertTriangle, box: 'bg-amber-100 text-amber-600', btn: 'bg-orange-500 hover:bg-orange-600' },
    danger: { icon: XCircle, box: 'bg-red-100 text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    success: { icon: CheckCircle2, box: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
};

export function DialogProvider({ children }) {
    const [dlg, setDlg] = useState(null);
    const resolver = useRef(null);

    const open = useCallback(
        (opts) =>
            new Promise((resolve) => {
                resolver.current = resolve;
                setDlg(opts);
            }),
        [],
    );

    const close = (result) => {
        resolver.current?.(result);
        resolver.current = null;
        setDlg(null);
    };

    const api = {
        // await dialog.alert('Pesan', { title, tone })
        alert: (message, o = {}) =>
            open({ kind: 'alert', message, title: o.title ?? 'Pemberitahuan', tone: o.tone ?? 'info', okText: o.okText ?? 'OK' }),
        // if (await dialog.confirm('Hapus produk?', { tone: 'danger' })) { ... }
        confirm: (message, o = {}) =>
            open({
                kind: 'confirm',
                message,
                title: o.title ?? 'Konfirmasi',
                tone: o.tone ?? 'warning',
                okText: o.okText ?? 'Ya, lanjut',
                cancelText: o.cancelText ?? 'Batal',
            }),
    };

    useEffect(() => {
        if (!dlg) return;
        const onKey = (e) => {
            if (e.key === 'Escape') close(dlg.kind === 'confirm' ? false : true);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [dlg]);

    const tone = dlg ? TONES[dlg.tone] ?? TONES.info : null;

    return (
        <DialogContext.Provider value={api}>
            {children}

            {dlg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 print:hidden">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-full ' + tone.box}>
                                <tone.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold">{dlg.title}</h2>
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{dlg.message}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            {dlg.kind === 'confirm' && (
                                <button
                                    onClick={() => close(false)}
                                    className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    {dlg.cancelText}
                                </button>
                            )}
                            <button
                                autoFocus
                                onClick={() => close(true)}
                                className={'flex-1 rounded-xl py-2.5 font-semibold text-white ' + tone.btn}
                            >
                                {dlg.okText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}

export const useDialog = () => useContext(DialogContext);