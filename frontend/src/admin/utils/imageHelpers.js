const hostedApiFallback = 'https://cityexplorer-backend.onrender.com/api';

const resolveProductionApiBaseUrl = () => {
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('netlify.app')) {
    return hostedApiFallback;
  }

  return '/api';
};

const apiBaseUrl = import.meta.env.DEV
  ? '/api'
  : resolveProductionApiBaseUrl();

export const getApiOrigin = () => {
  if (apiBaseUrl.startsWith('/')) {
    return window.location.origin;
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch (error) {
    return window.location.origin;
  }
};

export const resolveImageUrl = (value) => {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${getApiOrigin()}${value}`;
  }

  return value;
};
