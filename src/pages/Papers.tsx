import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPapers, generatePaper, deletePaper } from '../store/slices/paperSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { GeneratePaperPayload } from '../types';

const emptyForm: GeneratePaperPayload = {
  subjectId: '', difficulty: 'medium', totalQuestions: 10, duration: 60, questionTypes: ['mcq'],
};

export default function Papers() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { papers, isLoading, error } = useAppSelector(s => s.papers);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showGenerate, setShowGenerate] = useState(false);
  const [form, setForm] = useState<GeneratePaperPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchPapers()); dispatch(fetchSubjects()); }, [dispatch]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(generatePaper(form));
    if (generatePaper.fulfilled.match(result)) {
      setShowGenerate(false);
      navigate(`/papers/${result.payload._id}/take`);
    }
  };

  const diffBadge = (d: string) => {
    if (d === 'easy') return 'badge-easy';
    if (d === 'hard') return 'badge-hard';
    return 'badge-medium';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Practice Papers</h2>
          <p className="text-sm text-gray-500">{papers.length} paper{papers.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary flex items-center gap-2">
          <span>✨</span> Generate Paper
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="spinner w-10 h-10" />
          <p className="text-sm text-gray-400">AI is generating your paper...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-semibold text-gray-700">No practice papers yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate AI-powered practice papers from your notes</p>
          <button onClick={() => setShowGenerate(true)} className="btn-primary mt-4">Generate Paper</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map(paper => {
            const sub = paper.subjectId as any;
            return (
              <div key={paper._id} className="card hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">📝</div>
                  <button onClick={() => setDeleteConfirm(paper._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{paper.title}</h3>
                <p className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded mt-1 inline-block w-fit">{sub?.name || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={diffBadge(paper.difficulty)}>{paper.difficulty}</span>
                  <span className="text-xs text-gray-400">{paper.totalQuestions} questions</span>
                  <span className="text-xs text-gray-400">· {paper.duration}min</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(paper.createdAt).toLocaleDateString()}</p>
                <div className="mt-auto pt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/papers/${paper._id}/take`)}
                    className="btn-primary flex-1 py-1.5 text-sm"
                  >
                    Take Exam
                  </button>
                </div>
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
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✨</div>
              <div>
                <h3 className="font-bold text-gray-900">Generate Practice Paper</h3>
                <p className="text-xs text-gray-400">AI-powered by Google Gemini</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button key={d} type="button"
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${form.difficulty === d ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
                  <input type="number" min={5} max={30} className="input-field" value={form.totalQuestions}
                    onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" min={15} max={180} className="input-field" value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                </div>
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold mb-2">Delete this paper?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={async () => { await dispatch(deletePaper(deleteConfirm)); setDeleteConfirm(null); }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
