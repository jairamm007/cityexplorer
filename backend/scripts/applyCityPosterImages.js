const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const City = require('../models/City');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cityPosterMap = {
  mumbai: '/uploads/images/city-mumbai.jpeg',
  kolkata: '/uploads/images/city-kolkata.jpeg',
  delhi: '/uploads/images/city-delhi.jpeg',
  chennai: '/uploads/images/city-chennai.jpeg',
  bangalore: '/uploads/images/city-bangalore.jpeg',
  bengaluru: '/uploads/images/city-bangalore.jpeg',
  hyderabad: '/uploads/images/city-hyderabad.jpeg',
  vijayawada: '/uploads/images/city-vijayawada.jpeg',
  mangalagiri: '/uploads/images/city-mangalagiri.jpeg',
  vizag: '/uploads/images/city-vizag.jpeg',
  visakhapatnam: '/uploads/images/city-vizag.jpeg',
};

const run = async () => {
  try {
    await connectDB();

    const cities = await City.find({}, 'cityName imageUrl');
    let updatedCount = 0;

    for (const city of cities) {
      const key = String(city.cityName || '').trim().toLowerCase();
      const mappedImage = cityPosterMap[key];
      if (!mappedImage) {
        continue;
      }

      if (city.imageUrl !== mappedImage) {
        city.imageUrl = mappedImage;
        await city.save();
        updatedCount += 1;
      }
    }

    console.log(`Updated ${updatedCount} cities with poster images`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to apply city poster images:', error.message);
    process.exit(1);
  }
};

run();
