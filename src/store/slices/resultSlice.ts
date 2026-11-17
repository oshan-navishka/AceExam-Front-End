import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ExamResult, SubmitExamPayload } from '../../types';
import { resultService } from '../../services/resultService';

interface ResultState { results: ExamResult[]; selected: ExamResult | null; isLoading: boolean; error: string | null; }
const initialState: ResultState = { results: [], selected: null, isLoading: false, error: null };

export const fetchResults = createAsyncThunk('results/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await resultService.getAll(); return r.data.results; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchResultById = createAsyncThunk('results/fetchById', async (id: string, { rejectWithValue }) => {
  try { const r = await resultService.getById(id); return r.data.result; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const submitExam = createAsyncThunk('results/submit', async (data: SubmitExamPayload, { rejectWithValue }) => {
  try { const r = await resultService.submit(data); return r.data.result; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Submission failed'); }
});

export const deleteResult = createAsyncThunk('results/delete', async (id: string, { rejectWithValue }) => {
  try { await resultService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const resultSlice = createSlice({
  name: 'results',
  initialState,
  reducers: { clearResultError(s) { s.error = null; }, clearSelected(s) { s.selected = null; } },
  extraReducers: (b) => {
    b.addCase(fetchResults.pending, (s) => { s.isLoading = true; })
     .addCase(fetchResults.fulfilled, (s, a) => { s.isLoading = false; s.results = a.payload; })
     .addCase(fetchResults.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchResultById.pending, (s) => { s.isLoading = true; })
     .addCase(fetchResultById.fulfilled, (s, a) => { s.isLoading = false; s.selected = a.payload; })
     .addCase(fetchResultById.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(submitExam.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(submitExam.fulfilled, (s, a) => { s.isLoading = false; s.selected = a.payload; s.results.unshift(a.payload); })
     .addCase(submitExam.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(deleteResult.fulfilled, (s, a) => { s.results = s.results.filter(x => x._id !== a.payload); });
  },
});

export const { clearResultError, clearSelected } = resultSlice.actions;
export default resultSlice.reducer;
