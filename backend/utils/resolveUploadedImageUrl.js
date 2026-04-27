const { cloudinary, isCloudinaryEnabled } = require('../config/cloudinary');

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

  if (file.filename) {
    return `/uploads/images/${file.filename}`;
  }

  return null;
};

module.exports = {
  resolveUploadedImageUrl,
};
