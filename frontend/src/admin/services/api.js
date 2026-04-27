
import axios from 'axios';
import { resolveApiBaseUrl } from '../../utils/apiBaseUrl';

const baseURL = resolveApiBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearAdminSession = () => {
  localStorage.removeItem('cityexplorer_admin_token');
  localStorage.removeItem('cityexplorer_admin_user');
};

const isTokenFailure = (error) => {
  const status = error?.response?.status;
  if (status !== 401) {
    return false;
  }

  const message = String(error?.response?.data?.message || '').toLowerCase();
  return message.includes('token failed') || message.includes('not authorized');
};

const normalizeBasename = (value) => {
  const trimmed = String(value || '/admin').trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const cleaned = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;
};

const getAdminLoginPath = () => {
  const base = normalizeBasename(import.meta.env.VITE_ROUTER_BASENAME || '/admin');
  return base === '/' ? '/login' : `${base}/login`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cityexplorer_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isTokenFailure(error) && localStorage.getItem('cityexplorer_admin_token')) {
      clearAdminSession();

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign(getAdminLoginPath());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
