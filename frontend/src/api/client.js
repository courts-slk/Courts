import axios from 'axios';
import {
  mockAuthAPI, mockCourtsAPI, mockBookingsAPI, mockVendorAPI, mockAdminAPI,
} from './mockHandlers';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = DEMO ? mockAuthAPI : {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/me', data),
};

// Courts
export const courtsAPI = DEMO ? mockCourtsAPI : {
  list: (params) => client.get('/courts', { params }),
  get: (id) => client.get(`/courts/${id}`),
  getSlots: (id, date) => client.get(`/courts/${id}/slots`, { params: { date } }),
  create: (data) => client.post('/courts', data),
  update: (id, data) => client.put(`/courts/${id}`, data),
  delete: (id) => client.delete(`/courts/${id}`),
  createSlots: (id, data) => client.post(`/courts/${id}/slots`, data),
};

// Bookings
export const bookingsAPI = DEMO ? mockBookingsAPI : {
  create: (data) => client.post('/bookings', data),
  list: () => client.get('/bookings'),
  get: (id) => client.get(`/bookings/${id}`),
  confirm: (id) => client.post(`/bookings/${id}/confirm`),
  cancel: (id, data) => client.post(`/bookings/${id}/cancel`, data),
};

// Vendor
export const vendorAPI = DEMO ? mockVendorAPI : {
  getCourts: () => client.get('/vendor/courts'),
  getSlots: (courtId, date) => client.get('/vendor/slots', { params: { court_id: courtId, date } }),
  blockSlot: (slotId, data) => client.put(`/vendor/slots/${slotId}/block`, data),
  getBookings: () => client.get('/vendor/bookings'),
  updateBookingStatus: (id, data) => client.put(`/vendor/bookings/${id}/status`, data),
};

// Admin
export const adminAPI = DEMO ? mockAdminAPI : {
  getUsers: () => client.get('/admin/users'),
  updateUserRole: (id, data) => client.put(`/admin/users/${id}/role`, data),
  getCourts: () => client.get('/admin/courts'),
  approveCourt: (id, data) => client.put(`/admin/courts/${id}/approve`, data),
  getBookings: () => client.get('/admin/bookings'),
  getStats: () => client.get('/admin/stats'),
};

// Upload
export const uploadAPI = {
  image: (file) => {
    if (DEMO) return Promise.resolve({ data: { url: '/icons/logo-mark.png' } });
    const formData = new FormData();
    formData.append('image', file);
    return client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default client;
