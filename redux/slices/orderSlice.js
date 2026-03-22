import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const createOrder = createAsyncThunk('order/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data.order;
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message ||
      error.message ||
      'Failed to create order'
    );
  }
});

export const fetchMyOrders = createAsyncThunk('order/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders/myorders');
    return response.data.data.orders;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch your orders');
  }
});

export const fetchOrderById = createAsyncThunk('order/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.data.order;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
  }
});

export const fetchAllOrders = createAsyncThunk('order/fetchAllOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders');
    return response.data.data.orders; // Need pagination handling if necessary
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders');
  }
});

export const updateOrderStatus = createAsyncThunk('order/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.data.order;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    order: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderState: (state) => {
      state.order = null;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch Order by Id
      .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            ...action.payload,
            user: state.orders[index].user || action.payload.user,
          };
        }
        if (state.order?._id === action.payload._id) {
          state.order = {
            ...state.order,
            ...action.payload,
            user: state.order.user || action.payload.user,
          };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
