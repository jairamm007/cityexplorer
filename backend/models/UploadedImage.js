const mongoose = require('mongoose');

const uploadedImageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

uploadedImageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UploadedImage', uploadedImageSchema);
