import { CheckCircle2, Printer } from 'lucide-react';
import { rp } from '../../lib/format';
import { CHANNELS, PAY_LABEL } from './constants';

export default function SuccessModal({ done, onClose }) {
    if (!done) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="mt-4 text-xl font-bold">Transaksi berhasil!</h2>

                <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Total ({done.count} jenis)</span>
                        <span className="font-semibold">{rp(done.total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Asal</span>
                        <span className="font-semibold">{CHANNELS.find((c) => c.key === done.channel)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">{done.needsCash ? 'Dibayar' : 'Bayar via'}</span>
                        <span className="font-semibold">{done.needsCash ? rp(done.paid) : PAY_LABEL[done.method]}</span>
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
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                >
                    <Printer className="h-5 w-5" /> Cetak Nota
                </a>
                <button
                    onClick={onClose}
                    className="mt-3 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-700"
                >
                    Transaksi Baru
                </button>
            </div>
        </div>
    );
}