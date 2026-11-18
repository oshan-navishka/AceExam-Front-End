import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchResults, deleteResult } from '../store/slices/resultSlice';
import {
  IconTrophy,
  IconTrash,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconAlertTriangle,
  IconSparkles
} from '../components/common/Icons';

export default function Results() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { results, isLoading } = useAppSelector(s => s.results);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    await dispatch(deleteResult(id));
    setDeleteConfirm(null);
  };

  const getScoreBadgeClass = (p: number) => {
    if (p >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (p >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const formatTime = (s: number) =>
    s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Exam Results & Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review detailed AI performance evaluations, strength indicators, and correction notes
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="spinner w-9 h-9" />
          <p className="text-sm text-slate-400">Loading your exam records...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconTrophy className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No exam results recorded</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Take a practice paper to get automatic evaluation, personalized feedback, and AI strength diagnostics.
          </p>
          <button
            onClick={() => navigate('/papers')}
            className="btn-primary mt-5 gap-2"
          >
            <IconSparkles className="w-4 h-4" /> Start Practice Exam
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => {
            const paper = result.paperId as any;
            const subject = result.subjectId as any;

            return (
              <div
                key={result._id}
                onClick={() => navigate(`/results/${result._id}`)}
                className="card group hover:border-indigo-300 hover:shadow-soft-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Score Pill */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl shrink-0 border shadow-soft-sm ${getScoreBadgeClass(
                      result.percentage
                    )}`}
                  >
                    <span>{result.percentage}%</span>
                    <span className="text-[10px] uppercase font-semibold">Score</span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                        {paper?.title || 'Practice Paper'}
                      </h3>
                      <span className="badge-primary text-[11px] py-0.5">
                        {subject?.name || 'Subject'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="font-medium text-slate-700">
                        Marks: {result.marksObtained} / {result.totalMarks}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconClock className="w-3.5 h-3.5 text-slate-400" />
                        Time: {formatTime(result.timeTaken)}
                      </span>
                      <span>
                        Submitted:{' '}
                        {new Date(result.submittedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {result.aiAnalysis?.strongAreas && result.aiAnalysis.strongAreas.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Strong in: {result.aiAnalysis.strongAreas.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side arrow & delete button */}
                <div className="flex items-center gap-3 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Full Analysis</span>
                    <IconArrowRight className="w-4 h-4" />
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteConfirm(result._id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete result record"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Result Entry?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              This will remove this result record and its AI diagnostics from your analytics history.
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
