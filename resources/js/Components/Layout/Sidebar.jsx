import Brand from './Brand';
import NavMenu from './NavMenu';
import UserProfile from './UserProfile';

export default function Sidebar({ user, sections, isCollapsed }) {
    return (
        <aside 
            className={`fixed inset-y-0 left-0 hidden flex-col border-r border-white/80 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-900/5 print:hidden lg:flex transition-all duration-300 z-40 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Bagian Atas: Logo Toko */}
            <div className="px-6 py-6 border-b border-slate-100/80 flex items-center justify-center">
                <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                    <Brand minimized={false} />
                </div>
                {isCollapsed && (
                    <div className="w-full flex justify-center">
                        <Brand minimized={true} />
                    </div>
                )}
            </div>

            {/* Bagian Tengah: Menu Navigasi */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overflow-x-hidden">
                <NavMenu sections={sections} minimized={isCollapsed} />
            </div>

            {/* Bagian Bawah: Profil User */}
            <div className="border-t border-slate-100/80 p-3 bg-slate-50/50 overflow-hidden">
                <UserProfile user={user} minimized={isCollapsed} />
            </div>
        </aside>
    );
}