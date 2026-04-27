const mongoose = require('mongoose');
const { normalizePersistedImageUrl } = require('../utils/imageUrl');

const reviewSchema = new mongoose.Schema(
  {
    attractionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attraction', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ attractionId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.pre('validate', function normalizeImage(next) {
  if (typeof this.imageUrl === 'string') {
    this.imageUrl = normalizePersistedImageUrl(this.imageUrl);
  }

  next();
});

module.exports = mongoose.model('Review', reviewSchema);
