import api from '../redux/api/axiosConfig';

/**
 * cartService — server-side cart sync (optional, supplements local SQLite cart).
 * If the backend exposes a /cart API (e.g. for cross-device sync), use these helpers.
 */
const cartService = {
  getCart: () => api.get('/cart'),

  addItem: (item) => api.post('/cart', item),

  removeItem: (itemId) => api.delete(`/cart/${itemId}`),

  updateQuantity: (itemId, quantity) =>
    api.put(`/cart/${itemId}`, { quantity }),

  clearCart: () => api.delete('/cart'),
};

export default cartService;
