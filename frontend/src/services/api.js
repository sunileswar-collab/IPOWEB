import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ipoAPI = {
  getAllIPOs: (params = {}) => api.get('/ipo/', { params }),
  getIPOById: (id) => api.get(`/ipo/${id}/`),
  searchIPOs: (query) => api.get(`/ipo/?search=${query}`),
  filterIPOs: (status) => api.get(`/ipo/?status=${status}`),
};

export default api;