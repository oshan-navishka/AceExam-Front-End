import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPapers, generatePaper, deletePaper } from '../store/slices/paperSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { GeneratePaperPayload } from '../types';
import {
  IconClipboardList,
  IconSparkles,
  IconTrash,
  IconX,
  IconClock,
  IconArrowRight,
  IconAlertTriangle,
  IconBrain
} from '../components/common/Icons';

const emptyForm: GeneratePaperPayload = {
  subjectId: '',
  difficulty: 'medium',
  totalQuestions: 10,
  duration: 60,
  questionTypes: ['mcq'],
};

export default function Papers() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { papers, isLoading, error } = useAppSelector(s => s.papers);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showGenerate, setShowGenerate] = useState(false);
  const [form, setForm] = useState<GeneratePaperPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPapers());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(generatePaper(form));
    if (generatePaper.fulfilled.match(result)) {
      setShowGenerate(false);
      navigate(`/papers/${result.payload._id}/take`);
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deletePaper(id));
    setDeleteConfirm(null);
  };

  const getDifficultyBadge = (d: string) => {
    if (d === 'easy') return <span className="badge-easy">Easy</span>;
    if (d === 'hard') return <span className="badge-hard">Hard</span>;
    return <span className="badge-medium">Medium</span>;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Practice Papers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Test yourself with timed AI mock exams compiled from your course materials
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <IconSparkles className="w-4 h-4" />
          <span>Generate New Paper</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <IconAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="spinner w-9 h-9" />
          <p className="text-sm text-slate-600 font-medium">
            AI is analyzing notes and drafting questions...
          </p>
        </div>
      ) : papers.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconClipboardList className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No practice papers yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Choose a subject and let Gemini AI create realistic exam questions with multiple choices and answer explanations.
          </p>
          <button
            onClick={() => setShowGenerate(true)}
            className="btn-primary mt-5 gap-2"
          >
            <IconSparkles className="w-4 h-4" /> Generate Practice Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map(paper => {
            const sub = paper.subjectId as any;
            return (
              <div
                key={paper._id}
                className="card group hover:border-indigo-200 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <IconClipboardList className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(paper._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete paper"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {paper.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="badge-primary text-[11px] py-0.5">
                      {sub?.name || 'General Subject'}
                    </span>
                    {getDifficultyBadge(paper.difficulty)}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <IconClipboardList className="w-3.5 h-3.5 text-slate-400" />
                      {paper.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <IconClock className="w-3.5 h-3.5 text-slate-400" />
                      {paper.duration} Minutes
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate(`/papers/${paper._id}/take`)}
                    className="btn-primary py-2 px-3.5 text-xs gap-1.5"
                  >
                    <span>Take Exam</span>
                    <IconArrowRight className="w-3.5 h-3.5" />
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
                  <h3 className="text-lg font-bold text-slate-900">AI Exam Generator</h3>
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
                  Target Subject *
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setForm({ ...form, difficulty: diff })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                        form.difficulty === diff
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    className="input-field"
                    value={form.totalQuestions}
                    onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    className="input-field"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerate(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary gap-2">
                  <IconSparkles className="w-4 h-4" />
                  <span>Generate Paper</span>
                </button>
              </div>
            </form>
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
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Practice Paper?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              This will permanently delete this practice paper. Past exam submissions will be retained.
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
