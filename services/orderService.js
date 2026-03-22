import api from '../redux/api/axiosConfig';

/**
 * orderService — wraps all order endpoints.
 */
const orderService = {
  create: (orderData) => api.post('/orders', orderData),

  getMyOrders: (params = {}) => api.get('/orders/my', { params }),

  getById: (id) => api.get(`/orders/${id}`),

  // Admin
  getAll: (params = {}) => api.get('/orders', { params }),

  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export default orderService;
