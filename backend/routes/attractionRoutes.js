const express = require('express');
const { body } = require('express-validator');
const {
  getAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} = require('../controllers/attractionController');
const { protect } = require('../middleware/userAuthMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const attractionValidators = [
  body('cityId').notEmpty().withMessage('City is required'),
  body('name').notEmpty().withMessage('Attraction name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('imageUrl').optional({ values: 'falsy' }).trim(),
  body('latitude').optional({ values: 'falsy' }).isFloat().withMessage('Latitude must be numeric'),
  body('longitude').optional({ values: 'falsy' }).isFloat().withMessage('Longitude must be numeric'),
  body('timings').optional({ values: 'falsy' }).trim(),
  body('ticketPrice').optional({ values: 'falsy' }).trim(),
  body('bestTimeToVisit').optional({ values: 'falsy' }).trim(),
  body('travelTips').optional({ values: 'falsy' }).trim(),
];

router.get('/', getAttractions);
router.get('/:id', getAttractionById);
router.post('/', protect, upload, attractionValidators, createAttraction);
router.put('/:id', protect, upload, attractionValidators, updateAttraction);
router.delete('/:id', protect, deleteAttraction);

module.exports = router;
