import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

export const api = axios.create({ baseURL: API_URL });

export const HealthAPI = {
  ping: () => api.get('/'),
};

export const OrdersAPI = {
  list: (params) => api.get('/orders', { params }),
  create: (payload) => api.post('/orders', payload),
};

export default api;

