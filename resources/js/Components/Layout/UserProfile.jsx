import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { ROLE_LABEL } from './menu';

// Palet warna gradien cerah untuk avatar inisial
const GRADIENTS = [
    'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25',
    'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25',
    'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
    'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
    'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25',
];

function Avatar({ name = '?' }) {
    const gradient = GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];
    return (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${gradient}`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function UserProfile({ user, onNavigate, minimized = false }) {
    const name = user.username ?? user.name ?? '?';

    // Jika sidebar sedang dimimize (dikecilkan)
    if (minimized) {
        return (
            <div className="flex flex-col items-center gap-3">
                <Avatar name={name} />
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={onNavigate}
                    title="Keluar Aplikasi"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-all duration-300 hover:bg-rose-500 hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    // Tampilan normal saat sidebar ukuran penuh
    return (
        <div className="flex items-center gap-3">
            <Avatar name={name} />
            <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {ROLE_LABEL[user.role] ?? user.role}
                </div>
                <div className="truncate text-sm font-extrabold text-slate-800">
                    {name}
                </div>
            </div>
            <Link
                href="/logout"
                method="post"
                as="button"
                onClick={onNavigate}
                title="Keluar Aplikasi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/25"
            >
                <LogOut className="h-4 w-4" />
            </Link>
        </div>
    );
}