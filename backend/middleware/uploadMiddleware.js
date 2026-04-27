const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { isCloudinaryEnabled } = require('../config/cloudinary');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const imagesDirectory = path.join(uploadDirectory, 'images');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: imagesDirectory,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const storage = isCloudinaryEnabled ? multer.memoryStorage() : diskStorage;

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');

module.exports = upload;
