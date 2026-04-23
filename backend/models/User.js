const mongoose = require('mongoose');

const plannedTripSchema = new mongoose.Schema(
  {
    attractionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attraction', required: true },
    visitDate: { type: Date },
    travelers: { type: Number, default: 1, min: 1 },
    notes: { type: String, trim: true, maxlength: 300 },
    bookingStatus: {
      type: String,
      enum: ['saved', 'booked'],
      default: 'saved',
    },
    bookedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: {
      type: String,
      required() {
        return this.authProvider !== 'google';
      },
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    profileImage: { type: String },
    bio: { type: String, maxlength: 500 },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    location: { type: String },
    favoriteDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
    favoriteAttractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attraction' }],
    plannedTrips: [plannedTripSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
