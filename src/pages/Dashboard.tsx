import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboard } from '../store/slices/analyticsSlice';

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { dashboard, isLoading } = useAppSelector(s => s.analytics);
  const { user } = useAppSelector(s => s.auth);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  if (isLoading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  const { stats, upcomingExams, recentResults, charts } = dashboard;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-primary-100 mt-1">
          {stats.daysUntilNextExam != null
            ? `Your next exam is in ${stats.daysUntilNextExam} day${stats.daysUntilNextExam !== 1 ? 's' : ''}. Keep it up!`
            : "No upcoming exams. Add one to stay on track."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Subjects" value={stats.totalSubjects} color="bg-blue-50" />
        <StatCard icon="📅" label="Upcoming Exams" value={stats.upcomingExamsCount} color="bg-purple-50" />
        <StatCard icon="📝" label="Papers Completed" value={stats.completedPapers} color="bg-green-50" />
        <StatCard icon="🏆" label="Average Score" value={`${stats.averageScore}%`} sub={`${stats.studyProgress}% study progress`} color="bg-yellow-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject scores */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
          {charts.subjectWiseScores.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Complete practice papers to see subject scores</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.subjectWiseScores} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly performance */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          {charts.weeklyPerformance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No activity this week yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.weeklyPerformance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                <Line type="monotone" dataKey="averageScore" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming exams */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Exams</h3>
            <Link to="/exams" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam: any) => {
                const days = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={exam._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm">{days}d</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                      <p className="text-xs text-gray-400">{exam.subjectId?.name || 'Unknown'} · {new Date(exam.examDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Results</h3>
            <Link to="/results" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No results yet — take a practice paper!</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map(r => (
                <div key={r._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${r.percentage >= 70 ? 'bg-green-100 text-green-700' : r.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {r.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.paperTitle}</p>
                    <p className="text-xs text-gray-400">{r.subjectName} · {new Date(r.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
