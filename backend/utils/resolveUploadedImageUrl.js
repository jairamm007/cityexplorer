const { cloudinary, isCloudinaryEnabled } = require('../config/cloudinary');
const UploadedImage = require('../models/UploadedImage');

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder: 'cityexplorer/uploads',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result?.secure_url || '');
      }
    );
  });

const resolveUploadedImageUrl = async (file) => {
  if (!file) {
    return null;
  }

  if (isCloudinaryEnabled && file.buffer) {
    return uploadBufferToCloudinary(file);
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
