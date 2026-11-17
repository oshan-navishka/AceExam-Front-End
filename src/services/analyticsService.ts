import api from './api';
import { DashboardData, SubjectAnalytics } from '../types';

interface DashboardResponse { success: boolean; dashboard: DashboardData }
interface SubjectAnalyticsResponse { success: boolean; analytics: SubjectAnalytics }

export const analyticsService = {
  getDashboard: () => api.get<DashboardResponse>('/analytics/dashboard'),

  getSubjectAnalytics: (subjectId: string) =>
    api.get<SubjectAnalyticsResponse>(`/analytics/subject/${subjectId}`),
};
