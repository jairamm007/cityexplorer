const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  updatePassword,
  addFavoriteCity,
  removeFavoriteCity,
  addFavoriteAttraction,
  removeFavoriteAttraction,
  addPlannedTrip,
  removePlannedTrip,
  deleteUserAccount,
} = require('../controllers/userProfileController');
const { protect } = require('../middleware/userAuthMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be 500 characters or less'),
    body('phone').optional().trim(),
    body('location').optional().trim(),
  ],
  updateUserProfile
);

router.post('/profile-image', protect, upload, uploadProfileImage);

// Update password
router.put(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  updatePassword
);

// Add favorite city
router.post('/favorites/add', protect, addFavoriteCity);

// Remove favorite city
router.post('/favorites/remove', protect, removeFavoriteCity);

// Add favorite attraction
router.post('/favorites/attractions/add', protect, addFavoriteAttraction);

// Remove favorite attraction
router.post('/favorites/attractions/remove', protect, removeFavoriteAttraction);

// Add planned trip / booking
router.post('/planned-trips/add', protect, addPlannedTrip);

// Remove planned trip / booking
router.post('/planned-trips/remove', protect, removePlannedTrip);

// Delete account
router.delete('/account', protect, deleteUserAccount);

module.exports = router;
