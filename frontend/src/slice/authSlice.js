import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const verifyToken = createAsyncThunk('auth/verifyToken', async (token, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('verifyToken response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('verifyToken error:', error);
    return rejectWithValue({
      message: error.response?.data?.message || 'Token verification failed',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isAuthLoading: false,
    token: null,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isAuthLoading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.isAuthLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isAuthLoading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || state.token;
        state.error = null;
        if (action.payload.avatar) {
          state.user.avatar = `/images/${action.payload.avatar}`;
        }
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Unknown error';
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;