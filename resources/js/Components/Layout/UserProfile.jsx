import { Link } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import { ROLE_LABEL } from './menu';

export default function UserProfile({ user, onNavigate }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{ROLE_LABEL[user.role] ?? user.role}</div>
                <div className="truncate text-xs text-slate-500">{user.username ?? user.name}</div>
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