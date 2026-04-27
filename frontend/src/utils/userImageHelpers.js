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

const apiBaseUrl = import.meta.env.DEV
  ? '/api'
  : resolveProductionApiBaseUrl();

const bareImageIdPattern = /^[a-f0-9]{24}$/i;

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

  if (bareImageIdPattern.test(normalized)) {
    return `${getApiOrigin()}/api/images/${normalized}`;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/images/')) {
        if (/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)) {
          return `${getApiOrigin()}${parsed.pathname}`;
        }

        return normalized;
      }

      if (parsed.pathname.startsWith('/images/')) {
        return `${getApiOrigin()}/api${parsed.pathname}`;
      }
    } catch (error) {
      return normalized;
    }

    return normalized;
  }

  if (normalized.startsWith('/uploads/')) {
    return `${getApiOrigin()}${normalized}`;
  }

  if (normalized.startsWith('/api/images/')) {
    return `${getApiOrigin()}${normalized}`;
  }

  if (normalized.startsWith('/images/')) {
    return `${getApiOrigin()}/api${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${getApiOrigin()}/${normalized}`;
  }

  if (normalized.startsWith('api/images/')) {
    return `${getApiOrigin()}/${normalized}`;
  }

  if (normalized.startsWith('images/')) {
    return `${getApiOrigin()}/api/${normalized}`;
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
