import api from './api';
import { GeneratedPaper, GeneratePaperPayload } from '../types';

interface PapersResponse { success: boolean; papers: GeneratedPaper[] }
interface PaperResponse  { success: boolean; paper: GeneratedPaper }

export const paperService = {
  generate: (data: GeneratePaperPayload) =>
    api.post<PaperResponse>('/papers/generate', data),

  getAll: () => api.get<PapersResponse>('/papers'),

  getById: (id: string) => api.get<PaperResponse>(`/papers/${id}`),

  download: (id: string) =>
    api.get(`/papers/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) => api.delete(`/papers/${id}`),
};
