import { useLocation } from 'react-router-dom';
import { IconMenu, IconSparkles } from '../common/Icons';
import { useAppSelector } from '../../store/hooks';

const pageMetadata: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':   { title: 'Dashboard',        subtitle: 'Overview & daily study progress' },
  '/subjects':    { title: 'Subjects',         subtitle: 'Manage your enrolled courses' },
  '/exams':       { title: 'Exam Schedule',    subtitle: 'Track upcoming deadlines & venues' },
  '/notes':       { title: 'Study Notes & PDFs', subtitle: 'Upload and extract text with AI' },
  '/study-plans': { title: 'AI Study Plans',   subtitle: 'Personalized revision roadmaps' },
  '/papers':      { title: 'Practice Papers',  subtitle: 'AI-generated mock examinations' },
  '/results':     { title: 'Exam Results',     subtitle: 'Performance reviews & scorecards' },
  '/analytics':   { title: 'Analytics',        subtitle: 'Deep-dive progress and trends' },
};

interface Props {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const { user } = useAppSelector(s => s.auth);

  const matched = Object.entries(pageMetadata).find(([path]) => pathname.startsWith(path));
  const currentMeta = matched ? matched[1] : { title: 'AceExam AI', subtitle: 'AI Exam Prep Platform' };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <IconMenu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              {currentMeta.title}
            </h1>
            <span className="hidden md:inline-flex text-[11px] font-medium text-slate-400">
              — {currentMeta.subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
          <span>{todayStr}</span>
        </div>

        {/* AI Ready Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-soft-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <IconSparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden xs:inline">AI Online</span>
        </div>

        {/* User Initial Circle */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
