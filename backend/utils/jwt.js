const jwt = require('jsonwebtoken');

const DEFAULT_JWT_SECRET = 'CityExplorerSecretKey';

const getJwtSecret = () => {
  const configuredSecret = String(process.env.JWT_SECRET || '').trim();
  return configuredSecret || DEFAULT_JWT_SECRET;
};

const generateToken = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES || '7d' });

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  generateToken,
  verifyToken,
};
