import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';
import { BASE_URL } from '../api/axiosConfig';
import { getToken } from '../../db/sqlite';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const parseResponseBody = (raw) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
};

export const fetchProducts = createAsyncThunk('product/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const { search = '', category = '', minPrice = '', maxPrice = '', page = 1, limit = 20 } = params || {};
    const query = `?search=${search}&category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&limit=${limit}`;
    const response = await api.get(`/products${query}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch products'));
  }
});

export const fetchProductById = createAsyncThunk('product/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch product'));
  }
});

export const createProduct = createAsyncThunk('product/createProduct', async (formData, { rejectWithValue }) => {
  try {
    const isFormData =
      (typeof FormData !== 'undefined' && formData instanceof FormData) ||
      (formData && typeof formData === 'object' && Array.isArray(formData._parts));

    if (isFormData) {
      const token = (await getToken()) || null;
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const raw = await response.text();
      const parsed = parseResponseBody(raw);
      if (!response.ok) {
        return rejectWithValue(parsed?.message || 'Failed to create product');
      }
      return parsed?.data?.product;
    }

    const response = await api.post('/products', formData);
    return response.data.data.product;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create product'));
  }
});

export const updateProduct = createAsyncThunk('product/updateProduct', async ({ id, formData, data }, { rejectWithValue }) => {
  try {
    const payload = formData || data;

    const isFormData =
      (typeof FormData !== 'undefined' && payload instanceof FormData) ||
      (payload && typeof payload === 'object' && Array.isArray(payload._parts));

    if (isFormData) {
      const token = (await getToken()) || null;
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: payload,
      });

      const raw = await response.text();
      const parsed = parseResponseBody(raw);
      if (!response.ok) {
        return rejectWithValue(parsed?.message || 'Failed to update product');
      }
      return parsed?.data?.product;
    }

    const response = await api.put(`/products/${id}`, payload);
    return response.data.data.product;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update product'));
  }
});

export const deleteProduct = createAsyncThunk('product/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete product'));
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    product: null,
    selectedProduct: null,
    loading: false,
    loadingMore: false,
    error: null,
    filters: { search: '', category: '', minPrice: '', maxPrice: '' },
    pagination: { page: 1, pages: 1, total: 0 },
    hasNextPage: false,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { search: '', category: '', minPrice: '', maxPrice: '' };
    },
    clearProductError: (state) => {
      state.error = null;
    },
    loadMoreProducts: (state, action) => {
      state.products = [...state.products, ...action.payload.products];
      state.pagination = {
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
      state.hasNextPage = action.payload.page < action.payload.pages;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
        state.hasNextPage = action.payload.page < action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create Product
      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update Product
      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.product?._id === action.payload._id) {
          state.product = action.payload;
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setFilters, clearFilters, clearProductError } = productSlice.actions;
export default productSlice.reducer;
