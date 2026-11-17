import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Exam, ExamPayload } from '../../types';
import { examService } from '../../services/examService';

interface ExamState { exams: Exam[]; upcoming: Exam[]; selected: Exam | null; isLoading: boolean; error: string | null; }
const initialState: ExamState = { exams: [], upcoming: [], selected: null, isLoading: false, error: null };

export const fetchExams = createAsyncThunk('exams/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await examService.getAll(); return r.data.exams; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchUpcomingExams = createAsyncThunk('exams/fetchUpcoming', async (_, { rejectWithValue }) => {
  try { const r = await examService.getUpcoming(); return r.data.exams; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createExam = createAsyncThunk('exams/create', async (data: ExamPayload, { rejectWithValue }) => {
  try { const r = await examService.create(data); return r.data.exam; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updateExam = createAsyncThunk('exams/update', async ({ id, data }: { id: string; data: Partial<ExamPayload> }, { rejectWithValue }) => {
  try { const r = await examService.update(id, data); return r.data.exam; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteExam = createAsyncThunk('exams/delete', async (id: string, { rejectWithValue }) => {
  try { await examService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const examSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: { clearExamError(s) { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchExams.pending, (s) => { s.isLoading = true; })
     .addCase(fetchExams.fulfilled, (s, a) => { s.isLoading = false; s.exams = a.payload; })
     .addCase(fetchExams.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchUpcomingExams.fulfilled, (s, a) => { s.upcoming = a.payload; })
     .addCase(createExam.fulfilled, (s, a) => { s.exams.unshift(a.payload); })
     .addCase(createExam.rejected, (s, a) => { s.error = a.payload as string; })
     .addCase(updateExam.fulfilled, (s, a) => {
       const idx = s.exams.findIndex(x => x._id === a.payload._id);
       if (idx !== -1) s.exams[idx] = a.payload;
     })
     .addCase(deleteExam.fulfilled, (s, a) => { s.exams = s.exams.filter(x => x._id !== a.payload); });
  },
});

export const { clearExamError } = examSlice.actions;
export default examSlice.reducer;
