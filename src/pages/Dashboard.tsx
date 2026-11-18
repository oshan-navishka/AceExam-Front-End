import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboard } from '../store/slices/analyticsSlice';
import {
  IconBookOpen,
  IconCalendar,
  IconClipboardList,
  IconTrophy,
  IconSparkles,
  IconArrowRight,
  IconClock,
  IconTrendingUp,
  IconPlus,
  IconFileText
} from '../components/common/Icons';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="card hover:shadow-soft-md transition-all duration-200 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { dashboard, isLoading } = useAppSelector(s => s.analytics);
  const { user } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (isLoading || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="spinner w-9 h-9" />
        <p className="text-sm text-slate-400 font-medium">Loading your study dashboard...</p>
      </div>
    );
  }

  const { stats, upcomingExams, recentResults, charts } = dashboard;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
              <IconSparkles className="w-3.5 h-3.5 text-indigo-300" />
              AI Exam Readiness Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {firstName}!
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              {stats.daysUntilNextExam != null ? (
                <>
                  Your upcoming exam is scheduled in <strong className="text-white underline decoration-indigo-400 font-bold">{stats.daysUntilNextExam} day{stats.daysUntilNextExam !== 1 ? 's' : ''}</strong>. Stay consistent with your revision!
                </>
              ) : (
                "You have no immediate exams scheduled. Generate a practice paper to test your recall."
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/papers"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-xs sm:text-sm hover:bg-indigo-50 shadow-sm transition-all flex items-center gap-2"
            >
              <IconSparkles className="w-4 h-4 text-indigo-600" />
              Generate Paper
            </Link>
            <Link
              to="/notes"
              className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700/80 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <IconFileText className="w-4 h-4" />
              Upload PDF
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={IconBookOpen}
          label="Subjects"
          value={stats.totalSubjects}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={IconCalendar}
          label="Upcoming Exams"
          value={stats.upcomingExamsCount}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={IconClipboardList}
          label="Papers Solved"
          value={stats.completedPapers}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={IconTrophy}
          label="Average Score"
          value={`${stats.averageScore}%`}
          sub={`${stats.studyProgress}% study progress`}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Subject Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average score per subject across all completed papers</p>
            </div>
            <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <IconTrendingUp className="w-4 h-4" />
            </span>
          </div>

          {charts.subjectWiseScores.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">Complete practice papers to see subject scores</p>
              <Link to="/papers" className="inline-block mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Start a practice paper &rarr;
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.subjectWiseScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Avg Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="averageScore" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Activity Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Day-by-day score progression this week</p>
            </div>
            <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <IconClock className="w-4 h-4" />
            </span>
          </div>

          {charts.weeklyPerformance.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No activity recorded this week yet</p>
              <p className="text-xs text-slate-400 mt-1">Take an exam today to initiate your streak!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.weeklyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Avg Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Upcoming Exams</h3>
              <p className="text-xs text-slate-400">Next deadlines to prepare for</p>
            </div>
            <Link
              to="/exams"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-400 font-medium">No upcoming exams</p>
              <Link to="/exams" className="btn-secondary mt-3 text-xs py-1.5 px-3 inline-flex items-center gap-1.5">
                <IconPlus className="w-3.5 h-3.5" /> Add Exam
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam: any) => {
                const days = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);
                const isUrgent = days <= 3;
                return (
                  <div
                    key={exam._id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <span className="text-sm leading-none">{days}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold">days</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{exam.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {exam.subjectId?.name || 'Subject'} · {new Date(exam.examDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Exam Results</h3>
              <p className="text-xs text-slate-400">Latest evaluated practice sessions</p>
            </div>
            <Link
              to="/results"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-400 font-medium">No results yet</p>
              <Link to="/papers" className="btn-primary mt-3 text-xs py-1.5 px-3 inline-flex items-center gap-1.5">
                <IconSparkles className="w-3.5 h-3.5" /> Take a Practice Paper
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map(r => (
                <div
                  key={r._id}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      r.percentage >= 70
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : r.percentage >= 50
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {r.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.paperTitle}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {r.subjectName} · {new Date(r.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/results/${r._id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
