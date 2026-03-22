import api from '../redux/api/axiosConfig';

/**
 * productService — wraps all product endpoints.
 */
const productService = {
  getAll: (params = {}) => api.get('/products', { params }),

  getById: (id) => api.get(`/products/${id}`),

  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) => api.delete(`/products/${id}`),

  getFeatured: () => api.get('/products/featured'),

  search: (query) => api.get('/products', { params: { search: query } }),
};

export default productService;
