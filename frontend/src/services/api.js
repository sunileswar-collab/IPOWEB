import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (only for authenticated endpoints)
api.interceptors.request.use((config) => {
  // Only add token for auth endpoints, not for public IPO data
  if (config.url && config.url.includes('/auth/')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// IPO Service
export const ipoService = {
  // Get all IPOs with optional filters
  getAll: (params = {}) => api.get('/ipo/', { params }),
  
  // Get IPO by ID
  getById: (id) => api.get(`/ipo/${id}/`),
  
  // Create new IPO (requires authentication)
  create: (data) => api.post('/ipo/', data),
  
  // Update IPO (requires authentication)
  update: (id, data) => api.put(`/ipo/${id}/`, data),
  
  // Delete IPO (requires authentication)
  delete: (id) => api.delete(`/ipo/${id}/`),
  
  // Search IPOs
  search: (query) => api.get('/ipo/', { params: { search: query } }),
  
  // Filter by status
  filterByStatus: (status) => api.get('/ipo/', { params: { status } }),
};

// Authentication Service
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};

// Stats Service
export const statsService = {
  // Get IPO statistics
  getStats: async () => {
    try {
      const response = await ipoService.getAll();
      const data = response.data;
      
      let ipos = [];
      if (Array.isArray(data)) {
        ipos = data;
      } else if (data.results) {
        ipos = data.results;
      }
      
      const stats = {
        total: ipos.length,
        upcoming: ipos.filter(ipo => ipo.status === 'upcoming').length,
        ongoing: ipos.filter(ipo => ipo.status === 'ongoing').length,
        listed: ipos.filter(ipo => ipo.status === 'listed').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, upcoming: 0, ongoing: 0, listed: 0 };
    }
  },
};

export default api;