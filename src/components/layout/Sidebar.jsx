import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Package, ClipboardList, ClipboardCheck, Boxes, PackageCheck, Cpu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: Home, end: true },
  { to: '/student/catalog', label: 'Available Items', icon: Package },
  { to: '/student/requests', label: 'My Requests', icon: ClipboardList },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: Home, end: true },
  { to: '/teacher/requests', label: 'Requests', icon: ClipboardCheck },
  { to: '/teacher/inventory', label: 'Inventory', icon: Boxes },
  { to: '/teacher/issued', label: 'Issued Items', icon: PackageCheck },
];

export default function Sidebar() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === 'teacher' ? teacherNav : studentNav;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full fixed left-0 top-0 bottom-0 z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">IoT Lab</p>
          <p className="text-slate-400 text-xs">Inventory System</p>
        </div>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
