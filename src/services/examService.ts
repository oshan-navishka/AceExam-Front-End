import api from './api';
import { Exam, ExamPayload } from '../types';

interface ExamsResponse { success: boolean; exams: Exam[] }
interface ExamResponse  { success: boolean; exam: Exam }

export const examService = {
  getAll: () => api.get<ExamsResponse>('/exams'),
  getUpcoming: () => api.get<ExamsResponse>('/exams/upcoming'),
  getById: (id: string) => api.get<ExamResponse>(`/exams/${id}`),
  create: (data: ExamPayload) => api.post<ExamResponse>('/exams', data),
  update: (id: string, data: Partial<ExamPayload>) =>
    api.put<ExamResponse>(`/exams/${id}`, data),
  delete: (id: string) => api.delete(`/exams/${id}`),
};
