import { CheckCircle2, Printer, PlusCircle, ArrowRight } from 'lucide-react';
import { rp, num } from '../../lib/format';

export default function SuccessModal({ done, onClose }) {
    if (!done) return null;

    const { total, paid, change, count, channel, method, needsCash } = done;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                
                {/* Header Sukses dengan Gradien Supreme */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-6 text-center text-white">
                    <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xl shadow-emerald-900/20 mb-3 animate-bounce">
                            <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Transaksi Selesai!</h2>
                        <p className="mt-1 text-xs font-bold text-emerald-100 uppercase tracking-wider">
                            Pembayaran Berhasil Diproses · {channel === 'grosir' ? 'Grosir / Agen' : 'Toko Offline'}
                        </p>
                    </div>
                </div>

                {/* Konten Rincian Transaksi */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm font-bold">
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Total Belanja</span>
                            <span className="text-base font-black text-slate-800">{rp(total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Jumlah Item</span>
                            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                {num(count)} Jenis Produk
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="text-xs uppercase tracking-wider text-slate-400">Metode Bayar</span>
                            <span className="capitalize text-xs font-extrabold text-slate-700 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                {method}
                            </span>
                        </div>

                        {needsCash && (
                            <>
                                <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-2.5">
                                    <span className="text-xs uppercase tracking-wider text-slate-400">Nominal Tunai</span>
                                    <span className="text-sm font-black text-slate-700">{rp(paid)}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-emerald-100">
                                    <span className="text-xs font-black uppercase tracking-wider">Uang Kembalian</span>
                                    <span className="text-lg font-black">{rp(change)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tombol Aksi Cepat */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:bg-indigo-700"
                        >
                            <Printer className="h-4 w-4 text-amber-300" /> Cetak Nota / Struk Transaksi
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <PlusCircle className="h-4 w-4 text-indigo-600" /> Mulai Transaksi Baru Lainnya
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}