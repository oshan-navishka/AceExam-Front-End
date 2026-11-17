import api from './api';
import { Subject, SubjectPayload } from '../types';

interface SubjectsResponse { success: boolean; subjects: Subject[] }
interface SubjectResponse  { success: boolean; subject: Subject }

export const subjectService = {
  getAll: () => api.get<SubjectsResponse>('/subjects'),
  getById: (id: string) => api.get<SubjectResponse>(`/subjects/${id}`),
  create: (data: SubjectPayload) => api.post<SubjectResponse>('/subjects', data),
  update: (id: string, data: Partial<SubjectPayload>) =>
    api.put<SubjectResponse>(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};
