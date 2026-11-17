import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Subject, SubjectPayload } from '../../types';
import { subjectService } from '../../services/subjectService';

interface SubjectState {
  subjects: Subject[];
  selected: Subject | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubjectState = { subjects: [], selected: null, isLoading: false, error: null };

export const fetchSubjects = createAsyncThunk('subjects/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await subjectService.getAll(); return r.data.subjects; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchSubjectById = createAsyncThunk('subjects/fetchById', async (id: string, { rejectWithValue }) => {
  try { const r = await subjectService.getById(id); return r.data.subject; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createSubject = createAsyncThunk('subjects/create', async (data: SubjectPayload, { rejectWithValue }) => {
  try { const r = await subjectService.create(data); return r.data.subject; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updateSubject = createAsyncThunk('subjects/update', async ({ id, data }: { id: string; data: Partial<SubjectPayload> }, { rejectWithValue }) => {
  try { const r = await subjectService.update(id, data); return r.data.subject; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteSubject = createAsyncThunk('subjects/delete', async (id: string, { rejectWithValue }) => {
  try { await subjectService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: { clearSubjectError(s) { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchSubjects.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(fetchSubjects.fulfilled, (s, a) => { s.isLoading = false; s.subjects = a.payload; })
     .addCase(fetchSubjects.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

     .addCase(fetchSubjectById.fulfilled, (s, a) => { s.selected = a.payload; })

     .addCase(createSubject.fulfilled, (s, a) => { s.subjects.unshift(a.payload); })
     .addCase(createSubject.rejected, (s, a) => { s.error = a.payload as string; })

     .addCase(updateSubject.fulfilled, (s, a) => {
       const idx = s.subjects.findIndex(x => x._id === a.payload._id);
       if (idx !== -1) s.subjects[idx] = a.payload;
     })
     .addCase(updateSubject.rejected, (s, a) => { s.error = a.payload as string; })

     .addCase(deleteSubject.fulfilled, (s, a) => { s.subjects = s.subjects.filter(x => x._id !== a.payload); })
     .addCase(deleteSubject.rejected, (s, a) => { s.error = a.payload as string; });
  },
});

export const { clearSubjectError } = subjectSlice.actions;
export default subjectSlice.reducer;
