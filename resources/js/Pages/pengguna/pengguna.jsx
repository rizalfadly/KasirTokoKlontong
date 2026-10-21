import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import KasirLayout from '../../Layouts/KasirLayout';

const ROLE_STYLE = {
    owner: 'bg-violet-100 text-violet-700',
    admin: 'bg-sky-100 text-sky-700',
    kasir: 'bg-amber-100 text-amber-800',
};

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

const card = 'rounded-2xl border border-white/70 bg-white/75 shadow-sm backdrop-blur-md';

function Field({ label, error, hint, ...props }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
            <input {...props} className={inputClass} />
            {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function RoleSelect({ value, onChange, roles, error }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Peran</span>
            <select value={value} onChange={onChange} className={inputClass + ' capitalize'}>
                {roles.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

export default function Pengguna({ users, roles }) {
    const [editing, setEditing] = useState(null);
    const [showPw, setShowPw] = useState(false);

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
            <Head title="Pengguna" />

            <div>
                <h1 className="text-2xl font-bold">Pengguna</h1>
                <p className="text-sm text-slate-500">Kelola akun owner, admin, dan kasir.</p>
            </div>

            {/* Form tambah */}
            <form onSubmit={submitAdd} className={card + ' p-5'}>
                <h2 className="mb-4 font-semibold">➕ Tambah akun</h2>
                <div className="grid gap-4 md:grid-cols-4">
                    <Field
                        label="Nama lengkap"
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
                        hint="Huruf, angka, titik, strip. Peka huruf besar/kecil."
                    />
                    <RoleSelect
                        roles={roles}
                        value={addForm.data.role}
                        onChange={(e) => addForm.setData('role', e.target.value)}
                        error={addForm.errors.role}
                    />
                    <div>
                        <Field
                            label="Kata sandi"
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
                            className="mt-1 text-xs text-slate-500 hover:text-orange-600"
                        >
                            {showPw ? 'Sembunyikan' : 'Lihat kata sandi'}
                        </button>
                    </div>
                </div>
                <button
                    disabled={addForm.processing}
                    className="mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-orange-200 transition hover:brightness-105 disabled:opacity-50"
                >
                    {addForm.processing ? 'Menyimpan...' : 'Tambah akun'}
                </button>
            </form>

            {/* Daftar */}
            <div className={card + ' p-5'}>
                <h2 className="mb-4 font-semibold">Daftar akun ({users.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-sm text-slate-400">
                                <th className="pb-3 font-medium">Nama</th>
                                <th className="pb-3 font-medium">Username</th>
                                <th className="pb-3 font-medium">Peran</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Transaksi</th>
                                <th className="pb-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((u) => (
                                <tr key={u.id} className="transition hover:bg-amber-50/50">
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                                                {(u.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 font-mono text-sm">{u.username ?? '-'}</td>
                                    <td className="py-3">
                                        <span
                                            className={
                                                'rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' +
                                                (ROLE_STYLE[u.role] ?? 'bg-slate-100 text-slate-600')
                                            }
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={
                                                'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                                (u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500')
                                            }
                                        >
                                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-sm text-slate-500">{u.sales_count}</td>
                                    <td className="py-3 text-right">
                                        <button
                                            onClick={() => openEdit(u)}
                                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pop-up edit */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form onSubmit={submitEdit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
                        <div>
                            <h2 className="text-lg font-bold">✏️ Edit akun</h2>
                            <p className="text-sm text-slate-500">
                                Username: <span className="font-mono font-semibold">{editing.username}</span>
                            </p>
                        </div>

                        <Field
                            label="Nama lengkap"
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
                            label="Kata sandi baru"
                            type="text"
                            placeholder="Kosongkan jika tidak diubah"
                            autoComplete="off"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            error={editForm.errors.password}
                            hint="Minimal 8 karakter. Isi untuk mereset kata sandi."
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                            />
                            Akun aktif (bisa login)
                        </label>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                disabled={editForm.processing}
                                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 font-semibold text-white disabled:opacity-50"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

Pengguna.layout = (page) => <KasirLayout>{page}</KasirLayout>;