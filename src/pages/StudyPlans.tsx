import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStudyPlans, generateStudyPlan, deleteStudyPlan } from '../store/slices/studyPlanSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { StudyPlanPayload, StudyPlan } from '../types';

export default function StudyPlans() {
  const dispatch = useAppDispatch();
  const { plans, isLoading, error } = useAppSelector(s => s.studyPlans);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showGenerate, setShowGenerate] = useState(false);
  const [viewPlan, setViewPlan] = useState<StudyPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [topicsInput, setTopicsInput] = useState('');
  const [form, setForm] = useState<StudyPlanPayload>({
    subjectId: '', examDate: '', dailyStudyHours: 4, topics: [],
  });

  useEffect(() => { dispatch(fetchStudyPlans()); dispatch(fetchSubjects()); }, [dispatch]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const topics = topicsInput.split(',').map(t => t.trim()).filter(Boolean);
    const result = await dispatch(generateStudyPlan({ ...form, topics }));
    if (generateStudyPlan.fulfilled.match(result)) {
      setViewPlan(result.payload);
      setShowGenerate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Study Plans</h2>
          <p className="text-sm text-gray-500">{plans.length} AI-generated plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary flex items-center gap-2">
          <span>✨</span> Generate Plan
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {isLoading && !showGenerate ? (
        <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
      ) : plans.length === 0 && !viewPlan ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="font-semibold text-gray-700">No study plans yet</p>
          <p className="text-gray-400 text-sm mt-1">Let AI create a personalized study schedule for you</p>
          <button onClick={() => setShowGenerate(true)} className="btn-primary mt-4">Generate Plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const sub = plan.subjectId as any;
            return (
              <div key={plan._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center text-xl">🗓️</div>
                  <div className="flex gap-1">
                    <button onClick={() => setViewPlan(plan)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm">👁️</button>
                    <button onClick={() => setDeleteConfirm(plan._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{sub?.name || 'Unknown Subject'}</h3>
                <p className="text-xs text-gray-400 mt-1">Exam: {new Date(plan.examDate).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400">{plan.dailyStudyHours}h/day · {plan.schedule.length} day plan</p>
                {plan.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {plan.topics.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                    {plan.topics.length > 3 && <span className="text-xs text-gray-400">+{plan.topics.length - 3}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center text-xl">✨</div>
              <div>
                <h3 className="font-bold text-gray-900">AI Study Plan Generator</h3>
                <p className="text-xs text-gray-400">Powered by Google Gemini</p>
              </div>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select className="input-field" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date *</label>
                <input type="date" className="input-field" value={form.examDate}
                  onChange={e => setForm({ ...form, examDate: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Study Hours</label>
                <input type="number" min={1} max={12} className="input-field" value={form.dailyStudyHours}
                  onChange={e => setForm({ ...form, dailyStudyHours: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma separated)</label>
                <textarea className="input-field resize-none" rows={3}
                  placeholder="Algebra, Calculus, Trigonometry..."
                  value={topicsInput} onChange={e => setTopicsInput(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isLoading ? <><span className="spinner w-4 h-4" />Generating...</> : '✨ Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Modal */}
      {viewPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Study Plan — {(viewPlan.subjectId as any)?.name}</h3>
                <p className="text-xs text-gray-400">Exam: {new Date(viewPlan.examDate).toLocaleDateString()} · {viewPlan.dailyStudyHours}h/day</p>
              </div>
              <button onClick={() => setViewPlan(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {viewPlan.schedule.length > 0 ? viewPlan.schedule.map(day => (
                <div key={day.day} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">{day.day}</span>
                    <span className="text-sm font-medium text-gray-700">{day.date}</span>
                  </div>
                  <div className="space-y-2">
                    {day.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">{task.topic}</span>
                          <span className="text-gray-400"> — {task.duration}</span>
                          {task.notes && <p className="text-xs text-gray-400 mt-0.5">{task.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="bg-gray-50 rounded-xl p-4">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{viewPlan.rawPlan}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold mb-2">Delete this study plan?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={async () => { await dispatch(deleteStudyPlan(deleteConfirm)); setDeleteConfirm(null); }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
