import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboard, fetchSubjectAnalytics } from '../store/slices/analyticsSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import {
  IconBarChart,
  IconTrendingUp,
  IconBookOpen,
  IconTrophy,
  IconClipboardList,
  IconCalendar,
  IconFileText,
  IconCalendarCheck,
  IconCheck,
  IconAlertTriangle
} from '../components/common/Icons';

const CHART_COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

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
    if (selectedSubject) {
      dispatch(fetchSubjectAnalytics(selectedSubject));
    }
  }, [selectedSubject, dispatch]);

  if (!dashboard && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="spinner w-9 h-9" />
        <p className="text-sm text-slate-400">Loading performance metrics...</p>
      </div>
    );
  }

  const stats = dashboard?.stats;

  const overviewPie = stats
    ? [
        { name: 'Enrolled Subjects', value: stats.totalSubjects },
        { name: 'Papers Completed', value: stats.completedPapers },
        { name: 'Uploaded Notes', value: stats.totalNotes },
      ]
    : [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Performance Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track learning trajectories, score progression, and conceptual mastery
          </p>
        </div>

        {/* Subject Deep Dive Dropdown */}
        <div className="self-start sm:self-auto min-w-[220px]">
          <select
            className="input-field"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">— Subject Deep-Dive Analysis —</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Subjects', value: stats.totalSubjects, icon: IconBookOpen, color: 'text-blue-600 bg-blue-50' },
            { label: 'Avg Score', value: `${stats.averageScore}%`, icon: IconTrophy, color: 'text-amber-600 bg-amber-50' },
            { label: 'Papers Done', value: stats.completedPapers, icon: IconClipboardList, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Upcoming', value: stats.upcomingExamsCount, icon: IconCalendar, color: 'text-purple-600 bg-purple-50' },
            { label: 'Notes', value: stats.totalNotes, icon: IconFileText, color: 'text-rose-600 bg-rose-50' },
            { label: 'Progress', value: `${stats.studyProgress}%`, icon: IconCalendarCheck, color: 'text-indigo-600 bg-indigo-50' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-4 text-center hover:shadow-soft-md transition-all">
                <div className={`w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Row 1 */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Average Score */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Subject Performance Benchmark</h3>
                <p className="text-xs text-slate-400">Average exam scores categorized by subject</p>
              </div>
              <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <IconBarChart className="w-4 h-4" />
              </span>
            </div>

            {dashboard.charts.subjectWiseScores.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 text-sm font-medium">Complete practice papers to see subject scores</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dashboard.charts.subjectWiseScores}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Average Score']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="averageScore" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {dashboard.charts.subjectWiseScores.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Activity Composition Donut */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Resource Distribution</h3>
                <p className="text-xs text-slate-400">Proportion of study materials</p>
              </div>
              <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <IconTrendingUp className="w-4 h-4" />
              </span>
            </div>

            {overviewPie.every(d => d.value === 0) ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 text-sm font-medium">No activity data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={overviewPie}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {overviewPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Weekly Trend */}
      {dashboard && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Evaluation Trajectory</h3>
              <p className="text-xs text-slate-400">Aggregated daily scores over the past 7 days</p>
            </div>
            <span className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <IconTrendingUp className="w-4 h-4" />
            </span>
          </div>

          {dashboard.charts.weeklyPerformance.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-400 text-sm font-medium">No test sessions logged this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={dashboard.charts.weeklyPerformance}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Average Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Subject Deep-Dive Panel */}
      {selectedSubject && subjectAnalytics && (
        <div className="card space-y-6 border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {subjectAnalytics.subject.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Deep Dive: {subjectAnalytics.subject.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Code: {subjectAnalytics.subject.code}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'PDF Notes', value: subjectAnalytics.stats.totalNotes },
              { label: 'Mock Papers', value: subjectAnalytics.stats.totalPapers },
              { label: 'Attempts', value: subjectAnalytics.stats.totalAttempts },
              { label: 'Average Score', value: `${subjectAnalytics.stats.averageScore}%` },
              { label: 'Personal Best', value: `${subjectAnalytics.stats.bestScore}%` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-3.5 text-center border border-slate-200/80 shadow-soft-sm">
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progression Graph */}
          {subjectAnalytics.scoreProgression.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Attempt-by-Attempt Score Progression
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={subjectAnalytics.scoreProgression}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Attempt Score']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Conceptual Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <IconCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Concept Strengths
                </h4>
              </div>
              {subjectAnalytics.strongAreas.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {subjectAnalytics.strongAreas.map((a, i) => (
                    <p key={i} className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                      <span>&bull;</span> {a}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600/70">Complete more papers to pinpoint mastery.</p>
              )}
            </div>

            <div className="p-5 bg-rose-50/70 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Revision Priorities
                </h4>
              </div>
              {subjectAnalytics.weakAreas.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {subjectAnalytics.weakAreas.map((a, i) => (
                    <p key={i} className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
                      <span>&bull;</span> {a}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-600/70">No persistent weaknesses detected.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
