const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const City = require('../models/City');
const Attraction = require('../models/Attraction');
const User = require('../models/User');
const Review = require('../models/Review');
const { normalizePersistedImageUrl } = require('../utils/imageUrl');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const normalizeCollection = async (Model, label, field = 'imageUrl') => {
  const docs = await Model.find({}, field);
  let updatedCount = 0;

  for (const doc of docs) {
    const nextImageUrl = normalizePersistedImageUrl(doc[field]);
    if (nextImageUrl !== doc[field]) {
      doc[field] = nextImageUrl;
      await doc.save();
      updatedCount += 1;
    }
  }

  console.log(`${label}: updated ${updatedCount} records`);
};

const run = async () => {
  try {
    await connectDB();
    await normalizeCollection(City, 'Cities');
    await normalizeCollection(Attraction, 'Attractions');
    await normalizeCollection(User, 'Users', 'profileImage');
    await normalizeCollection(Review, 'Reviews');
    console.log('Image URL normalization completed');
    process.exit(0);
  } catch (error) {
    console.error('Failed to normalize image URLs:', error.message);
    process.exit(1);
  }
};

run();
