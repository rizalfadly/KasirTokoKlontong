import { Link } from '@inertiajs/react';

function Step({ url, children }) {
    const base = 'rounded-lg border px-3 py-1.5 text-sm font-medium transition ';

    return url ? (
        <Link href={url} preserveState className={base + 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}>
            {children}
        </Link>
    ) : (
        <span className={base + 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'}>{children}</span>
    );
}

// paginator: objek halaman dari Laravel (->paginate())
export default function Pager({ paginator, noun = 'data' }) {
    if (!paginator || paginator.total === 0) return null;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 print:hidden">
            <span>
                Menampilkan {paginator.from}–{paginator.to} dari {paginator.total} {noun}
            </span>

            {paginator.last_page > 1 && (
                <div className="flex items-center gap-2">
                    <Step url={paginator.prev_page_url}>← Lebih baru</Step>
                    <span className="px-1">
                        Hal. {paginator.current_page} / {paginator.last_page}
                    </span>
                    <Step url={paginator.next_page_url}>Lebih lama →</Step>
                </div>
            )}
        </div>
    );
}