const dotenv = require('dotenv');
const fs = require('fs/promises');
const path = require('path');
const connectDB = require('../config/db');
const City = require('../models/City');
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const User = require('../models/User');
const UploadedImage = require('../models/UploadedImage');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uploadsRoot = path.join(__dirname, '..', 'uploads');

const contentTypes = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const getContentType = (filename) => contentTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream';

const migrateModel = async (Model, label, field = 'imageUrl') => {
  const docs = await Model.find({
    [field]: { $regex: '^/uploads/images/', $options: 'i' },
  }).select(field);

  let migrated = 0;
  let missing = 0;

  for (const doc of docs) {
    const imagePath = doc[field];
    const relativePath = imagePath.replace(/^\/uploads\//i, '');
    const absolutePath = path.join(uploadsRoot, relativePath);

    try {
      const data = await fs.readFile(absolutePath);
      const uploadedImage = await UploadedImage.create({
        filename: path.basename(absolutePath),
        contentType: getContentType(absolutePath),
        size: data.length,
        data,
      });

      doc[field] = `/api/images/${uploadedImage._id}`;
      await doc.save();
      migrated += 1;
    } catch (error) {
      missing += 1;
      console.warn(`${label}: unable to migrate ${imagePath}: ${error.message}`);
    }
  }

  console.log(`${label}: migrated ${migrated}, missing ${missing}`);
};

const run = async () => {
  await connectDB();

  await migrateModel(City, 'Cities');
  await migrateModel(Attraction, 'Attractions');
  await migrateModel(Review, 'Reviews');
  await migrateModel(User, 'Users', 'profileImage');

  console.log('Local upload migration complete.');
  process.exit(0);
};

run().catch((error) => {
  console.error('Local upload migration failed:', error);
  process.exit(1);
});
