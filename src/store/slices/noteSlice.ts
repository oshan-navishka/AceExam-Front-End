import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Note } from '../../types';
import { noteService } from '../../services/noteService';

interface NoteState { notes: Note[]; isLoading: boolean; error: string | null; }
const initialState: NoteState = { notes: [], isLoading: false, error: null };

export const fetchNotes = createAsyncThunk('notes/fetchAll', async (_, { rejectWithValue }) => {
  try { const r = await noteService.getAll(); return r.data.notes; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const uploadNote = createAsyncThunk('notes/upload', async (formData: FormData, { rejectWithValue }) => {
  try { const r = await noteService.upload(formData); return r.data.note; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteNote = createAsyncThunk('notes/delete', async (id: string, { rejectWithValue }) => {
  try { await noteService.delete(id); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: { clearNoteError(s) { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchNotes.pending, (s) => { s.isLoading = true; })
     .addCase(fetchNotes.fulfilled, (s, a) => { s.isLoading = false; s.notes = a.payload; })
     .addCase(fetchNotes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(uploadNote.pending, (s) => { s.isLoading = true; })
     .addCase(uploadNote.fulfilled, (s, a) => { s.isLoading = false; s.notes.unshift(a.payload); })
     .addCase(uploadNote.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })
     .addCase(deleteNote.fulfilled, (s, a) => { s.notes = s.notes.filter(x => x._id !== a.payload); });
  },
});

export const { clearNoteError } = noteSlice.actions;
export default noteSlice.reducer;
