export default function Background() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
            <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl" />
            <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-300/40 blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-200/50 blur-3xl" />
        </div>
    );
}