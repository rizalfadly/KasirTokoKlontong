import { useRef, useState } from 'react';

const MAX = 256;

export default function LogoField({ form, existingUrl = null }) {
    const fileRef = useRef(null);
    const [error, setError] = useState('');
    const { data, setData } = form;

    const previewUrl = data.logo || (data.remove_logo ? null : existingUrl);

    function handleFile(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar (PNG, JPG, atau WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                const w = Math.max(1, Math.round(img.width * scale));
                const h = Math.max(1, Math.round(img.height * scale));

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                // PNG menjaga latar transparan; kalau terlalu besar, pakai JPG berlatar putih
                let result = canvas.toDataURL('image/png');
                if (result.length > 250000) {
                    const c2 = document.createElement('canvas');
                    c2.width = w;
                    c2.height = h;
                    const x2 = c2.getContext('2d');
                    x2.fillStyle = '#ffffff';
                    x2.fillRect(0, 0, w, h);
                    x2.drawImage(canvas, 0, 0);
                    result = c2.toDataURL('image/jpeg', 0.85);
                }

                setData({ ...data, logo: result, remove_logo: false });
                setError('');
            };
            img.onerror = () => setError('Gambar tidak bisa dibaca. Coba file lain.');
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        setData({ ...data, logo: '', remove_logo: !!existingUrl });
    }

    return (
        <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">Logo toko</span>
            <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Logo toko" className="h-full w-full object-contain p-1" />
                    ) : (
                        <span className="text-3xl">🏪</span>
                    )}
                </div>
                <div className="space-y-2">
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                        >
                            {previewUrl ? 'Ganti logo' : 'Unggah logo'}
                        </button>
                        {previewUrl && (
                            <button type="button" onClick={removeLogo} className="text-sm text-red-500 hover:underline">
                                Hapus
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-400">Tampil di header, menu samping, dan halaman login. PNG berlatar transparan paling bagus.</p>
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}