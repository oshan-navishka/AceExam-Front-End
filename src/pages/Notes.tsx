import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNotes, uploadNote, deleteNote } from '../store/slices/noteSlice';
import { fetchSubjects } from '../store/slices/subjectSlice';
import { noteService } from '../services/noteService';
import { Note } from '../types';
import {
  IconFileText,
  IconEye,
  IconTrash,
  IconX,
  IconUploadCloud,
  IconAlertTriangle,
  IconCheckCircle,
  IconDownload,
  IconExternalLink,
  IconArrowRight,
} from '../components/common/Icons';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
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

  // PDF Viewer state
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [viewTab, setViewTab] = useState<'pdf' | 'text'>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [noteExtractedText, setNoteExtractedText] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchSubjects());
  }, [dispatch]);

  // Handle PDF blob fetching when viewingNote changes
  useEffect(() => {
    if (!viewingNote) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      setPdfError(null);
      setPdfLoading(false);
      setNoteExtractedText('');
      return;
    }

    let active = true;
    setPdfLoading(true);
    setPdfError(null);
    setViewTab('pdf');

    // Fetch PDF blob
    noteService
      .getPdfBlob(viewingNote._id)
      .then((res) => {
        if (!active) return;
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setPdfLoading(false);
      })
      .catch(async (err) => {
        if (!active) return;
        console.error('Error fetching note PDF:', err);
        let msg = 'Failed to load PDF file from server';
        if (err.response?.data instanceof Blob) {
          try {
            const raw = await err.response.data.text();
            const j = JSON.parse(raw);
            if (j.message) msg = j.message;
          } catch {
            // fallback
          }
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        }
        setPdfError(msg);
        setPdfLoading(false);
      });

    // Populate extracted text
    if (viewingNote.extractedText) {
      setNoteExtractedText(viewingNote.extractedText);
    } else {
      setLoadingText(true);
      noteService
        .getById(viewingNote._id)
        .then((res) => {
          if (!active) return;
          setNoteExtractedText(res.data.note?.extractedText || 'No text extracted yet.');
        })
        .catch(() => {
          if (!active) return;
          setNoteExtractedText('Failed to load extracted text.');
        })
        .finally(() => {
          if (active) setLoadingText(false);
        });
    }

    return () => {
      active = false;
    };
  }, [viewingNote]);

  const handleOpenPdf = (note: Note) => {
    setViewingNote(note);
  };

  const handleOpenInNewTab = async (note: Note) => {
    try {
      if (viewingNote?._id === note._id && pdfBlobUrl) {
        window.open(pdfBlobUrl, '_blank');
        return;
      }
      const res = await noteService.getPdfBlob(note._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      const directUrl = noteService.getPdfUrl(note._id);
      window.open(directUrl, '_blank');
    }
  };

  const handleDownload = async (note: Note) => {
    try {
      let downloadUrl = pdfBlobUrl;
      let shouldRevoke = false;
      if (!downloadUrl || viewingNote?._id !== note._id) {
        const res = await noteService.getPdfBlob(note._id);
        const blob = new Blob([res.data], { type: 'application/pdf' });
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      }
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = note.fileName || `${note.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl!), 1000);
      }
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('title', uploadForm.title);
    fd.append('subjectId', uploadForm.subjectId);
    fd.append('pdf', selectedFile);

    await dispatch(uploadNote(fd));
    setShowUpload(false);
    setSelectedFile(null);
    setUploadForm({ title: '', subjectId: '' });
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteNote(id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Course Notes & Materials</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload PDF lecture slides & textbook chapters for AI knowledge extraction
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          <IconUploadCloud className="w-4 h-4" />
          <span>Upload PDF Notes</span>
        </button>
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
          <p className="text-sm text-slate-400">Loading your notes repository...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <IconFileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No notes uploaded yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Upload your lecture notes in PDF format. The AI will extract the content to generate practice questions and customized study guides.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary mt-5 gap-2"
          >
            <IconUploadCloud className="w-4 h-4" /> Upload First PDF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map(note => {
            const sub = note.subjectId as any;
            return (
              <div
                key={note._id}
                className="card group hover:border-indigo-200 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <IconFileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPdf(note)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="View PDF Document"
                      >
                        <IconEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenInNewTab(note)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Open PDF in new tab"
                      >
                        <IconExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(note._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete note"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="mt-1.5">
                    <span className="badge-primary text-[11px] py-0.5">
                      {sub?.name || 'General Material'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-400 font-mono">
                    <p className="truncate">File: {note.fileName}</p>
                    <p>Size: {formatBytes(note.fileSize)}</p>
                  </div>

                  {note.extractedText ? (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                        "{note.extractedText.slice(0, 140)}..."
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-3">Text extraction pending...</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Uploaded {new Date(note.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleOpenPdf(note)}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View PDF</span>
                    <IconArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconUploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Upload PDF Note</h3>
              </div>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Document Title *
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Chapter 4 - Memory Management"
                  value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Associated Subject *
                </label>
                <select
                  className="input-field"
                  value={uploadForm.subjectId}
                  onChange={e => setUploadForm({ ...uploadForm, subjectId: e.target.value })}
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

              {/* Drag and Drop Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  PDF File *
                </label>
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : selectedFile
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3 text-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <IconCheckCircle className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <IconUploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click or drag & drop your PDF here
                      </p>
                      <p className="text-xs text-slate-400">PDF documents up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="btn-primary"
                >
                  Upload & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF & Extracted Text Viewer Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-3 gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <IconFileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {viewingNote.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                    <span className="truncate">{viewingNote.fileName}</span>
                    <span>•</span>
                    <span>{formatBytes(viewingNote.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Controls and Tabs */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* View Tabs */}
                <div className="inline-flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewTab('pdf')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewTab === 'pdf'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    onClick={() => setViewTab('text')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewTab === 'text'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Extracted Text
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden sm:block mx-0.5" />

                {/* Open in new tab */}
                <button
                  onClick={() => handleOpenInNewTab(viewingNote)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Open in new browser tab"
                >
                  <IconExternalLink className="w-4 h-4" />
                  <span className="hidden md:inline">Open in Tab</span>
                </button>

                {/* Download */}
                <button
                  onClick={() => handleDownload(viewingNote)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Download PDF"
                >
                  <IconDownload className="w-4 h-4" />
                  <span className="hidden md:inline">Download</span>
                </button>

                {/* Close */}
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Close viewer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 min-h-0 relative">
              {viewTab === 'pdf' ? (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                  {pdfLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                      <div className="spinner w-8 h-8 text-indigo-600" />
                      <p className="text-sm font-medium text-slate-600">Loading PDF document...</p>
                    </div>
                  ) : pdfError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                        <IconAlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">Could not display PDF</h4>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">{pdfError}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenInNewTab(viewingNote)}
                          className="btn-primary text-xs gap-1.5"
                        >
                          <IconExternalLink className="w-3.5 h-3.5" />
                          <span>Try in New Tab</span>
                        </button>
                        <button
                          onClick={() => setViewTab('text')}
                          className="btn-secondary text-xs"
                        >
                          View Extracted Text
                        </button>
                      </div>
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      title={viewingNote.title}
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed select-text">
                  {loadingText ? (
                    <div className="flex items-center justify-center h-full gap-2 text-slate-400">
                      <div className="spinner w-5 h-5" />
                      <span>Loading extracted text...</span>
                    </div>
                  ) : (
                    noteExtractedText || 'No text extracted yet.'
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span>
                  Subject:{' '}
                  <strong className="text-slate-600 font-medium">
                    {(viewingNote.subjectId as any)?.name || 'General Material'}
                  </strong>
                </span>
                <span>•</span>
                <span>Uploaded {new Date(viewingNote.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close Preview
              </button>
            </div>
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
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete PDF Note?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Deleting this file will remove its extracted text from AI question generation.
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
