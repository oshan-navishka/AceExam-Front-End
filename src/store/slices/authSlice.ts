import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginPayload, RegisterPayload } from '../../types';
import { authService } from '../../services/authService';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (data: LoginPayload, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data: RegisterPayload, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem('token', a.payload.token);
        localStorage.setItem('user', JSON.stringify(a.payload.user));
      })
      .addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

      .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem('token', a.payload.token);
        localStorage.setItem('user', JSON.stringify(a.payload.user));
      })
      .addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
