import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';
import { saveToken, deleteToken } from '../../db/sqlite';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    await saveToken(response.data.data.token);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    await saveToken(response.data.data.token);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Registration failed'));
  }
});

export const firebaseLogin = createAsyncThunk('auth/firebaseLogin', async (firebaseToken, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/firebase', { firebaseToken });
    await saveToken(response.data.data.token);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Firebase Auth failed'));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put('/users/profile', formData);
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Profile update failed'));
  }
});

export const savePushToken = createAsyncThunk('auth/savePushToken', async (token, { rejectWithValue }) => {
  try {
    const response = await api.put('/users/push-token', { token });
    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to save push token'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      deleteToken(); // from sqlite
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Firebase Login
      .addCase(firebaseLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(firebaseLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(firebaseLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update Profile
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

// Alias exports so screen imports match canonical action names.
export const login = loginUser;
export const register = registerUser;
export const googleLogin = firebaseLogin;

export default authSlice.reducer;
