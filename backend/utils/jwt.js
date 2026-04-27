const jwt = require('jsonwebtoken');

const DEFAULT_JWT_SECRET = 'CityExplorerSecretKey';

const getJwtSecret = () => {
  const configuredSecret = String(process.env.JWT_SECRET || '').trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return DEFAULT_JWT_SECRET;
};

const generateToken = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES || '7d' });

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  generateToken,
  verifyToken,
};
