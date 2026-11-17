import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchResults, deleteResult } from '../store/slices/resultSlice';

export default function Results() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { results, isLoading } = useAppSelector(s => s.results);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchResults()); }, [dispatch]);

  const scoreColor = (p: number) => p >= 70 ? 'text-green-700 bg-green-50' : p >= 50 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';
  const scoreBorder = (p: number) => p >= 70 ? 'border-green-200' : p >= 50 ? 'border-yellow-200' : 'border-red-200';

  const formatTime = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exam Results</h2>
          <p className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
      ) : results.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-semibold text-gray-700">No results yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete a practice paper to see your results with AI feedback</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => {
            const paper = result.paperId as any;
            const subject = result.subjectId as any;
            return (
              <div key={result._id} className={`card border ${scoreBorder(result.percentage)} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => navigate(`/results/${result._id}`)}>
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${scoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{paper?.title || 'Practice Paper'}</h3>
                        <p className="text-sm text-gray-400">{subject?.name} · {new Date(result.submittedAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteConfirm(result._id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm shrink-0"
                      >🗑️</button>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>✅ {result.marksObtained}/{result.totalMarks} marks</span>
                      <span>⏱ {formatTime(result.timeTaken)}</span>
                      {result.aiAnalysis?.strongAreas?.length > 0 && (
                        <span className="text-green-600">💪 Strong: {result.aiAnalysis.strongAreas.slice(0, 2).join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold mb-2">Delete this result?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={async () => { await dispatch(deleteResult(deleteConfirm)); setDeleteConfirm(null); }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
