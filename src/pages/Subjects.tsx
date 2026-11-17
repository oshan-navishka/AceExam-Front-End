import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../store/slices/subjectSlice';
import { SubjectPayload } from '../types';

const emptyForm: SubjectPayload = { name: '', code: '', description: '' };

export default function Subjects() {
  const dispatch = useAppDispatch();
  const { subjects, isLoading, error } = useAppSelector(s => s.subjects);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchSubjects()); }, [dispatch]);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (s: any) => { setForm({ name: s.name, code: s.code, description: s.description }); setEditId(s._id); setShowModal(true); };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subjects</h2>
          <p className="text-sm text-gray-500">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Subject
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
      ) : subjects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold text-gray-700">No subjects yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first subject to get started</p>
          <button onClick={openCreate} className="btn-primary mt-4">Add Subject</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(s => (
            <div key={s._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm">✏️</button>
                  <button onClick={() => setDeleteConfirm(s._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">🗑️</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <p className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded mt-1 inline-block">{s.code}</p>
              {s.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.description}</p>}
              <p className="text-xs text-gray-400 mt-3">Added {new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit Subject' : 'Add Subject'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input className="input-field" placeholder="e.g. Mathematics" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                <input className="input-field" placeholder="e.g. MATH101" value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Optional description..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editId ? 'Save Changes' : 'Add Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold text-gray-900 mb-2">Delete Subject?</h3>
            <p className="text-sm text-gray-500 mb-5">This will remove the subject and all related data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
