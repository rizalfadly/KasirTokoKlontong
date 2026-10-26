import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { num } from '../lib/format';

function PageButton({ url, children }) {
    const base = 'inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition ';
    if (!url) {
        return <span className={base + 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'}>{children}</span>;
    }
    return (
        <Link
            href={url}
            preserveScroll
            preserveState
            className={base + 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}
        >
            {children}
        </Link>
    );
}

export default function Pagination({ paginator, noun = 'data' }) {
    const { from, to, total, current_page, last_page, prev_page_url, next_page_url } = paginator;
    if (!total) return null;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-slate-500">
                Menampilkan {num(from)}-{num(to)} dari {num(total)} {noun}
            </p>
            <div className="flex items-center gap-2">
                <PageButton url={prev_page_url}>
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </PageButton>
                <span className="px-2 text-sm text-slate-500">
                    {current_page} / {last_page}
                </span>
                <PageButton url={next_page_url}>
                    Berikutnya <ChevronRight className="h-4 w-4" />
                </PageButton>
            </div>
        </div>
    );
}