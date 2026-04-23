const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/userAuthMiddleware');
const { addReview, getReviewsForAttraction } = require('../controllers/reviewController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/:attractionId', getReviewsForAttraction);
router.post(
  '/',
  protect,
  upload,
  [
    body('attractionId').notEmpty().withMessage('Attraction ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
  ],
  addReview
);

module.exports = router;
