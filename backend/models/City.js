const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    cityName: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    location: { type: String },
    description: { type: String, required: true },
    imageUrl: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

citySchema.index({ createdAt: -1 });
citySchema.index({ cityName: 1 });
citySchema.index({ country: 1 });
citySchema.index({ createdBy: 1 });

module.exports = mongoose.model('City', citySchema);
