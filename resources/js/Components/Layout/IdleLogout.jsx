import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { LogOut, Clock } from 'lucide-react';

// Sesuaikan kalau route logout di aplikasi Anda berbeda
const LOGOUT_URL = '/logout';

const STORAGE_KEY = 'idle_last_activity';
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

function readShared() {
    try {
        return Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
        return 0;
    }
}

function writeShared(ts) {
    try {
        localStorage.setItem(STORAGE_KEY, String(ts));
    } catch {}
}

/**
 * Logout otomatis kalau tidak ada aktivitas (mouse, keyboard, sentuh, scroll).
 * - minutes     : batas menganggur sebelum keluar
 * - warnSeconds : peringatan muncul sekian detik sebelum keluar
 * Aktivitas di tab lain ikut dihitung (lewat localStorage).
 */
export default function IdleLogout({ minutes = 30, warnSeconds = 60 }) {
    const limitMs = minutes * 60 * 1000;
    const warnMs = warnSeconds * 1000;

    const [secondsLeft, setSecondsLeft] = useState(null);
    const lastRef = useRef(Date.now());
    const warningRef = useRef(false);
    const loggingOut = useRef(false);

    function touch() {
        const now = Date.now();
        lastRef.current = now;
        writeShared(now);
    }

    function stay() {
        warningRef.current = false;
        setSecondsLeft(null);
        touch();
    }

    function logout() {
        if (loggingOut.current) return;
        loggingOut.current = true;
        router.post(LOGOUT_URL, {}, {
            onError: () => {
                window.location.href = '/login';
            },
        });
    }

    useEffect(() => {
        // Mulai dari "baru saja aktif", supaya sisa waktu dari sesi sebelumnya tidak ikut terbawa
        touch();

        let lastWrite = 0;
        const onActivity = () => {
            if (warningRef.current) return; // saat peringatan tampil, harus klik tombol
            const now = Date.now();
            lastRef.current = now;
            if (now - lastWrite > 5000) {
                writeShared(now); // jangan menulis storage di setiap gerakan mouse
                lastWrite = now;
            }
        };

        EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

        const tick = () => {
            const last = Math.max(lastRef.current, readShared());
            const idle = Date.now() - last;
            const remaining = limitMs - idle;

            if (remaining <= 0) {
                logout();
            } else if (remaining <= warnMs) {
                warningRef.current = true;
                setSecondsLeft(Math.ceil(remaining / 1000));
            } else if (warningRef.current) {
                // aktivitas terdeteksi dari tab lain
                warningRef.current = false;
                setSecondsLeft(null);
            }
        };

        const id = setInterval(tick, 1000);
        document.addEventListener('visibilitychange', tick);

        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', tick);
            EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limitMs, warnMs]);

    if (secondsLeft === null) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 print:hidden">
            <div className="w-full max-w-sm space-y-5 rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">Masih di sana?</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Tidak ada aktivitas beberapa saat. Demi keamanan, akun akan keluar otomatis dalam{' '}
                        <b className="text-slate-800">{secondsLeft} detik</b>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={logout}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        <LogOut className="h-4 w-4" /> Keluar
                    </button>
                    <button
                        type="button"
                        autoFocus
                        onClick={stay}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
                    >
                        Tetap login
                    </button>
                </div>
            </div>
        </div>
    );
}
