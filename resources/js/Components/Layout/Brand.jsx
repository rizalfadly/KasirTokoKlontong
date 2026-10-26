import { usePage } from '@inertiajs/react';

export default function Brand() {
    const { store } = usePage().props;
    const name = store?.name || 'Brian Berkah Telur';
    const logo = store?.logo_url || '/images/logotoko.png';

    return (
        <div className="flex items-center gap-3">
            <img
                src={logo}
                alt={name}
                className="h-11 w-11 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-lg shadow-orange-100"
            />
            <div className="min-w-0 truncate text-lg font-bold leading-tight">{name}</div>
        </div>
    );
}