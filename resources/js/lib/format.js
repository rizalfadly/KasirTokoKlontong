// Tampilkan jumlah dengan koma Indonesia: 1.5 -> "1,5", 50 -> "50"
export const num = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(Number(n) || 0);

export const rp = (n) =>
    //new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const round3 = (n) => Math.round(n * 1000) / 1000;

    