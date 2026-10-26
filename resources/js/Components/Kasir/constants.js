import { Store, ShoppingBag, Banknote, QrCode, Landmark } from 'lucide-react';

export const CHANNELS = [
    { key: 'offline', label: 'Offline', icon: Store },
    { key: 'tokopedia', label: 'Tokopedia', icon: ShoppingBag },
    { key: 'shopee', label: 'Shopee', icon: ShoppingBag },
];

export const METHODS = [
    { key: 'tunai', label: 'Tunai', icon: Banknote },
    { key: 'qris', label: 'QRIS', icon: QrCode },
    { key: 'transfer', label: 'Transfer', icon: Landmark },
];

export const PAY_LABEL = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer', marketplace: 'Via marketplace' };
