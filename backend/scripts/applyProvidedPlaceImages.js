const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Attraction = require('../models/Attraction');
const City = require('../models/City');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const placeImages = [
  { names: ['Gateway of India'], imageUrl: '/uploads/images/attraction-gateway-of-india.jpeg' },
  { names: ['Howrah Bridge'], imageUrl: '/uploads/images/attraction-howrah-bridge.jpeg' },
  { names: ['India Gate'], imageUrl: '/uploads/images/attraction-india-gate.jpeg' },
  { names: ['Kanaka Durga Temple'], imageUrl: '/uploads/images/attraction-kanaka-durga-temple.jpeg' },
  { names: ["Karim's", 'Karims'], imageUrl: '/uploads/images/attraction-karims.jpeg' },
  { names: ['Leopold Cafe'], imageUrl: '/uploads/images/attraction-leopold-cafe.jpeg' },
  { names: ['Peter Cat'], imageUrl: '/uploads/images/attraction-peter-cat.jpeg' },
  { names: ['Prakasam Barrage'], imageUrl: '/uploads/images/attraction-prakasam-barrage.jpeg' },
  { names: ['Qutub Minar'], imageUrl: '/uploads/images/attraction-qutub-minar.jpeg' },
  { names: ['Red Fort'], imageUrl: '/uploads/images/attraction-red-fort.jpeg' },
  { names: ['RK Beach'], imageUrl: '/uploads/images/attraction-rk-beach.jpeg' },
  { names: ['Science City'], imageUrl: '/uploads/images/attraction-science-city.jpeg' },
  { names: ['Select Citywalk', 'Select City Walk'], imageUrl: '/uploads/images/attraction-select-citywalk.jpeg' },
  { names: ['Victoria Memorial'], imageUrl: '/uploads/images/attraction-victoria-memorial.jpeg' },
];

const cityImages = [
  { names: ['Mangalagiri'], imageUrl: '/uploads/images/city-mangalagiri.jpeg' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildNameQuery = (names) => ({
  $or: names.map((name) => ({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })),
});

const buildCityNameQuery = (names) => ({
  $or: names.map((name) => ({ cityName: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })),
});

const applyImages = async () => {
  await connectDB();

  for (const item of placeImages) {
    const result = await Attraction.updateMany(buildNameQuery(item.names), {
      $set: { imageUrl: item.imageUrl },
    });
    console.log(`${item.names[0]}: matched ${result.matchedCount}, updated ${result.modifiedCount}`);
  }

  for (const item of cityImages) {
    const result = await City.updateMany(buildCityNameQuery(item.names), {
      $set: { imageUrl: item.imageUrl },
    });
    console.log(`${item.names[0]} city: matched ${result.matchedCount}, updated ${result.modifiedCount}`);
  }

  console.log('Provided place images applied.');
  process.exit(0);
};

applyImages().catch((error) => {
  console.error('Unable to apply provided place images:', error);
  process.exit(1);
});
