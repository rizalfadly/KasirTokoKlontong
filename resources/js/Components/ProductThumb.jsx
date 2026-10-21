// Kata kunci pada nama produk -> emoji (urutan penting: yang spesifik di atas)
const GUESS = [
    ['indomie', '🍜'], ['mie', '🍜'], ['mi instan', '🍜'],
    ['telur', '🥚'], ['minyak', '🛢️'], ['beras', '🍚'], ['gula', '🍬'], ['garam', '🧂'],
    ['kopi', '☕'], ['teh', '🍵'], ['susu', '🥛'], ['roti', '🍞'],
    ['sabun', '🧼'], ['deterjen', '🧼'], ['shampo', '🧴'], ['air', '💧'], ['aqua', '💧'],
    ['ayam', '🍗'], ['ikan', '🐟'], ['sayur', '🥬'], ['bawang', '🧅'],
    ['cabai', '🌶️'], ['cabe', '🌶️'], ['tomat', '🍅'],
    ['kecap', '🫙'], ['saus', '🫙'], ['sambal', '🫙'],
    ['tepung', '🌾'], ['mentega', '🧈'], ['margarin', '🧈'], ['keju', '🧀'],
    ['keripik', '🍿'], ['snack', '🍿'], ['permen', '🍬'], ['coklat', '🍫'], ['cokelat', '🍫'],
    ['biskuit', '🍪'], ['apel', '🍎'], ['jeruk', '🍊'], ['pisang', '🍌'],
    ['tisu', '🧻'], ['baterai', '🔋'], ['minuman', '🥤'],
];

export const ICONS = [
    '🥚', '🍜', '🛢️', '🍚', '🍬', '🧂', '☕', '🍵', '🥛', '🍞', '🧼', '🧴',
    '💧', '🍗', '🐟', '🥬', '🧅', '🌶️', '🍅', '🫙', '🌾', '🧈', '🧀', '🍿',
    '🍫', '🍪', '🍎', '🍊', '🍌', '🥤', '🧻', '🔋', '📦',
];

export const guessIcon = (name = '') => {
    const n = name.toLowerCase();
    const hit = GUESS.find(([key]) => new RegExp('(^|[^a-z])' + key).test(n));
    return hit ? hit[1] : '📦';
};

export default function ProductThumb({ product, size = 'h-12 w-12', text = 'text-2xl' }) {
    return (
        <div
            className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 ${text}`}
        >
            {product.image_url ? (
                <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
            ) : (
                <span>{product.icon || guessIcon(product.name)}</span>
            )}
        </div>
    );
}