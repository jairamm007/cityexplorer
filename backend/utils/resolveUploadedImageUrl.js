const UploadedImage = require('../models/UploadedImage');

const resolveUploadedImageUrl = async (file) => {
  if (!file) {
    return null;
  }

  if (file.buffer) {
    const uploadedImage = await UploadedImage.create({
      filename: file.originalname || 'uploaded-image',
      contentType: file.mimetype,
      size: file.size,
      data: file.buffer,
    });

    return `/api/images/${uploadedImage._id}`;
  }

  return null;
};

module.exports = {
  resolveUploadedImageUrl,
};
