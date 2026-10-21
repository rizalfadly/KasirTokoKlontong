import { Head, Link, usePage } from '@inertiajs/react';
import KasirLayout from '../Layouts/KasirLayout';

function StopPerson() {
    return (
        <svg viewBox="0 0 320 270" className="mx-auto h-60 w-auto" role="img" aria-label="Orang berkata stop">
            <style>{`
                @keyframes wave {
                    0%, 100% { transform: rotate(-7deg); }
                    50% { transform: rotate(7deg); }
                }
                .wave { transform-origin: 124px 136px; animation: wave 1.2s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) { .wave { animation: none; } }
            `}</style>

            {/* Bayangan di lantai */}
            <ellipse cx="160" cy="258" rx="72" ry="8" fill="#000" opacity="0.08" />

            {/* Kaki */}
            <rect x="136" y="196" width="22" height="54" rx="8" fill="#1e3a8a" />
            <rect x="164" y="196" width="22" height="54" rx="8" fill="#1e3a8a" />
            <ellipse cx="144" cy="252" rx="16" ry="7" fill="#111827" />
            <ellipse cx="178" cy="252" rx="16" ry="7" fill="#111827" />

            {/* Lengan kanan (turun) */}
            <line x1="198" y1="136" x2="212" y2="192" stroke="#f97316" strokeWidth="18" strokeLinecap="round" />
            <circle cx="213" cy="198" r="10" fill="#fcd9b6" stroke="#e8b88a" />

            {/* Badan */}
            <rect x="118" y="116" width="84" height="88" rx="26" fill="#f97316" />
            {/* Apron */}
            <rect x="133" y="144" width="54" height="60" rx="10" fill="#fff7ed" />
            <ellipse cx="160" cy="172" rx="9" ry="11" fill="#fcd34d" />
            <ellipse cx="157" cy="168" rx="2.5" ry="3.5" fill="#fff" opacity="0.7" />

            {/* Kepala */}
            <circle cx="160" cy="84" r="30" fill="#fcd9b6" stroke="#e8b88a" />
            {/* Topi */}
            <path d="M130 82 A30 30 0 0 1 190 82 Z" fill="#ea580c" />
            <rect x="172" y="74" width="30" height="8" rx="4" fill="#c2410c" />
            {/* Alis tegas */}
            <line x1="141" y1="89" x2="154" y2="93" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            <line x1="179" y1="89" x2="166" y2="93" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            {/* Mata */}
            <circle cx="149" cy="99" r="3.2" fill="#1f2937" />
            <circle cx="171" cy="99" r="3.2" fill="#1f2937" />
            {/* Mulut (berseru) */}
            <ellipse cx="160" cy="111" rx="7" ry="5.5" fill="#7c2d12" />

            {/* Lengan kiri (terangkat) + telapak tangan */}
            <g className="wave">
                <line x1="124" y1="136" x2="96" y2="104" stroke="#f97316" strokeWidth="18" strokeLinecap="round" />
                <g stroke="#e8b88a" strokeWidth="1" fill="#fcd9b6">
                    <rect x="76" y="58" width="8" height="32" rx="4" />
                    <rect x="84.5" y="52" width="8" height="38" rx="4" />
                    <rect x="93" y="52" width="8" height="38" rx="4" />
                    <rect x="101.5" y="58" width="8" height="32" rx="4" />
                    <ellipse cx="93" cy="92" rx="18" ry="16" />
                    <ellipse cx="72" cy="94" rx="5.5" ry="11" transform="rotate(-28 72 94)" />
                </g>
            </g>

            {/* Balon ucapan */}
            <polygon points="214,68 206,90 236,68" fill="#fff" stroke="#fb923c" strokeWidth="3" strokeLinejoin="round" />
            <rect x="198" y="12" width="116" height="58" rx="16" fill="#fff" stroke="#fb923c" strokeWidth="3" />
            <polygon points="216,66 208,86 234,66" fill="#fff" />
            <text
                x="256"
                y="50"
                textAnchor="middle"
                fontSize="28"
                fontWeight="800"
                fill="#dc2626"
                fontFamily="system-ui, sans-serif"
            >
                STOP!
            </text>
        </svg>
    );
}

export default function Forbidden() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Head title="403 - Akses Ditolak" />

            <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-xl shadow-orange-100 backdrop-blur-xl">
                <StopPerson />

                <div className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-7xl font-extrabold leading-none text-transparent">
                    403
                </div>
                <h1 className="mt-3 text-2xl font-bold">Akses ditolak</h1>
                <p className="mt-2 text-slate-500">
                    Maaf, kamu tidak punya izin untuk membuka halaman ini.
                    {user ? ' Hubungi owner kalau kamu memerlukan akses.' : ' Silakan masuk terlebih dahulu.'}
                </p>

                {user && (
                    <p className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800">
                        Peranmu saat ini: <span className="capitalize">{user.role}</span>
                    </p>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        ← Kembali
                    </button>
                    <Link
                        href={user ? '/dashboard' : '/login'}
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:brightness-105"
                    >
                        {user ? '🏠 Ke Dashboard' : '🔑 Masuk'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

Forbidden.layout = (page) => <KasirLayout>{page}</KasirLayout>;