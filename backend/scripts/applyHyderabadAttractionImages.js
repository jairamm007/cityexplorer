const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Attraction = require('../models/Attraction');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const localMongoUri = 'mongodb://127.0.0.1:27017/cityexplorer';

const attractionImages = [
  {
    names: ['Salar Jung Museum'],
    imageUrl: '/uploads/images/attraction-salar-jung-museum.png',
  },
  {
    names: ['Hussain Sagar'],
    imageUrl: '/uploads/images/attraction-hussain-sagar.png',
  },
  {
    names: ['Inorbit Mall', 'Inorbit Mall Hyderabad'],
    imageUrl: '/uploads/images/attraction-inorbit-mall-hyderabad.png',
  },
];

const getTargets = () => {
  const targets = [{ label: 'Local', uri: localMongoUri }];
  const configuredUri = String(process.env.MONGODB_URI || '').trim();

  if (configuredUri && configuredUri !== localMongoUri) {
    targets.push({ label: 'Configured', uri: configuredUri });
  }

  return targets;
};

const updateTarget = async ({ label, uri }) => {
  const connection = await mongoose.createConnection(uri).asPromise();
  const AttractionModel = connection.model('Attraction', Attraction.schema);
  let updatedCount = 0;

  for (const item of attractionImages) {
    const result = await AttractionModel.updateMany(
      { name: { $in: item.names } },
      { $set: { imageUrl: item.imageUrl } }
    );

    updatedCount += result.modifiedCount || 0;
  }

  console.log(`${label}: updated ${updatedCount} attraction image records`);
  await connection.close();
};

const run = async () => {
  try {
    for (const target of getTargets()) {
      await updateTarget(target);
    }

    console.log('Hyderabad attraction images applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to apply Hyderabad attraction images:', error.message);
    process.exit(1);
  }
};

run();
