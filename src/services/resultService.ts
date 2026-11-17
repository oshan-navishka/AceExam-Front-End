import api from './api';
import { ExamResult, SubmitExamPayload } from '../types';

interface ResultsResponse { success: boolean; results: ExamResult[] }
interface ResultResponse  { success: boolean; result: ExamResult }

export const resultService = {
  submit: (data: SubmitExamPayload) =>
    api.post<ResultResponse>('/results/submit', data),

  getAll: () => api.get<ResultsResponse>('/results'),

  getById: (id: string) => api.get<ResultResponse>(`/results/${id}`),

  delete: (id: string) => api.delete(`/results/${id}`),
};
