import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { ROLE_LABEL } from './menu';

const COLORS = [
    'bg-orange-100 text-orange-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
];

function Avatar({ name = '?' }) {
    const color = COLORS[name.charCodeAt(0) % COLORS.length];
    return (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${color}`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function UserProfile({ user, onNavigate }) {
    const name = user.username ?? user.name ?? '?';

    return (
        <div className="flex items-center gap-3">
            <Avatar name={name} />
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{ROLE_LABEL[user.role] ?? user.role}</div>
                <div className="truncate text-xs text-slate-500">{name}</div>
            </div>
            <Link
                href="/logout"
                method="post"
                as="button"
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
            >
                <LogOut className="h-4 w-4" />
                Keluar
            </Link>
        </div>
    );
}