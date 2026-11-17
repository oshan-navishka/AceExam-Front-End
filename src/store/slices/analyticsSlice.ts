import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardData, SubjectAnalytics } from '../../types';
import { analyticsService } from '../../services/analyticsService';

interface AnalyticsState {
  dashboard: DashboardData | null;
  subjectAnalytics: SubjectAnalytics | null;
  isLoading: boolean;
  error: string | null;
}
const initialState: AnalyticsState = { dashboard: null, subjectAnalytics: null, isLoading: false, error: null };

export const fetchDashboard = createAsyncThunk('analytics/dashboard', async (_, { rejectWithValue }) => {
  try { const r = await analyticsService.getDashboard(); return r.data.dashboard; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchSubjectAnalytics = createAsyncThunk('analytics/subject', async (id: string, { rejectWithValue }) => {
  try { const r = await analyticsService.getSubjectAnalytics(id); return r.data.analytics; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(fetchDashboard.fulfilled, (s, a) => { s.isLoading = false; s.dashboard = a.payload; })
     .addCase(fetchDashboard.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchSubjectAnalytics.pending, (s) => { s.isLoading = true; })
     .addCase(fetchSubjectAnalytics.fulfilled, (s, a) => { s.isLoading = false; s.subjectAnalytics = a.payload; })
     .addCase(fetchSubjectAnalytics.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export default analyticsSlice.reducer;
