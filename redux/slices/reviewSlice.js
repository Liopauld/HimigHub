import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchProductReviews = createAsyncThunk('review/fetchProductReviews', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data.data.reviews;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
  }
});

export const createReview = createAsyncThunk('review/createReview', async (reviewData, { rejectWithValue }) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data.data.review;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create review');
  }
});

export const updateReview = createAsyncThunk('review/updateReview', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data.data.review;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update review');
  }
});

export const deleteReview = createAsyncThunk('review/deleteReview', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reviews/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
  }
});

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearReviewState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProductReviews.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create
      .addCase(createReview.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.reviews.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update
      .addCase(updateReview.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Delete
      .addCase(deleteReview.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
