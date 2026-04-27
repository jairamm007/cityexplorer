const mongoose = require('mongoose');
const { normalizePersistedImageUrl } = require('../utils/imageUrl');

const attractionSchema = new mongoose.Schema(
  {
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timings: { type: String },
    ticketPrice: { type: String },
    bestTimeToVisit: { type: String },
    travelTips: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attractionSchema.index({ createdAt: -1 });
attractionSchema.index({ cityId: 1, createdAt: -1 });
attractionSchema.index({ category: 1 });
attractionSchema.index({ createdBy: 1 });
attractionSchema.pre('validate', function normalizeImage(next) {
  if (typeof this.imageUrl === 'string') {
    this.imageUrl = normalizePersistedImageUrl(this.imageUrl);
  }

  next();
});

module.exports = mongoose.model('Attraction', attractionSchema);
