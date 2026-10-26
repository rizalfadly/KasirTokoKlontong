import Brand from './Brand';
import NavMenu from './NavMenu';
import UserProfile from './UserProfile';

export default function Sidebar({ user, sections }) {
    return (
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl print:hidden lg:flex">
            <div className="px-6 py-6">
                <Brand />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <NavMenu sections={sections} />
            </div>
            <div className="border-t border-white/60 p-4">
                <UserProfile user={user} />
            </div>
        </aside>
    );
}