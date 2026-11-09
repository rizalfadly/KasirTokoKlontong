import Brand from './Brand';
import NavMenu from './NavMenu';
import UserProfile from './UserProfile';

export default function Sidebar({ user, sections }) {
    return (
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/80 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-900/5 print:hidden lg:flex">
            {/* Area Brand / Logo Toko */}
            <div className="px-6 py-6 border-b border-slate-100/80">
                <Brand />
            </div>

            {/* Area Menu Navigasi Utama */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <NavMenu sections={sections} />
            </div>

            {/* Area Profil Pengguna di Bagian Bawah */}
            <div className="border-t border-slate-100/80 p-4 bg-slate-50/50">
                <UserProfile user={user} />
            </div>
        </aside>
    );
}