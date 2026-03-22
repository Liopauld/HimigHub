import api from '../redux/api/axiosConfig';

/**
 * reviewService — wraps all review endpoints.
 */
const reviewService = {
  getByProduct: (productId, params = {}) =>
    api.get(`/reviews/${productId}`, { params }),

  create: ({ productId, rating, comment }) =>
    api.post('/reviews', { productId, rating, comment }),

  update: (id, { rating, comment }) =>
    api.put(`/reviews/${id}`, { rating, comment }),

  delete: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;
