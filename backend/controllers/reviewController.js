const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const { resolveUploadedImageUrl } = require('../utils/resolveUploadedImageUrl');

const getReviewsForAttraction = async (req, res) => {
  try {
    const reviews = await Review.find({ attractionId: req.params.attractionId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch reviews' });
  }
};

const addReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { attractionId, rating, comment } = req.body;
  try {
    const imageUrl = req.file ? await resolveUploadedImageUrl(req.file) : null;
    const review = await Review.create({
      attractionId,
      userId: req.user._id,
      rating,
      comment,
      imageUrl,
    });
    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit review' });
  }
};

module.exports = { getReviewsForAttraction, addReview };
