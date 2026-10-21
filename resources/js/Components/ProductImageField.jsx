import { useRef, useState } from 'react';
import ProductThumb, { ICONS, guessIcon } from './ProductThumb';

const SIZE = 240;

export default function ProductImageField({ form, existingUrl = null }) {
    const fileRef = useRef(null);
    const [error, setError] = useState('');
    const { data, setData } = form;

    const previewUrl = data.image || (data.remove_image ? null : existingUrl);

    function handleFile(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar (JPG, PNG, atau WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                // Dipotong persegi di tengah, lalu dikecilkan
                const side = Math.min(img.width, img.height);
                const sx = (img.width - side) / 2;
                const sy = (img.height - side) / 2;

                const canvas = document.createElement('canvas');
                canvas.width = SIZE;
                canvas.height = SIZE;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, SIZE, SIZE);
                ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);

                setData({ ...data, image: canvas.toDataURL('image/jpeg', 0.82), remove_image: false });
                setError('');
            };
            img.onerror = () => setError('Gambar tidak bisa dibaca. Coba file lain.');
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    function removePhoto() {
        setData({ ...data, image: '', remove_image: !!existingUrl });
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="mb-2 block text-sm font-medium text-slate-600">Gambar produk</span>

            <div className="flex items-center gap-4">
                <ProductThumb
                    size="h-20 w-20"
                    text="text-4xl"
                    product={{ name: data.name, image_url: previewUrl, icon: data.icon }}
                />

                <div className="space-y-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                        >
                            {previewUrl ? 'Ganti foto' : 'Unggah foto'}
                        </button>
                        {previewUrl && (
                            <button type="button" onClick={removePhoto} className="text-sm text-red-500 hover:underline">
                                Hapus foto
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-400">Foto otomatis dipotong persegi dan dikecilkan.</p>
                </div>
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            {/* Ikon (dipakai kalau tidak ada foto) */}
            <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Atau pilih ikon</span>
                    <button
                        type="button"
                        onClick={() => setData({ ...data, icon: '' })}
                        className={'text-xs ' + (!data.icon ? 'font-semibold text-orange-600' : 'text-slate-500 hover:text-orange-600')}
                    >
                        Otomatis dari nama ({guessIcon(data.name)})
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {ICONS.map((ic) => (
                        <button
                            key={ic}
                            type="button"
                            onClick={() => setData({ ...data, icon: ic })}
                            className={
                                'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ' +
                                (data.icon === ic
                                    ? 'border-orange-400 bg-orange-100 ring-2 ring-orange-200'
                                    : 'border-slate-200 bg-white hover:bg-amber-50')
                            }
                        >
                            {ic}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}