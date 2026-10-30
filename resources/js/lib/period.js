const pad = (n) => String(n).padStart(2, '0');

// Hari / bulan / tahun ini sesuai jam di perangkat
export function todayValue(mode) {
    const d = new Date();
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);

    if (mode === 'tahunan') return String(y);
    if (mode === 'bulanan') return `${y}-${m}`;

    return `${y}-${m}-${pad(d.getDate())}`;
}

// Pindah jenis periode sambil mempertahankan tanggal yang sedang dilihat
export function convert(to, v) {
    const [y, m = '01', d = '01'] = v.split('-');

    if (to === 'tahunan') return y;
    if (to === 'bulanan') return `${y}-${m}`;

    return `${y}-${m}-${d}`;
}

// Geser periode ke sebelum (-1) atau sesudah (+1)
export function shift(mode, v, dir) {
    if (mode === 'tahunan') return String(Number(v) + dir);

    if (mode === 'bulanan') {
        const [y, m] = v.split('-').map(Number);

        return new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 7);
    }

    const [y, m, d] = v.split('-').map(Number);

    return new Date(Date.UTC(y, m - 1, d + dir)).toISOString().slice(0, 10);
}