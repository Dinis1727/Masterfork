import axios from 'axios';

// Prefer env var; fall back to localhost:3001 in dev
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

export const api = axios.create({ baseURL: API_URL });

export const OrdersAPI = {
  list: () => api.get('/orders'),
  create: (payload) => api.post('/orders', payload),
};

export default api;

