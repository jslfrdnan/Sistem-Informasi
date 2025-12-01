import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

// Stok API
export const stokAPI = {
  getList: (params) => api.get('/stok', { params }),
  getDetail: (id) => api.get(`/stok/${id}`),
  create: (data) => api.post('/stok', data),
  update: (id, data) => api.put(`/stok/${id}`, data),
};

// Kebun API
export const kebunAPI = {
  getList: () => api.get('/kebun'),
};

// Purchase Order API
export const poAPI = {
  getList: (params) => api.get('/purchase-orders', { params }),
  getDetail: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  updateStatus: (id, data) => api.put(`/purchase-orders/${id}/status`, data),
  cancel: (id) => api.delete(`/purchase-orders/${id}`),
};

// Jadwal API
export const jadwalAPI = {
  getList: (params) => api.get('/jadwal', { params }),
  create: (data) => api.post('/jadwal', data),
};

// Timbangan API
export const timbanganAPI = {
  getList: (params) => api.get('/timbangan', { params }),
  weighIn: (id, data) => api.post(`/timbangan/${id}/weigh-in`, data),
  weighOut: (id, data) => api.post(`/timbangan/${id}/weigh-out`, data),
};

// Alias untuk kompatibilitas
export const timbangAPI = timbanganAPI;

// Dokumen API
export const dokumenAPI = {
  getList: (params) => api.get('/dokumen', { params }),
};

// Pembayaran API
export const pembayaranAPI = {
  getList: (params) => api.get('/pembayaran', { params }),
  create: (data) => api.post('/pembayaran', data),
  verify: (id, status) => api.put(`/pembayaran/${id}/verify`, { status }),
};

// Purchase Order alias
export const purchaseOrderAPI = poAPI;

// Reports API
export const reportsAPI = {
  getDailySales: (params) => api.get('/reports/daily-sales', { params }),
  getDashboard: () => api.get('/reports/dashboard'),
};

export default api;
