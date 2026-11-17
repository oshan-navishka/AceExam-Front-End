import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNotes, uploadNote, deleteNote } from '../store/slices/noteSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Notes() {
  const dispatch = useAppDispatch();
  const { notes, isLoading, error } = useAppSelector(s => s.notes);
  const { subjects } = useAppSelector(s => s.subjects);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', subjectId: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { dispatch(fetchNotes()); dispatch(fetchSubjects()); }, [dispatch]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('title', uploadForm.title);
    fd.append('subjectId', uploadForm.subjectId);
    fd.append('pdf', selectedFile);
    await dispatch(uploadNote(fd));
    setShowUpload(false); setSelectedFile(null); setUploadForm({ title: '', subjectId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Study Notes</h2>
          <p className="text-sm text-gray-500">{notes.length} PDF{notes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Upload PDF
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
      ) : notes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-semibold text-gray-700">No notes uploaded yet</p>
          <p className="text-gray-400 text-sm mt-1">Upload your PDF notes to extract text for AI study</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">Upload PDF</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => {
            const sub = note.subjectId as any;
            return (
              <div key={note._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">📄</div>
                  <div className="flex gap-1">
                    <button onClick={() => setPreview({ title: note.title, text: note.extractedText })}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm" title="Preview">👁️</button>
                    <button onClick={() => setDeleteConfirm(note._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                <p className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded mt-1 inline-block">{sub?.name || 'Unknown'}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <p>📁 {note.fileName}</p>
                  <p>💾 {formatBytes(note.fileSize)}</p>
                  <p>📅 {new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
                {note.extractedText && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">"{note.extractedText.slice(0, 80)}..."</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Upload PDF Note</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className="input-field" placeholder="Chapter 1 Notes" value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select className="input-field" value={uploadForm.subjectId}
                  onChange={e => setUploadForm({ ...uploadForm, subjectId: e.target.value })} required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
              >
                <p className="text-3xl mb-2">📄</p>
                {selectedFile ? (
                  <p className="text-sm font-medium text-primary-700">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">Drop PDF here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PDF only · Max 20MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={!selectedFile || isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isLoading ? <><span className="spinner w-4 h-4" />Extracting...</> : 'Upload & Extract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 bg-gray-50 rounded-xl p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{preview.text || 'No text extracted from this PDF.'}</pre>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center w-full max-w-sm">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold mb-2">Delete this note?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={async () => { await dispatch(deleteNote(deleteConfirm)); setDeleteConfirm(null); }} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
