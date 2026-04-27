const User = require('../models/User');
const { sanitizeSuggestionBase } = require('./profileName');

const generateProfileNameSuggestions = async (requestedName, count = 3) => {
  const safeBase = sanitizeSuggestionBase(requestedName);
  const candidates = new Set();
  let attempts = 0;
  const decorators = ['', '_', '.', '-'];

  while (candidates.size < Math.max(count * 3, 9) && attempts < 80) {
    attempts += 1;
    const suffix = Math.floor(100 + Math.random() * 9900);
    const decorator = decorators[Math.floor(Math.random() * decorators.length)];
    candidates.add(`${safeBase}${decorator}${suffix}`);
  }

  const candidateList = [...candidates];
  const existingUsers = await User.find(
    { nameKey: { $in: candidateList.map((item) => item.toLowerCase()) } },
    'nameKey'
  ).lean();

  const taken = new Set(existingUsers.map((item) => item.nameKey));
  const available = candidateList.filter((item) => !taken.has(item.toLowerCase()));

  if (available.length >= count) {
    return available.slice(0, count);
  }

  const fallbackSuggestions = [...available];
  let index = 1;
  while (fallbackSuggestions.length < count) {
    const fallback = `${safeBase}.${Date.now().toString().slice(-4)}${index}`;
    if (!taken.has(fallback.toLowerCase())) {
      fallbackSuggestions.push(fallback);
    }
    index += 1;
  }

  return fallbackSuggestions;
};

module.exports = {
  generateProfileNameSuggestions,
};
