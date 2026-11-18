import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExams, createExam, updateExam, deleteExam } from '../store/slices/examSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { ExamPayload } from '../types';
import {
  IconCalendar,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconCalendarCheck
} from '../components/common/Icons';

const emptyForm: ExamPayload = {
  title: '',
  subjectId: '',
  examDate: '',
  venue: '',
  duration: 120,
  notes: '',
};

export default function Exams() {
  const dispatch = useAppDispatch();
  const { exams, isLoading } = useAppSelector(s => s.exams);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => {
    dispatch(fetchExams());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const now = new Date();
  const upcoming = exams
    .filter(e => new Date(e.examDate) >= now)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  const past = exams
    .filter(e => new Date(e.examDate) < now)
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  const displayed = tab === 'upcoming' ? upcoming : past;

  const openEdit = (exam: any) => {
    setForm({
      title: exam.title,
      subjectId: exam.subjectId?._id || exam.subjectId,
      examDate: exam.examDate.slice(0, 16),
      venue: exam.venue,
      duration: exam.duration,
      notes: exam.notes,
    });
    setEditId(exam._id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await dispatch(updateExam({ id: editId, data: form }));
    } else {
      await dispatch(createExam(form));
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteExam(id));
    setDeleteConfirm(null);
  };

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Exam Timetable</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track test dates, venues, and countdowns to plan revision
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setShowModal(true);
          }}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <IconPlus className="w-4 h-4" />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/60">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 ${
            tab === 'upcoming'
              ? 'bg-white text-slate-900 shadow-soft-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Upcoming Exams</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              tab === 'upcoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {upcoming.length}
          </span>
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 ${
            tab === 'all'
              ? 'bg-white text-slate-900 shadow-soft-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past Exams</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              tab === 'all' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/60 text-slate-600'
            }`}
          >
            {past.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="spinner w-9 h-9" />
          <p className="text-sm text-slate-400">Loading exams...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconCalendar className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">
            {tab === 'upcoming' ? 'No upcoming exams scheduled' : 'No past exams found'}
          </h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {tab === 'upcoming'
              ? 'Add an upcoming test date to keep your study sessions targeted and on time'
              : 'Completed exams will be preserved here for your historical records'}
          </p>
          {tab === 'upcoming' && (
            <button
              onClick={() => {
                setForm(emptyForm);
                setEditId(null);
                setShowModal(true);
              }}
              className="btn-primary mt-5 gap-2"
            >
              <IconPlus className="w-4 h-4" /> Schedule Exam
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(exam => {
            const sub = exam.subjectId as any;
            const days = daysUntil(exam.examDate);
            const isUpcoming = days >= 0;
            const isUrgent = isUpcoming && days <= 3;

            return (
              <div
                key={exam._id}
                className="card hover:border-indigo-200 hover:shadow-soft-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Countdown Pill */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border font-bold ${
                      isUrgent
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : isUpcoming
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-lg leading-tight">
                      {isUpcoming ? days : Math.abs(days)}
                    </span>
                    <span className="text-[10px] uppercase font-semibold">
                      {isUpcoming ? (days === 1 ? 'day' : 'days') : 'ago'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{exam.title}</h3>
                      <span className="badge-primary text-[11px] py-0.5">
                        {sub?.name || 'General Subject'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <IconCalendar className="w-4 h-4 text-slate-400" />
                        {new Date(exam.examDate).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {exam.venue && (
                        <span className="flex items-center gap-1.5">
                          <IconMapPin className="w-4 h-4 text-slate-400" />
                          {exam.venue}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <IconClock className="w-4 h-4 text-slate-400" />
                        {exam.duration} mins
                      </span>
                    </div>

                    {exam.notes && (
                      <p className="text-xs text-slate-400 italic pt-1 line-clamp-1">
                        "{exam.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => openEdit(exam)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit exam"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(exam._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete exam"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconCalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editId ? 'Edit Exam' : 'Schedule New Exam'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Exam Title *
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Midterm Examination"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Subject *
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
                    Exam Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={form.examDate}
                    onChange={e => setForm({ ...form, examDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Venue / Room
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Hall B / Online"
                    value={form.venue}
                    onChange={e => setForm({ ...form, venue: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className="input-field"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notes or Instructions
                </label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="e.g. Bring calculator and student ID..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editId ? 'Update Exam' : 'Schedule Exam'}
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
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Scheduled Exam?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              This will remove this exam date from your timetable and calendar notifications.
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
