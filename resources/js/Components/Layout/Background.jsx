export default function Background() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
            {/* Lingkaran gradien Indigo/Violet di pojok kiri atas */}
            <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-indigo-400/25 blur-3xl animate-pulse" />
            
            {/* Lingkaran gradien Sky/Blue di bagian tengah kanan */}
            <div className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl" />
            
            {/* Lingkaran gradien Orange/Amber di pojok kiri bawah */}
            <div className="absolute -bottom-40 -left-20 h-[30rem] w-[30rem] rounded-full bg-amber-400/25 blur-3xl" />

            {/* Tambahan aksen Emerald lembut di kanan bawah untuk melengkapi palet full color */}
            <div className="absolute -bottom-32 right-1/4 h-[26rem] w-[26rem] rounded-full bg-emerald-400/15 blur-3xl" />
        </div>
    );
}