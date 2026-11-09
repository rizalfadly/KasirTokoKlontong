import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';
import { UserRoundPlus, Users, Shield, Sparkles, CheckCircle2, Pencil, Trash2, X, KeyRound } from 'lucide-react';

const ROLE_STYLE = {
    owner: 'bg-violet-100 text-violet-700 border border-violet-200',
    admin: 'bg-sky-100 text-sky-700 border border-sky-200',
    kasir: 'bg-amber-100 text-amber-800 border border-amber-200',
};

const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm placeholder:font-normal placeholder:text-slate-400';

const card = 'rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-xl';

function remove(u) {
    if (confirm(`Hapus akun "${u.username}" (${u.name}) secara permanen? Tindakan ini tidak bisa diurungkan.`)) {
        router.delete(`/pengguna/${u.id}`, {
            preserveScroll: true,
            onError: (e) => alert(e.delete ?? 'Gagal menghapus akun.'),
        });
    }
}

function Field({ label, error, hint, ...props }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-600">{label}</span>
            <input {...props} className={inputClass} />
            {hint && !error && <span className="block text-xs font-medium text-slate-400">{hint}</span>}
            {error && <span className="block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
        </label>
    );
}

function RoleSelect({ value, onChange, roles, error }) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-600">Peran Akun</span>
            <select value={value} onChange={onChange} className={inputClass + ' capitalize font-bold'}>
                {roles.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
            {error && <span className="block text-xs font-extrabold text-rose-600">⚠️ {error}</span>}
        </label>
    );
}

export default function Pengguna({ users, roles }) {
    const [editing, setEditing] = useState(null);
    const [showPw, setShowPw] = useState(false);
    const { auth } = usePage().props;

    const addForm = useForm({ name: '', username: '', role: 'kasir', password: '' });
    const editForm = useForm({ name: '', role: 'kasir', is_active: true, password: '' });

    function submitAdd(e) {
        e.preventDefault();
        addForm.post('/pengguna', { preserveScroll: true, onSuccess: () => addForm.reset() });
    }

    function openEdit(u) {
        editForm.clearErrors();
        editForm.setData({ name: u.name, role: u.role, is_active: !!u.is_active, password: '' });
        setEditing(u);
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/pengguna/${editing.id}`, { preserveScroll: true, onSuccess: () => setEditing(null) });
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
            <Head title="Manajemen Pengguna" />

            {/* Banner Full Color Supreme */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-indigo-500/25 md:p-8">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-20 pointer-events-none">
                    <Sparkles className="h-64 w-64 animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-100">
                            <Shield className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                            <span>Kontrol Akses Sistem</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                            Manajemen Pengguna
                        </h1>
                        <p className="mt-1 text-xs md:text-sm text-indigo-100/90 font-medium">
                            Kelola hak akses akun owner, admin, dan kasir toko secara aman dan real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Tambah Akun */}
            <form onSubmit={submitAdd} className={card + ' p-6 md:p-8 space-y-5'}>
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-sm">
                        <UserRoundPlus className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-black text-slate-800">Tambah Akun Baru</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <Field
                        label="Nama Lengkap"
                        placeholder="mis. Budi Santoso"
                        value={addForm.data.name}
                        onChange={(e) => addForm.setData('name', e.target.value)}
                        error={addForm.errors.name}
                    />
                    <Field
                        label="Username"
                        placeholder="mis. KasirB"
                        autoCapitalize="none"
                        autoComplete="off"
                        value={addForm.data.username}
                        onChange={(e) => addForm.setData('username', e.target.value)}
                        error={addForm.errors.username}
                        hint="Huruf, angka, tanpa spasi."
                    />
                    <RoleSelect
                        roles={roles}
                        value={addForm.data.role}
                        onChange={(e) => addForm.setData('role', e.target.value)}
                        error={addForm.errors.role}
                    />
                    <div>
                        <Field
                            label="Kata Sandi"
                            type={showPw ? 'text' : 'password'}
                            placeholder="Minimal 8 karakter"
                            autoComplete="new-password"
                            value={addForm.data.password}
                            onChange={(e) => addForm.setData('password', e.target.value)}
                            error={addForm.errors.password}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="mt-1.5 text-xs font-bold text-indigo-600 hover:underline"
                        >
                            {showPw ? 'Sembunyikan' : 'Lihat kata sandi'}
                        </button>
                    </div>
                </div>

                <button
                    disabled={addForm.processing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:scale-100"
                >
                    <UserRoundPlus className="h-4 w-4" />
                    <span>{addForm.processing ? 'Menyimpan...' : 'Tambah Akun'}</span>
                </button>
            </form>

            {/* Daftar Akun */}
            <div className={card + ' p-6 md:p-8 space-y-4'}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <span>Daftar Akun Terdaftar</span>
                    </h2>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                        Total: {users.length} Akun
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <th className="pb-3">Nama Pegawai</th>
                                <th className="pb-3">Username</th>
                                <th className="pb-3">Peran</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Transaksi</th>
                                <th className="pb-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-slate-50/80">
                                    <td className="py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 font-black text-indigo-700 shadow-sm">
                                                {(u.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-sm">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 font-mono text-xs font-bold text-slate-600">{u.username ?? '-'}</td>
                                    <td className="py-3.5">
                                        <span
                                            className={
                                                'rounded-full px-3 py-1 text-xs font-black capitalize ' +
                                                (ROLE_STYLE[u.role] ?? 'bg-slate-100 text-slate-600')
                                            }
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        <span
                                            className={
                                                'rounded-full px-3 py-1 text-xs font-black ' +
                                                (u.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-500')
                                            }
                                        >
                                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 text-xs font-bold text-slate-600">{u.sales_count} Nota</td>
                                    <td className="py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-600 transition-colors hover:bg-indigo-100"
                                            >
                                                <Pencil className="h-3.5 w-3.5" /> Edit
                                            </button>
                                            {!u.is_active && u.id !== auth?.user?.id && (
                                                u.sales_count === 0 ? (
                                                    <button
                                                        onClick={() => remove(u)}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-600 transition-colors hover:bg-rose-100"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                                                    </button>
                                                ) : (
                                                    <span
                                                        title="Punya riwayat transaksi, jadi hanya bisa dinonaktifkan"
                                                        className="text-[11px] font-bold text-slate-400 px-2"
                                                    >
                                                        Ada transaksi
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Pop-up Edit Akun */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={submitEdit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-black text-slate-800">Edit Akun Pengguna</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs font-bold text-slate-500">
                            Username: <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{editing.username}</span>
                        </p>

                        <Field
                            label="Nama Lengkap"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            error={editForm.errors.name}
                        />
                        <RoleSelect
                            roles={roles}
                            value={editForm.data.role}
                            onChange={(e) => editForm.setData('role', e.target.value)}
                            error={editForm.errors.role}
                        />
                        <Field
                            label="Kata Sandi Baru"
                            type="text"
                            placeholder="Kosongkan jika tidak diubah"
                            autoComplete="off"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            error={editForm.errors.password}
                            hint="Minimal 8 karakter. Isi hanya untuk mereset sandi."
                        />
                        
                        <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                            />
                            <span>Akun aktif (diizinkan masuk sistem kasir)</span>
                        </label>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                disabled={editForm.processing}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

Pengguna.layout = (page) => <KasirLayout>{page}</KasirLayout>;