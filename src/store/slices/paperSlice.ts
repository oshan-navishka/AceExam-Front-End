import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GeneratedPaper, GeneratePaperPayload } from '../../types';
import { paperService } from '../../services/paperService';

interface PaperState { papers: GeneratedPaper[]; selected: GeneratedPaper | null; isLoading: boolean; error: string | null; }
const initialState: PaperState = { papers: [], selected: null, isLoading: false, error: null };

export const fetchPapers = createAsyncThunk('papers/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await paperService.getAll(); return r.data.papers; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchPaperById = createAsyncThunk('papers/fetchById', async (id: string, { rejectWithValue }) => {
  try { const r = await paperService.getById(id); return r.data.paper; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const generatePaper = createAsyncThunk('papers/generate', async (data: GeneratePaperPayload, { rejectWithValue }) => {
  try { const r = await paperService.generate(data); return r.data.paper; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'AI generation failed'); }
});

export const deletePaper = createAsyncThunk('papers/delete', async (id: string, { rejectWithValue }) => {
  try { await paperService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const paperSlice = createSlice({
  name: 'papers',
  initialState,
  reducers: {
    clearPaperError(s) { s.error = null; },
    clearSelectedPaper(s) { s.selected = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchPapers.pending, (s) => { s.isLoading = true; })
     .addCase(fetchPapers.fulfilled, (s, a) => { s.isLoading = false; s.papers = a.payload; })
     .addCase(fetchPapers.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(fetchPaperById.pending, (s) => { s.isLoading = true; })
     .addCase(fetchPaperById.fulfilled, (s, a) => { s.isLoading = false; s.selected = a.payload; })
     .addCase(fetchPaperById.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(generatePaper.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(generatePaper.fulfilled, (s, a) => { s.isLoading = false; s.papers.unshift(a.payload); s.selected = a.payload; })
     .addCase(generatePaper.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(deletePaper.fulfilled, (s, a) => { s.papers = s.papers.filter(x => x._id !== a.payload); });
  },
});

export const { clearPaperError, clearSelectedPaper } = paperSlice.actions;
export default paperSlice.reducer;
