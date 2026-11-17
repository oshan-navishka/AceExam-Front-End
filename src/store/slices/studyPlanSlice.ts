import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StudyPlan, StudyPlanPayload } from '../../types';
import { studyPlanService } from '../../services/studyPlanService';

interface StudyPlanState { plans: StudyPlan[]; selected: StudyPlan | null; isLoading: boolean; error: string | null; }
const initialState: StudyPlanState = { plans: [], selected: null, isLoading: false, error: null };

export const fetchStudyPlans = createAsyncThunk('studyPlans/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await studyPlanService.getAll(); return r.data.plans; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const generateStudyPlan = createAsyncThunk('studyPlans/generate', async (data: StudyPlanPayload, { rejectWithValue }) => {
  try { const r = await studyPlanService.generate(data); return r.data.plan; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'AI generation failed'); }
});

export const fetchPlanById = createAsyncThunk('studyPlans/fetchById', async (id: string, { rejectWithValue }) => {
  try { const r = await studyPlanService.getById(id); return r.data.plan; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteStudyPlan = createAsyncThunk('studyPlans/delete', async (id: string, { rejectWithValue }) => {
  try { await studyPlanService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const studyPlanSlice = createSlice({
  name: 'studyPlans',
  initialState,
  reducers: { clearPlanError(s) { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchStudyPlans.pending, (s) => { s.isLoading = true; })
     .addCase(fetchStudyPlans.fulfilled, (s, a) => { s.isLoading = false; s.plans = a.payload; })
     .addCase(fetchStudyPlans.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(generateStudyPlan.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(generateStudyPlan.fulfilled, (s, a) => { s.isLoading = false; s.plans.unshift(a.payload); s.selected = a.payload; })
     .addCase(generateStudyPlan.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchPlanById.fulfilled, (s, a) => { s.selected = a.payload; })
     .addCase(deleteStudyPlan.fulfilled, (s, a) => { s.plans = s.plans.filter(x => x._id !== a.payload); });
  },
});

export const { clearPlanError } = studyPlanSlice.actions;
export default studyPlanSlice.reducer;
