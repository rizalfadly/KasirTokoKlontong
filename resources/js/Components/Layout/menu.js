import { usePage } from '@inertiajs/react';
import {
    BookOpen,
    Boxes,
    ClipboardCheck,
    History,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Store,
    TrendingUp,
    Users,
} from 'lucide-react';

// Menu dikelompokkan. Tanpa "roles" = tampil untuk semua yang sudah login.
// quick: true = ikut tampil di bar bawah (HP).
export const menu = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, quick: true },
    {
        group: 'Penjualan',
        icon: ShoppingBag,
        items: [
            { label: 'Kasir', href: '/kasir', icon: ShoppingCart, quick: true },
            { label: 'Riwayat', href: '/riwayat', icon: History, quick: true },
        ],
    },
    {
        group: 'Persediaan',
        icon: Boxes,
        roles: ['owner', 'admin'],
        items: [
            { label: 'Produk', href: '/produk', icon: Package, quick: true },
            { label: 'Buku Stok', href: '/buku-stok', icon: BookOpen },
            { label: 'Stok Opname', href: '/opname', icon: ClipboardCheck },
        ],
    },
    { label: 'Laporan', href: '/laporan', icon: TrendingUp, roles: ['owner', 'admin'] },
    {
        group: 'Pengaturan',
        icon: Settings,
        roles: ['owner'],
        items: [
            { label: 'Pengguna', href: '/pengguna', icon: Users },
            { label: 'Toko', href: '/pengaturan', icon: Store },
        ],
    },
];

export const ROLE_LABEL = { owner: 'Pemilik Toko', admin: 'Admin', kasir: 'Kasir' };

// Menu yang boleh dilihat peran ini; grup yang kosong dibuang
export function menuFor(role) {
    const visible = (roles) => !roles || roles.includes(role);

    return menu
        .filter((s) => visible(s.roles))
        .map((s) => (s.items ? { ...s, items: s.items.filter((i) => visible(i.roles)) } : s))
        .filter((s) => !s.items || s.items.length > 0);
}

// Item yang tampil di bar bawah (HP)
export const quickItems = (sections) => sections.flatMap((s) => s.items ?? [s]).filter((i) => i.quick);

// Mengecek apakah sebuah alamat sedang dibuka
export function useIsActive() {
    const { url } = usePage();
    const path = url.split('?')[0];

    return (href) => path === href || path.startsWith(href + '/');
}