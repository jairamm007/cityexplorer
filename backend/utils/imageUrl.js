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
  const uploadsIndex = slashNormalized.toLowerCase().indexOf('/uploads/');
  const apiImagesIndex = slashNormalized.toLowerCase().indexOf('/api/images/');

  if (uploadsIndex >= 0) {
    return slashNormalized.slice(uploadsIndex);
  }

  if (apiImagesIndex >= 0) {
    return slashNormalized.slice(apiImagesIndex);
  }

  if (slashNormalized.toLowerCase().startsWith('uploads/')) {
    return `/${slashNormalized}`;
  }

  if (slashNormalized.toLowerCase().startsWith('api/images/')) {
    return `/${slashNormalized}`;
  }

  try {
    const parsed = new URL(slashNormalized);
    if (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/images/')) {
      return parsed.pathname;
    }
  } catch (error) {
    return slashNormalized;
  }

  return slashNormalized;
};

module.exports = {
  normalizePersistedImageUrl,
};
