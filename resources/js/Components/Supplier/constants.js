export const TYPE_LABEL = { supplier: 'Supplier', distributor: 'Distributor', peternak: 'Peternak' };

export const TYPE_STYLE = {
    supplier: 'bg-sky-100 text-sky-700',
    distributor: 'bg-violet-100 text-violet-700',
    peternak: 'bg-emerald-100 text-emerald-700',
};

export const TERM_LABEL = {
    tunai: 'Tunai',
    tempo7: 'Tempo 7 hari',
    tempo14: 'Tempo 14 hari',
    tempo30: 'Tempo 30 hari',
};

// Nomor lokal (0812...) diubah ke format internasional untuk tautan WhatsApp
export const waLink = (phone) => {
    const digits = String(phone ?? '').replace(/\D/g, '');
    if (!digits) return null;

    const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits.startsWith('62') ? digits : '62' + digits;

    return `https://wa.me/${intl}`;
};