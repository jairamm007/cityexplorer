const dotenv = require('dotenv');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const connectDB = require('../config/db');
const Attraction = require('../models/Attraction');
const City = require('../models/City');
const UploadedImage = require('../models/UploadedImage');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sourceDir = process.env.PROVIDED_IMAGES_DIR || path.join(os.homedir(), 'Downloads', 'ce_web');

const contentTypes = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const providedAttractionImages = [
  { names: ['Gateway of India'], filename: 'gate way of india.jpeg' },
  { names: ['Howrah Bridge'], filename: 'howrah bridge.jpeg' },
  { names: ['India Gate'], filename: 'india gate.jpeg' },
  { names: ['Kanaka Durga Temple'], filename: 'kanaka durgamma temple.jpeg' },
  { names: ["Karim's", 'Karims'], filename: 'karmis.jpeg' },
  { names: ['Leopold Cafe'], filename: 'leopold cafe.jpeg' },
  { names: ['Peter Cat'], filename: 'peter cafe.jpeg' },
  { names: ['Prakasam Barrage'], filename: 'prakasam barage.jpeg' },
  { names: ['Qutub Minar'], filename: 'qutub minar.jpeg' },
  { names: ['Red Fort'], filename: 'red fort.jpeg' },
  { names: ['RK Beach'], filename: 'rk beach.jpeg' },
  { names: ['Science City'], filename: 'science city.jpeg' },
  { names: ['Select Citywalk', 'Select City Walk'], filename: 'select city walk.jpeg' },
  { names: ['Victoria Memorial'], filename: 'victoria memorial.jpeg' },
];

const providedCityImages = [
  { names: ['Mangalagiri'], filename: 'mangalgiri.jpeg' },
];

const getContentType = (filename) => contentTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildNameQuery = (fieldName, names) => ({
  $or: names.map((name) => ({ [fieldName]: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })),
});

const importImage = async (filename) => {
  const absolutePath = path.join(sourceDir, filename);
  const data = await fs.readFile(absolutePath);
  const uploadedImage = await UploadedImage.create({
    filename,
    contentType: getContentType(filename),
    size: data.length,
    data,
  });

  return `/api/images/${uploadedImage._id}`;
};

const updateRecords = async (Model, label, fieldName, items) => {
  for (const item of items) {
    const imageUrl = await importImage(item.filename);
    const result = await Model.updateMany(buildNameQuery(fieldName, item.names), {
      $set: { imageUrl },
    });

    console.log(`${label} ${item.names[0]}: matched ${result.matchedCount}, updated ${result.modifiedCount}, image ${imageUrl}`);
  }
};

const run = async () => {
  await connectDB();

  await updateRecords(Attraction, 'Attraction', 'name', providedAttractionImages);
  await updateRecords(City, 'City', 'cityName', providedCityImages);

  console.log('Provided images imported and applied.');
  process.exit(0);
};

run().catch((error) => {
  console.error('Unable to import provided images:', error.message);
  process.exit(1);
});
