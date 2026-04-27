const normalizePersistedImageUrl = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^(data|blob):/i.test(trimmed)) {
    return '';
  }

  const slashNormalized = trimmed.replace(/\\/g, '/');
  const bareImageIdPattern = /^[a-f0-9]{24}$/i;
  const uploadsIndex = slashNormalized.toLowerCase().indexOf('/uploads/');
  const apiImagesIndex = slashNormalized.toLowerCase().indexOf('/api/images/');
  const legacyImagesIndex = slashNormalized.toLowerCase().indexOf('/images/');

  if (bareImageIdPattern.test(slashNormalized)) {
    return `/api/images/${slashNormalized}`;
  }

  if (uploadsIndex >= 0) {
    return slashNormalized.slice(uploadsIndex);
  }

  if (apiImagesIndex >= 0) {
    return slashNormalized.slice(apiImagesIndex);
  }

  if (legacyImagesIndex >= 0) {
    return `/api${slashNormalized.slice(legacyImagesIndex)}`;
  }

  if (slashNormalized.toLowerCase().startsWith('uploads/')) {
    return `/${slashNormalized}`;
  }

  if (slashNormalized.toLowerCase().startsWith('api/images/')) {
    return `/${slashNormalized}`;
  }

  if (slashNormalized.toLowerCase().startsWith('images/')) {
    return `/api/${slashNormalized}`;
  }

  try {
    const parsed = new URL(slashNormalized);
    if (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/images/')) {
      return parsed.pathname;
    }
    if (parsed.pathname.startsWith('/images/')) {
      return `/api${parsed.pathname}`;
    }
  } catch (error) {
    return slashNormalized;
  }

  return slashNormalized;
};

module.exports = {
  normalizePersistedImageUrl,
};
