const express = require('express');
const { body } = require('express-validator');
const {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/cityController');
const { protect } = require('../middleware/userAuthMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const cityValidators = [
  body('cityName').trim().notEmpty().withMessage('City name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('state').optional({ values: 'falsy' }).trim(),
  body('location').optional({ values: 'falsy' }).trim(),
  body('imageUrl').optional({ values: 'falsy' }).trim(),
  body('latitude').optional({ values: 'falsy' }).isFloat().withMessage('Latitude must be numeric'),
  body('longitude').optional({ values: 'falsy' }).isFloat().withMessage('Longitude must be numeric'),
];

router.get('/', getCities);
router.get('/:id', getCityById);
router.post('/', protect, upload, cityValidators, createCity);
router.put('/:id', protect, upload, cityValidators, updateCity);
router.delete('/:id', protect, deleteCity);

module.exports = router;
