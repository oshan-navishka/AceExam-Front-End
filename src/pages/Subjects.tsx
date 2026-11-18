import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../store/slices/subjectSlice';
import { SubjectPayload } from '../types';
import {
  IconBookOpen,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconAlertTriangle,
  IconSearch
} from '../components/common/Icons';

const emptyForm: SubjectPayload = { name: '', code: '', description: '' };

const subjectColors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
];

export default function Subjects() {
  const dispatch = useAppDispatch();
  const { subjects, isLoading, error } = useAppSelector(s => s.subjects);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setForm({ name: s.name, code: s.code, description: s.description });
    setEditId(s._id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await dispatch(updateSubject({ id: editId, data: form }));
    } else {
      await dispatch(createSubject(form));
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteSubject(id));
    setDeleteConfirm(null);
  };

  const filteredSubjects = subjects.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Enrolled Subjects</h2>
          <p className="text-sm text-slate-500 mt-1">
            Organize notes, practice exams, and analytics by subject
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2 self-start sm:self-auto">
          <IconPlus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by subject name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold px-3 py-2 bg-slate-100 rounded-xl text-slate-600">
          {filteredSubjects.length} of {subjects.length}
        </span>
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
          <p className="text-sm text-slate-400">Loading subjects...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconBookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">
            {searchQuery ? 'No matching subjects found' : 'No subjects registered yet'}
          </h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords'
              : 'Add your courses to begin uploading notes and generating AI practice papers'}
          </p>
          {!searchQuery && (
            <button onClick={openCreate} className="btn-primary mt-5 gap-2">
              <IconPlus className="w-4 h-4" /> Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((s, index) => {
            const gradientColor = subjectColors[index % subjectColors.length];
            return (
              <div
                key={s._id}
                className="card group hover:border-indigo-200 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Edit subject"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete subject"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {s.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {s.code}
                    </span>
                  </div>

                  {s.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Added {new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    Active &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconBookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editId ? 'Edit Subject' : 'Add New Subject'}
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
                  Subject Name *
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Distributed Systems"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject Code *
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. CS401"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Overview of syllabus, modules, or key focus areas..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
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
                  {editId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Subject?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this subject? Linked exams and papers may be affected.
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
