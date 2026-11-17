import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPaperById } from '../store/slices/paperSlice';
import { submitExam } from '../store/slices/resultSlice';
import { SubmitAnswerItem } from '../types';

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: paper, isLoading: paperLoading } = useAppSelector(s => s.papers);
  const { isLoading: submitting } = useAppSelector(s => s.results);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (id) dispatch(fetchPaperById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (paper) {
      setTimeLeft(paper.duration * 60);
      startTime.current = Date.now();
    }
  }, [paper]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [paper, submitted]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!paper || submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    const payload: SubmitAnswerItem[] = paper.questions.map((_, idx) => ({
      questionIndex: idx,
      studentAnswer: answers[idx] || '',
    }));
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const res = await dispatch(submitExam({ paperId: paper._id, answers: payload, timeTaken }));
    if (submitExam.fulfilled.match(res)) {
      navigate(`/results/${res.payload._id}`);
    }
  };

  if (paperLoading || !paper) {
    return <div className="flex justify-center items-center h-64"><div className="spinner w-10 h-10" /></div>;
  }

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / paper.questions.length) * 100);
  const timerColor = timeLeft < 300 ? 'text-red-600' : timeLeft < 600 ? 'text-yellow-600' : 'text-gray-700';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{paper.title}</h2>
            <p className="text-sm text-gray-400">{(paper.subjectId as any)?.name} · {paper.totalQuestions} questions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-2xl font-mono font-bold ${timerColor}`}>{formatTime(timeLeft)}</p>
              <p className="text-xs text-gray-400">remaining</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">{answered}/{paper.questions.length}</p>
              <p className="text-xs text-gray-400">answered</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {paper.questions.map((q, idx) => (
          <div key={idx} className={`card border-l-4 ${answers[idx] ? 'border-green-400' : 'border-gray-200'}`}>
            <div className="flex items-start gap-3 mb-3">
              <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : q.type === 'essay' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                    {q.type.toUpperCase()} · {q.marks} mark{q.marks !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{q.question}</p>
              </div>
            </div>

            {q.type === 'mcq' && q.options.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${answers[idx] === opt ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}>
                    <input type="radio" name={`q-${idx}`} value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => setAnswers({ ...answers, [idx]: opt })}
                      className="accent-primary-600" />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="ml-10 w-[calc(100%-2.5rem)] input-field resize-none"
                rows={q.type === 'essay' ? 6 : 3}
                placeholder={q.type === 'essay' ? 'Write your detailed answer here...' : 'Write your answer here...'}
                value={answers[idx] || ''}
                onChange={e => setAnswers({ ...answers, [idx]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="card flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-500">{paper.questions.length - answered} question{paper.questions.length - answered !== 1 ? 's' : ''} unanswered</p>
        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="btn-primary px-8 py-3 flex items-center gap-2"
        >
          {submitting ? <><span className="spinner w-4 h-4" />Evaluating with AI...</> : '📤 Submit Exam'}
        </button>
      </div>
    </div>
  );
}
