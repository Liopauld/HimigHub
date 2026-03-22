import api from '../redux/api/axiosConfig';

/**
 * notificationService — wraps notification endpoints.
 */
const notificationService = {
  /**
   * Fetch in-app notifications for the current user.
   */
  getAll: (params = {}) => api.get('/notifications', { params }),

  /**
   * Mark a notification as read.
   */
  markRead: (id) => api.put(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read.
   */
  markAllRead: () => api.put('/notifications/read-all'),

  /**
   * Register / update the device push token.
   */
  savePushToken: (pushToken) => api.post('/users/push-token', { pushToken }),

  /**
   * Delete a notification.
   */
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;
