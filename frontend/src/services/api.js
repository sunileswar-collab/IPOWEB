import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const ipoService = {
  getAll: (params = {}) => api.get('/ipos', { params }),
  getById: (id) => api.get(`/ipos/${id}`),
  getStats: () => api.get('/ipos/stats'),
  create: (data) => api.post('/ipos', data),
  update: (id, data) => api.put(`/ipos/${id}`, data),
  delete: (id) => api.delete(`/ipos/${id}`),
};

export const watchlistService = {
  getAll: () => api.get('/watchlist'),
  add: (ipoId) => api.post(`/watchlist/${ipoId}`),
  remove: (ipoId) => api.delete(`/watchlist/${ipoId}`),
  check: (ipoId) => api.get(`/watchlist/${ipoId}/check`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;
