import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchResultById } from '../store/slices/resultSlice';

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: result, isLoading } = useAppSelector(s => s.results);

  useEffect(() => { if (id) dispatch(fetchResultById(id)); }, [id, dispatch]);

  if (isLoading || !result) return <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>;

  const pct = result.percentage;
  const paper = result.paperId as any;
  const subject = result.subjectId as any;
  const scoreColor = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = pct >= 70 ? 'from-green-500 to-emerald-600' : pct >= 50 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/results')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        ← Back to Results
      </button>

      {/* Score card */}
      <div className={`bg-gradient-to-r ${scoreBg} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/80 text-sm">{subject?.name}</p>
            <h2 className="text-2xl font-bold">{paper?.title || 'Practice Paper'}</h2>
            <p className="text-white/70 text-sm mt-1">{new Date(result.submittedAt).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-black">{pct}%</p>
            <p className="text-white/80 text-sm">{result.marksObtained}/{result.totalMarks} marks</p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {result.aiAnalysis && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🤖</span> AI Feedback
          </h3>
          {result.aiAnalysis.summary && (
            <p className="text-gray-600 text-sm mb-4 p-3 bg-gray-50 rounded-xl">{result.aiAnalysis.summary}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-2">💪 Strong Areas</p>
              {result.aiAnalysis.strongAreas?.length > 0 ? (
                <ul className="space-y-1">
                  {result.aiAnalysis.strongAreas.map((a, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-1.5"><span>✓</span>{a}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-green-600 opacity-60">Keep practicing!</p>}
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm font-semibold text-red-800 mb-2">📌 Needs Work</p>
              {result.aiAnalysis.weakAreas?.length > 0 ? (
                <ul className="space-y-1">
                  {result.aiAnalysis.weakAreas.map((a, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-1.5"><span>→</span>{a}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-red-600 opacity-60">Great job overall!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Question breakdown */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">Question Breakdown</h3>
        {result.answers.map((ans, idx) => (
          <div key={idx} className={`card border-l-4 ${ans.isCorrect ? 'border-green-400' : 'border-red-400'}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {idx + 1}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ans.questionType === 'mcq' ? 'bg-blue-100 text-blue-700' : ans.questionType === 'essay' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {ans.questionType}
                </span>
              </div>
              <span className={`text-sm font-semibold ${ans.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                {ans.marksAwarded}/{ans.maxMarks} pts
              </span>
            </div>

            <p className="text-sm font-medium text-gray-900 mb-2">{ans.question}</p>

            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">Your answer:</span>
                <span className={ans.isCorrect ? 'text-green-700' : 'text-red-600'}>{ans.studentAnswer || <em>No answer</em>}</span>
              </div>
              {!ans.isCorrect && ans.correctAnswer && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">Correct:</span>
                  <span className="text-green-700">{ans.correctAnswer}</span>
                </div>
              )}
              {ans.aiFeedback && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-blue-700 text-xs">
                  🤖 {ans.aiFeedback}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
