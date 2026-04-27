const hostedApiFallback = 'https://cityexplorer-backend.onrender.com/api';

const resolveProductionApiBaseUrl = () => {
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = String(window.location.hostname || '').toLowerCase();

    // If frontend is served from the backend host itself, keep same-origin API calls.
    if (hostname.endsWith('onrender.com')) {
      return '/api';
    }
  }

  // For static hosting (Netlify/custom domains), default to hosted backend.
  return hostedApiFallback;
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

  const normalized = String(value).trim().replace(/\\/g, '/');

  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname) && parsed.pathname.startsWith('/uploads/')) {
        return `${getApiOrigin()}${parsed.pathname}`;
      }
    } catch (error) {
      return normalized;
    }

    return normalized;
  }

  if (normalized.startsWith('/uploads/')) {
    return `${getApiOrigin()}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${getApiOrigin()}/${normalized}`;
  }

  if (normalized.startsWith('/')) {
    return `${getApiOrigin()}${normalized}`;
  }

  return normalized;
};

export const resolveImageProxyUrl = (value) => {
  const normalized = resolveImageUrl(value);
  if (!normalized) {
    return '';
  }

  if (/^https?:\/\//i.test(normalized)) {
    return `${apiBaseUrl}/utils/image-proxy?url=${encodeURIComponent(normalized)}`;
  }

  return normalized;
};
