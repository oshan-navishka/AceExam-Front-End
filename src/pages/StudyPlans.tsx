import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStudyPlans, generateStudyPlan, deleteStudyPlan } from '../store/slices/studyPlanSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { StudyPlanPayload, StudyPlan } from '../types';
import {
  IconCalendarCheck,
  IconSparkles,
  IconEye,
  IconTrash,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconBrain
} from '../components/common/Icons';

export default function StudyPlans() {
  const dispatch = useAppDispatch();
  const { plans, isLoading, error } = useAppSelector(s => s.studyPlans);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showGenerate, setShowGenerate] = useState(false);
  const [viewPlan, setViewPlan] = useState<StudyPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [topicsInput, setTopicsInput] = useState('');
  const [form, setForm] = useState<StudyPlanPayload>({
    subjectId: '',
    examDate: '',
    dailyStudyHours: 4,
    topics: [],
  });

  useEffect(() => {
    dispatch(fetchStudyPlans());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const topics = topicsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const result = await dispatch(generateStudyPlan({ ...form, topics }));
    if (generateStudyPlan.fulfilled.match(result)) {
      setViewPlan(result.payload);
      setShowGenerate(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteStudyPlan(id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Study Schedules</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate customized day-by-day revision timetables based on your exam deadlines
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <IconSparkles className="w-4 h-4" />
          <span>Generate Study Plan</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <IconAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      {isLoading && !showGenerate ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="spinner w-9 h-9" />
          <p className="text-sm text-slate-400">Loading your study timetables...</p>
        </div>
      ) : plans.length === 0 && !viewPlan ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconCalendarCheck className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No study plans created yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Input your test date and course topics. Gemini AI will break down your syllabus into an achievable daily revision plan.
          </p>
          <button
            onClick={() => setShowGenerate(true)}
            className="btn-primary mt-5 gap-2"
          >
            <IconSparkles className="w-4 h-4" /> Generate First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => {
            const sub = plan.subjectId as any;
            return (
              <div
                key={plan._id}
                className="card group hover:border-indigo-200 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <IconCalendarCheck className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewPlan(plan)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="View schedule details"
                      >
                        <IconEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(plan._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete plan"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {sub?.name || 'Subject Plan'}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="badge-primary text-[11px] py-0.5">
                      Exam: {new Date(plan.examDate).toLocaleDateString()}
                    </span>
                    <span className="badge-neutral text-[11px] py-0.5">
                      {plan.dailyStudyHours} hrs / day
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 font-medium">
                    {plan.schedule?.length || 0} Scheduled Study Sessions
                  </p>

                  {plan.topics && plan.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {plan.topics.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                      {plan.topics.length > 3 && (
                        <span className="text-[11px] font-medium text-slate-400 self-center">
                          +{plan.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Created {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setViewPlan(plan)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View Timetable &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">AI Study Schedule Builder</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <IconBrain className="w-3 h-3 text-indigo-500" /> Powered by Google Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerate(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject *
                </label>
                <select
                  className="input-field"
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Target Exam Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.examDate}
                    onChange={e => setForm({ ...form, examDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Daily Study Commitment
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className="input-field pr-16"
                      value={form.dailyStudyHours}
                      onChange={e => setForm({ ...form, dailyStudyHours: Number(e.target.value) })}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 pointer-events-none">
                      hours/day
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Focus Topics (Comma separated)
                </label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="e.g. Memory Hierarchy, Paging, Virtual Memory, Process Synchronization..."
                  value={topicsInput}
                  onChange={e => setTopicsInput(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerate(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <IconSparkles className="w-4 h-4" />
                      <span>Generate Study Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Drawer / Modal */}
      {viewPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {(viewPlan.subjectId as any)?.name || 'Study Plan'}
                  </h3>
                  <span className="badge-primary text-[10px]">AI Generated</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exam: {new Date(viewPlan.examDate).toLocaleDateString()} · {viewPlan.dailyStudyHours} hours/day
                </p>
              </div>
              <button
                onClick={() => setViewPlan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
              {viewPlan.schedule && viewPlan.schedule.length > 0 ? (
                viewPlan.schedule.map(day => (
                  <div
                    key={day.day}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {day.day}
                        </span>
                        <span className="text-sm font-bold text-slate-900">Day {day.day}</span>
                      </div>
                      {day.date && (
                        <span className="text-xs font-medium text-slate-500">{day.date}</span>
                      )}
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-200/50">
                      {day.tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <IconCheck className="w-3 h-3" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-slate-800">{task.topic}</span>
                            <span className="text-slate-400 ml-1.5 font-mono text-xs">
                              ({task.duration})
                            </span>
                            {task.notes && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
                  {viewPlan.rawPlan}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewPlan(null)} className="btn-secondary text-xs">
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Study Plan?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              This will remove this customized study timetable and its daily task breakdown.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
