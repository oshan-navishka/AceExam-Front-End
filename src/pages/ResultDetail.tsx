import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchResultById } from '../store/slices/resultSlice';
import {
  IconArrowLeft,
  IconSparkles,
  IconAlertTriangle,
  IconBrain,
  IconCheck
} from '../components/common/Icons';

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: result, isLoading } = useAppSelector(s => s.results);

  useEffect(() => {
    if (id) dispatch(fetchResultById(id));
  }, [id, dispatch]);

  if (isLoading || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="spinner w-9 h-9" />
        <p className="text-sm text-slate-400">Loading evaluation report...</p>
      </div>
    );
  }

  const pct = result.percentage;
  const paper = result.paperId as any;
  const subject = result.subjectId as any;

  const scoreBg =
    pct >= 75
      ? 'from-emerald-600 via-teal-700 to-indigo-900'
      : pct >= 50
      ? 'from-amber-600 via-orange-600 to-indigo-950'
      : 'from-rose-600 via-rose-700 to-slate-900';

  const getGradeLabel = (p: number) => {
    if (p >= 85) return 'Grade A (Distinction)';
    if (p >= 75) return 'Grade B (Proficient)';
    if (p >= 50) return 'Grade C (Passing)';
    return 'Needs Comprehensive Revision';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/results')}
          className="btn-ghost gap-2 text-xs font-semibold text-slate-600"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </button>
      </div>

      {/* Score Card Hero */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${scoreBg} rounded-3xl p-6 sm:p-8 text-white shadow-soft-xl`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
              {subject?.name || 'Subject Evaluation'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-1">
              {paper?.title || 'Practice Examination'}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm">
              Completed on{' '}
              {new Date(result.submittedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-xl bg-black/20 text-xs font-semibold">
                {getGradeLabel(pct)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-5xl sm:text-6xl font-black tracking-tight">{pct}%</p>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              {result.marksObtained} / {result.totalMarks} Marks Scored
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Diagnostic */}
      {result.aiAnalysis && (
        <div className="card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconBrain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Diagnostic Evaluation</h3>
              <p className="text-xs text-slate-400">Automated performance summary by Gemini</p>
            </div>
          </div>

          {result.aiAnalysis.summary && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 text-slate-700 text-sm leading-relaxed">
              {result.aiAnalysis.summary}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strong Areas */}
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <IconCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Mastered Concepts</h4>
              </div>
              {result.aiAnalysis.strongAreas?.length > 0 ? (
                <ul className="space-y-2">
                  {result.aiAnalysis.strongAreas.map((a, i) => (
                    <li key={i} className="text-xs font-medium text-emerald-800 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600/80">Continue practicing to identify strong topics.</p>
              )}
            </div>

            {/* Weak Areas */}
            <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <IconAlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-rose-900">Revision Recommended</h4>
              </div>
              {result.aiAnalysis.weakAreas?.length > 0 ? (
                <ul className="space-y-2">
                  {result.aiAnalysis.weakAreas.map((a, i) => (
                    <li key={i} className="text-xs font-medium text-rose-800 flex items-start gap-2">
                      <span className="text-rose-500 font-bold">&bull;</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-rose-600/80">No major weaknesses identified. Great mastery!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question by Question Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Detailed Answer Review</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
            {result.answers.length} Questions
          </span>
        </div>

        {result.answers.map((ans, idx) => (
          <div
            key={idx}
            className={`card transition-all ${
              ans.isCorrect
                ? 'border-emerald-200 bg-white ring-1 ring-emerald-50'
                : 'border-rose-200 bg-white ring-1 ring-rose-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    ans.isCorrect
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {ans.questionType}
                </span>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  ans.isCorrect
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {ans.marksAwarded} / {ans.maxMarks} Marks
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900 mb-3">{ans.question}</p>

            {/* Answer Comparison */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-500 shrink-0 w-24">Your Answer:</span>
                <span
                  className={`font-medium ${
                    ans.isCorrect ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {ans.studentAnswer || <em className="text-slate-400">Not Answered</em>}
                </span>
              </div>

              {!ans.isCorrect && ans.correctAnswer && (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-500 shrink-0 w-24">Correct Answer:</span>
                  <span className="font-medium text-emerald-700">{ans.correctAnswer}</span>
                </div>
              )}
            </div>

            {/* AI Explanation feedback */}
            {ans.aiFeedback && (
              <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
                <IconSparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  <strong className="text-indigo-900 block font-semibold mb-0.5">AI Explanation:</strong>
                  {ans.aiFeedback}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
