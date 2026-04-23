const mongoose = require('mongoose');

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

module.exports = mongoose.model('Review', reviewSchema);
