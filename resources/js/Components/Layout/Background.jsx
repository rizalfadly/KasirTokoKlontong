export default function Background() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
            {/* Lingkaran 1: Indigo */}
            <div className="absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-indigo-400/25 blur-3xl animate-blob1" />
            
            {/* Lingkaran 2: Sky Blue */}
            <div className="absolute -right-24 top-1/3 h-[32rem] w-[32rem] rounded-full bg-sky-400/20 blur-3xl animate-blob2" />
            
            {/* Lingkaran 3: Amber / Orange */}
            <div className="absolute -bottom-40 -left-20 h-[34rem] w-[34rem] rounded-full bg-amber-400/25 blur-3xl animate-blob3" />

            {/* Aksen Emerald */}
            <div className="absolute -bottom-32 right-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-400/15 blur-3xl animate-blob1" />
        </div>
    );
}