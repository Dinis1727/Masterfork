import axios from 'axios';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

export const api = axios.create({ baseURL: API_URL });

export const TOKEN_STORAGE_KEY = 'masterfork.auth.token';

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const localToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (localToken) return localToken;
    if (window.sessionStorage) {
      return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token, { persist = true } = {}) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }

  if (typeof window !== 'undefined') {
    try {
      if (token) {
        if (persist) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
          if (window.sessionStorage) {
            window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        } else if (window.sessionStorage) {
          window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (window.sessionStorage) {
          window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }
};

export const clearAuthToken = () => setAuthToken(null);

export const getTokenPersistence = () => {
  if (typeof window === 'undefined') return null;
  try {
    if (window.localStorage.getItem(TOKEN_STORAGE_KEY)) return 'local';
    if (window.sessionStorage?.getItem(TOKEN_STORAGE_KEY)) return 'session';
  } catch {
    return null;
  }
  return null;
};

if (typeof window !== 'undefined') {
  const existingToken = getStoredToken();
  if (existingToken) {
    api.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
  }
}

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.info('[API] baseURL =', API_URL || '(relative to Next server)');
}

export const HealthAPI = {
  ping: () => api.get('/health'),
};

export const OrdersAPI = {
  list: (params) => api.get('/orders', { params }),
  create: (payload) => api.post('/orders', payload),
};

export const TrainingAPI = {
  create: (payload) => api.post('/training', payload),
};

export const AuthAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  logout: () => {
    clearAuthToken();
    return Promise.resolve();
  },
};

export default api;
