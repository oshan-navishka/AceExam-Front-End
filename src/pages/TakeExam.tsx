import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPaperById } from '../store/slices/paperSlice';
import { submitExam } from '../store/slices/resultSlice';
import { SubmitAnswerItem } from '../types';
import {
  IconClock,
  IconCheckCircle,
  IconArrowRight
} from '../components/common/Icons';

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
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [paper, submitted]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="spinner w-9 h-9" />
        <p className="text-sm text-slate-400 font-medium">Preparing test environment...</p>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / paper.questions.length) * 100);
  const isUrgent = timeLeft < 300;
  const isWarning = timeLeft < 600 && !isUrgent;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Sticky Exam Top Bar */}
      <div className="sticky top-20 z-10 card shadow-soft-md backdrop-blur-xl bg-white/95 border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <span className="badge-primary text-[11px] mb-1">
              {(paper.subjectId as any)?.name || 'Subject Exam'}
            </span>
            <h2 className="text-lg font-bold text-slate-900 truncate">{paper.title}</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress Count */}
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Progress
              </p>
              <p className="text-base font-bold text-slate-800">
                {answered} / {paper.questions.length}
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isUrgent
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : isWarning
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                <IconClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Remaining
                </p>
                <p
                  className={`text-xl font-mono font-bold leading-none ${
                    isUrgent
                      ? 'text-rose-600'
                      : isWarning
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}
                >
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-5">
        {paper.questions.map((q, idx) => {
          const isAnswered = Boolean(answers[idx]);

          return (
            <div
              key={idx}
              className={`card transition-all duration-200 ${
                isAnswered
                  ? 'border-indigo-200 ring-1 ring-indigo-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isAnswered
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {q.type}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">
                    {q.question}
                  </p>
                </div>
              </div>

              {/* Options for MCQ */}
              {q.type === 'mcq' && q.options.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:ml-11">
                  {q.options.map((opt, oi) => {
                    const selected = answers[idx] === opt;
                    return (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-150 ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={selected}
                          onChange={() => setAnswers({ ...answers, [idx]: opt })}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="flex-1">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="sm:ml-11">
                  <textarea
                    className="input-field resize-none"
                    rows={q.type === 'essay' ? 6 : 3}
                    placeholder={
                      q.type === 'essay'
                        ? 'Type your comprehensive response here...'
                        : 'Type your answer here...'
                    }
                    value={answers[idx] || ''}
                    onChange={e => setAnswers({ ...answers, [idx]: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Footer Card */}
      <div className="card flex items-center justify-between gap-4 flex-wrap bg-slate-900 text-white border-slate-800 shadow-xl">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-white">
            {paper.questions.length - answered === 0 ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <IconCheckCircle className="w-4 h-4" /> All questions completed!
              </span>
            ) : (
              <span>
                {paper.questions.length - answered} question
                {paper.questions.length - answered !== 1 ? 's' : ''} left unanswered
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400">
            Once submitted, Gemini AI will automatically grade and analyze your results.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="btn-primary py-3 px-6 text-sm font-semibold gap-2 shadow-lg shadow-indigo-500/30"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI Grading in progress...</span>
            </>
          ) : (
            <>
              <span>Submit & View Results</span>
              <IconArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
