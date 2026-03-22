import api from '../redux/api/axiosConfig';

/**
 * authService — wraps all auth endpoints.
 * Redux thunks call these directly.
 */
const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (formData) =>
    api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  firebaseAuth: (firebaseToken) => api.post('/auth/firebase', { firebaseToken }),

  getMe: () => api.get('/users/profile'),

  updateProfile: (formData) =>
    api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  savePushToken: (token) => api.put('/users/push-token', { token }),

  logout: () => api.post('/auth/logout').catch(() => null), // best-effort
};

export default authService;
