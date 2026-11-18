import api from './api';
import { Note } from '../types';

interface NotesResponse { success: boolean; notes: Note[] }
interface NoteResponse  { success: boolean; note: Note }

export const noteService = {
  getAll: () => api.get<NotesResponse>('/notes'),
  getById: (id: string) => api.get<NoteResponse>(`/notes/${id}`),

  getPdfBlob: (id: string) =>
    api.get(`/notes/${id}/pdf`, { responseType: 'blob' }),

  getPdfUrl: (id: string) => {
    const token = localStorage.getItem('token') || '';
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/notes/${id}/pdf?token=${encodeURIComponent(token)}`;
  },

  upload: (formData: FormData) =>
    api.post<NoteResponse>('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: { title?: string }) =>
    api.put<NoteResponse>(`/notes/${id}`, data),

  delete: (id: string) => api.delete(`/notes/${id}`),
};
