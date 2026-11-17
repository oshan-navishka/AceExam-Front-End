import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboard, fetchSubjectAnalytics } from '../store/slices/analyticsSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const dispatch = useAppDispatch();
  const { dashboard, subjectAnalytics, isLoading } = useAppSelector(s => s.analytics);
  const { subjects } = useAppSelector(s => s.subjects);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSubject) dispatch(fetchSubjectAnalytics(selectedSubject));
  }, [selectedSubject, dispatch]);

  if (!dashboard && isLoading) {
    return <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>;
  }

  const stats = dashboard?.stats;

  const overviewPie = stats ? [
    { name: 'Subjects', value: stats.totalSubjects },
    { name: 'Papers Done', value: stats.completedPapers },
    { name: 'Notes', value: stats.totalNotes },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">Track your study progress and performance</p>
        </div>
        <select
          className="input-field w-auto"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        >
          <option value="">— Subject deep dive —</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Subjects', value: stats.totalSubjects, icon: '📚' },
            { label: 'Avg Score', value: `${stats.averageScore}%`, icon: '🏆' },
            { label: 'Papers Done', value: stats.completedPapers, icon: '📝' },
            { label: 'Upcoming', value: stats.upcomingExamsCount, icon: '📅' },
            { label: 'Notes', value: stats.totalNotes, icon: '📄' },
            { label: 'Study Progress', value: `${stats.studyProgress}%`, icon: '🗓️' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Subject-wise Average Score</h3>
            {dashboard.charts.subjectWiseScores.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">Complete practice papers to see scores</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dashboard.charts.subjectWiseScores} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                  <Bar dataKey="averageScore" radius={[6, 6, 0, 0]}>
                    {dashboard.charts.subjectWiseScores.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Overview</h3>
            {overviewPie.every(d => d.value === 0) ? (
              <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={overviewPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                    {overviewPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Weekly trend */}
      {dashboard && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Score Trend</h3>
          {dashboard.charts.weeklyPerformance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No activity this week</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dashboard.charts.weeklyPerformance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                <Line type="monotone" dataKey="averageScore" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Subject deep-dive */}
      {selectedSubject && subjectAnalytics && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">
            📊 Deep Dive — {subjectAnalytics.subject.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Notes', value: subjectAnalytics.stats.totalNotes },
              { label: 'Papers', value: subjectAnalytics.stats.totalPapers },
              { label: 'Attempts', value: subjectAnalytics.stats.totalAttempts },
              { label: 'Avg Score', value: `${subjectAnalytics.stats.averageScore}%` },
              { label: 'Best Score', value: `${subjectAnalytics.stats.bestScore}%` },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {subjectAnalytics.scoreProgression.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Score Progression</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={subjectAnalytics.scoreProgression} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="attempt" tick={{ fontSize: 11 }} label={{ value: 'Attempt', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-2">💪 Strong Areas</p>
              {subjectAnalytics.strongAreas.length > 0
                ? subjectAnalytics.strongAreas.map((a, i) => <p key={i} className="text-sm text-green-700">✓ {a}</p>)
                : <p className="text-sm text-green-600 opacity-60">Complete more papers</p>}
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm font-semibold text-red-800 mb-2">📌 Weak Areas</p>
              {subjectAnalytics.weakAreas.length > 0
                ? subjectAnalytics.weakAreas.map((a, i) => <p key={i} className="text-sm text-red-700">→ {a}</p>)
                : <p className="text-sm text-red-600 opacity-60">All good so far!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
