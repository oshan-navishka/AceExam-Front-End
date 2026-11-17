import api from './api';
import { StudyPlan, StudyPlanPayload } from '../types';

interface PlansResponse { success: boolean; plans: StudyPlan[] }
interface PlanResponse  { success: boolean; plan: StudyPlan }

export const studyPlanService = {
  generate: (data: StudyPlanPayload) =>
    api.post<PlanResponse>('/study-plans/generate', data),

  getAll: () => api.get<PlansResponse>('/study-plans'),

  getById: (id: string) => api.get<PlanResponse>(`/study-plans/${id}`),

  getBySubject: (subjectId: string) =>
    api.get<PlanResponse>(`/study-plans/subject/${subjectId}`),

  delete: (id: string) => api.delete(`/study-plans/${id}`),
};
