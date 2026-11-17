import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExams, createExam, updateExam, deleteExam } from '../store/slices/examSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { ExamPayload } from '../types';

const emptyForm: ExamPayload = { title: '', subjectId: '', examDate: '', venue: '', duration: 120, notes: '' };

export default function Exams() {
  const dispatch = useAppDispatch();
  const { exams, isLoading } = useAppSelector(s => s.exams);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => { dispatch(fetchExams()); dispatch(fetchSubjects()); }, [dispatch]);

  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.examDate) >= now).sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  const past = exams.filter(e => new Date(e.examDate) < now).sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  const displayed = tab === 'upcoming' ? upcoming : past;

  const openEdit = (exam: any) => {
    setForm({
      title: exam.title, subjectId: exam.subjectId?._id || exam.subjectId,
      examDate: exam.examDate.slice(0, 16), venue: exam.venue,
      duration: exam.duration, notes: exam.notes,
    });
    setEditId(exam._id); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await dispatch(updateExam({ id: editId, data: form }));
    else await dispatch(createExam(form));
    setShowModal(false);
  };

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exams</h2>
          <p className="text-sm text-gray-500">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <span>+</span> Schedule Exam
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['upcoming', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold text-gray-700">{tab === 'upcoming' ? 'No upcoming exams' : 'No past exams'}</p>
          {tab === 'upcoming' && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Schedule Exam</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(exam => {
            const sub = exam.subjectId as any;
            const days = daysUntil(exam.examDate);
            const isUpcoming = days >= 0;
            return (
              <div key={exam._id} className="card hover:shadow-md transition-shadow flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isUpcoming ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <span className={`text-lg font-bold ${isUpcoming ? 'text-primary-700' : 'text-gray-500'}`}>{isUpcoming ? days : Math.abs(days)}</span>
                  <span className={`text-[10px] ${isUpcoming ? 'text-primary-500' : 'text-gray-400'}`}>{isUpcoming ? 'days' : 'ago'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(exam)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm">✏️</button>
                      <button onClick={() => setDeleteConfirm(exam._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{sub?.name || 'Unknown Subject'} · {new Date(exam.examDate).toLocaleString()}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    {exam.venue && <span>📍 {exam.venue}</span>}
                    <span>⏱ {exam.duration} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit Exam' : 'Schedule Exam'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                <input className="input-field" placeholder="e.g. Mid-Term Mathematics" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select className="input-field" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date & Time *</label>
                <input type="datetime-local" className="input-field" value={form.examDate}
                  onChange={e => setForm({ ...form, examDate: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input className="input-field" placeholder="Hall A" value={form.venue}
                    onChange={e => setForm({ ...form, venue: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" className="input-field" value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Any additional notes..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editId ? 'Save' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold mb-2">Delete this exam?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={async () => { await dispatch(deleteExam(deleteConfirm)); setDeleteConfirm(null); }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
