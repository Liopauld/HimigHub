import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data.data.users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateAdminUserStatus = createAsyncThunk(
  'adminUsers/updateAdminUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/status`, { isActive });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const updateAdminUserRole = createAsyncThunk(
  'adminUsers/updateAdminUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = { ...state.users[index], ...action.payload };
      })
      .addCase(updateAdminUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = { ...state.users[index], ...action.payload };
      })
      .addCase(updateAdminUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminUserSlice.reducer;