import { usePage } from '@inertiajs/react';

export default function Brand() {
    const { store } = usePage().props;
    const name = store?.name || 'Brian Jaya Telur';
    const logo = store?.logo_url || '/images/logotoko.png';

    return (
        <div className="group flex items-center gap-3.5 transition-transform duration-300 hover:scale-[1.02]">
            {/* Logo dengan Frame Bergradien & Shadow Mewah */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-orange-400 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white p-1">
                    <img
                        src={logo}
                        alt={name}
                        className="h-full w-full object-contain rounded-xl"
                    />
                </div>
            </div>

            {/* Nama Toko / Brand dengan Gradien Teks Elegan */}
            <div className="min-w-0">
                <div className="truncate text-base md:text-lg font-black tracking-tight text-slate-800 bg-gradient-to-r from-indigo-900 to-slate-700 bg-clip-text text-transparent">
                    {name}
                </div>
                <div className="text-[11px] font-bold text-indigo-600 tracking-wide uppercase">
                </div>
            </div>
        </div>
    );
}