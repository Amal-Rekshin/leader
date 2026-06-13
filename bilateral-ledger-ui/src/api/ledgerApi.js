import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const ledgerApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Admin Endpoints
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  createUser: (payload) => api.post('/admin/users', payload),
  updateUser: (userId, payload) => api.put(`/admin/users/${userId}`, payload),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserLedger: (userId) => api.get(`/admin/ledger/${userId}`),
  getAllLedger: () => api.get('/admin/ledger/all'),
  createInvoice: (payload) => api.post('/admin/invoices', payload), // { userId, description, amount }
  recordPayment: (payload) => api.post('/admin/payments', payload), // { userId, description, amount }
  
  // User Endpoints
  getMyLedger: () => api.get('/user/ledger'),
};

export default api;
