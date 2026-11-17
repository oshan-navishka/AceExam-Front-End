import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard':   '🏠 Dashboard',
  '/subjects':    '📚 Subjects',
  '/exams':       '📅 Exams',
  '/notes':       '📄 Notes',
  '/study-plans': '🗓️ Study Plans',
  '/papers':      '📝 Practice Papers',
  '/results':     '🏆 Results',
  '/analytics':   '📊 Analytics',
};

interface Props { onMenuClick: () => void; }

export default function Navbar({ onMenuClick }: Props) {
  const { pathname } = useLocation();

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || 'AceExam AI';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          AI Ready
        </div>
      </div>
    </header>
  );
}
