const hostedApiFallback = 'https://cityexplorer-backend.onrender.com/api';
const hostedApiHost = new URL(hostedApiFallback).hostname;

const normalizeConfiguredApiUrl = (value) => String(value || '').trim();

const parseConfiguredApiUrl = (configuredApiUrl) => {
  if (!configuredApiUrl || configuredApiUrl.startsWith('/')) {
    return null;
  }

  try {
    return new URL(configuredApiUrl);
  } catch (error) {
    return null;
  }
};

const resolveProductionApiBaseUrl = () => {
  const configuredApiUrl = normalizeConfiguredApiUrl(import.meta.env.VITE_API_URL);
  const parsedConfiguredApiUrl = parseConfiguredApiUrl(configuredApiUrl);

  if (typeof window !== 'undefined') {
    const hostname = String(window.location.hostname || '').toLowerCase();

    // If frontend is served from the backend host itself, keep same-origin API calls.
    if (hostname === hostedApiHost) {
      return '/api';
    }

    if (configuredApiUrl === '/api') {
      return configuredApiUrl;
    }

    if (parsedConfiguredApiUrl) {
      const isBackendHost = parsedConfiguredApiUrl.hostname.toLowerCase() === hostedApiHost;
      const isSameOriginAsFrontend = parsedConfiguredApiUrl.origin === window.location.origin;

      // Ignore static frontend self-references such as https://<vercel-app>/api.
      if (isBackendHost || !isSameOriginAsFrontend) {
        return configuredApiUrl;
      }
    }

    if (configuredApiUrl && !parsedConfiguredApiUrl) {
      return configuredApiUrl;
    }

    // Static clients hosted away from the backend need the public API host.
    return hostedApiFallback;
  }

  if (configuredApiUrl === '/api') {
    return configuredApiUrl;
  }

  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  return hostedApiFallback;
};

export const resolveApiBaseUrl = () => {
  const configuredApiUrl = normalizeConfiguredApiUrl(import.meta.env.VITE_API_URL);

  if (import.meta.env.DEV) {
    return configuredApiUrl || '/api';
  }

  return resolveProductionApiBaseUrl();
};
