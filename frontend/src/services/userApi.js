import axios from 'axios';

const hostedApiFallback = 'https://cityexplorer-backend.onrender.com/api';
const hostedApiHost = new URL(hostedApiFallback).hostname;

const resolveProductionApiBaseUrl = () => {
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (typeof window !== 'undefined') {
    const hostname = String(window.location.hostname || '').toLowerCase();

    // If frontend is served from the backend host itself, keep same-origin API calls.
    if (hostname === hostedApiHost) {
      return '/api';
    }

    if (configuredApiUrl && configuredApiUrl !== '/api') {
      return configuredApiUrl;
    }

    // Static/mobile clients hosted away from the backend need the public API host.
    return hostedApiFallback;
  }

  if (configuredApiUrl && configuredApiUrl !== '/api') {
    return configuredApiUrl;
  }

  return hostedApiFallback;
};

const resolveApiBaseUrl = () => {
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  return import.meta.env.DEV ? '/api' : resolveProductionApiBaseUrl();
};

const baseURL = resolveApiBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearUserSession = () => {
  localStorage.removeItem('cityexplorer_token');
  localStorage.removeItem('cityexplorer_user');
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
  const trimmed = String(value || '/').trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const cleaned = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return cleaned.endsWith('/') ? cleaned.slice(0, -1) : cleaned;
};

const getUserLoginPath = () => {
  const base = normalizeBasename(import.meta.env.VITE_ROUTER_BASENAME || '/');
  return base === '/' ? '/login' : `${base}/login`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cityexplorer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isTokenFailure(error) && localStorage.getItem('cityexplorer_token')) {
      clearUserSession();

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign(getUserLoginPath());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
