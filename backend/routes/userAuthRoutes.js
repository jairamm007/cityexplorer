const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  googleSignIn,
  checkProfileNameAvailability,
  getProfile,
} = require('../controllers/userAuthController');
const { protect } = require('../middleware/userAuthMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or profile name is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

router.post('/google', googleSignIn);
router.get('/profile-name-status', checkProfileNameAvailability);
router.get('/profile', protect, getProfile);

module.exports = router;
