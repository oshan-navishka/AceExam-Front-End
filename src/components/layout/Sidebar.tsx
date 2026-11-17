import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const navItems = [
  { to: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/subjects',     icon: '📚', label: 'Subjects' },
  { to: '/exams',        icon: '📅', label: 'Exams' },
  { to: '/notes',        icon: '📄', label: 'Notes' },
  { to: '/study-plans',  icon: '🗓️',  label: 'Study Plans' },
  { to: '/papers',       icon: '📝', label: 'Practice Papers' },
  { to: '/results',      icon: '🏆', label: 'Results' },
  { to: '/analytics',    icon: '📊', label: 'Analytics' },
];

interface Props { open: boolean; onClose: () => void; }

export default function Sidebar({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">A</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AceExam AI</p>
            <p className="text-xs text-gray-400">Study Smarter</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
