const User = require('../models/User');

const normalizeProfileName = (value) => String(value || '').trim();

const toProfileNameKey = (value) => normalizeProfileName(value).toLowerCase();

const sanitizeSuggestionBase = (value) => {
  const compact = normalizeProfileName(value).replace(/\s+/g, '');
  const safe = compact.replace(/[^a-zA-Z0-9._-]/g, '');

  if (!safe) {
    return 'traveler';
  }

  return safe.slice(0, 18);
};

const isProfileNameTaken = async (name, excludeUserId) => {
  const nameKey = toProfileNameKey(name);
  if (!nameKey) {
    return false;
  }

  const query = { nameKey };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query).select('_id').lean();
  return Boolean(existingUser);
};

module.exports = {
  normalizeProfileName,
  toProfileNameKey,
  sanitizeSuggestionBase,
  isProfileNameTaken,
};
