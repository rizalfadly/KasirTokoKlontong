// Tampilkan jumlah dengan koma Indonesia: 1.5 -> "1,5", 50 -> "50"
export const num = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(Number(n) || 0);