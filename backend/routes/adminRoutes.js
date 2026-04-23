const express = require('express');
const { body } = require('express-validator');
const {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  updateAdminPassword,
  getAdminOverview,
} = require('../controllers/adminAuthController');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/adminUserController');
const { protect } = require('../middleware/userAuthMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/auth/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  adminLogin
);

router.get('/auth/profile', protect, requireAdmin, getAdminProfile);
router.put(
  '/auth/profile',
  protect,
  requireAdmin,
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  updateAdminProfile
);
router.post('/auth/profile-image', protect, requireAdmin, upload, uploadAdminProfileImage);
router.put(
  '/auth/update-password',
  protect,
  requireAdmin,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  updateAdminPassword
);
router.get('/overview', protect, requireAdmin, getAdminOverview);
router.get('/users', protect, requireAdmin, getUsers);
router.put(
  '/users/:id/role',
  protect,
  requireAdmin,
  [body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')],
  updateUserRole
);
router.delete('/users/:id', protect, requireAdmin, deleteUser);

module.exports = router;