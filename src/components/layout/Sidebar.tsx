import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  IconHome,
  IconBookOpen,
  IconCalendar,
  IconFileText,
  IconCalendarCheck,
  IconClipboardList,
  IconTrophy,
  IconBarChart,
  IconLogOut,
  IconGraduationCap,
  IconX,
  IconSparkles
} from '../common/Icons';

const navItems = [
  { to: '/dashboard',   icon: IconHome,          label: 'Dashboard' },
  { to: '/subjects',    icon: IconBookOpen,      label: 'Subjects' },
  { to: '/exams',       icon: IconCalendar,      label: 'Exams' },
  { to: '/notes',       icon: IconFileText,      label: 'Notes' },
  { to: '/study-plans', icon: IconCalendarCheck, label: 'Study Plans' },
  { to: '/papers',      icon: IconClipboardList, label: 'Practice Papers' },
  { to: '/results',     icon: IconTrophy,        label: 'Results' },
  { to: '/analytics',   icon: IconBarChart,      label: 'Analytics' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200/80 z-50
          flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <IconGraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">AceExam AI</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Study Intelligence</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* AI Assistant Quick Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 border border-indigo-100/80 rounded-xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0">
              <IconSparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-indigo-950 truncate">Gemini AI Active</p>
              <p className="text-[10px] text-indigo-700/70 truncate">Exam generator ready</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-sm mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@aceexam.ai'}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all duration-150 border border-transparent hover:border-rose-100"
          >
            <IconLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
