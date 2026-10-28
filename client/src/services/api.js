import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('sgtu_token') || localStorage.getItem('apex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean stored session
      localStorage.removeItem('sgtu_token');
      localStorage.removeItem('sgtu_user');
      localStorage.removeItem('apex_token');
      localStorage.removeItem('apex_user');
    }
    return Promise.reject(error);
  }
);

export default api;
