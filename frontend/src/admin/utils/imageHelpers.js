const apiBaseUrl = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getApiOrigin = () => {
  if (apiBaseUrl.startsWith('/')) {
    return window.location.origin;
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch (error) {
    return 'http://localhost:8000';
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
