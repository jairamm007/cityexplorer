const mongoose = require('mongoose');
const City = require('../models/City');

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
    await mongoose.connect('mongodb://localhost:27017/cityexplorer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to local MongoDB');

    const cities = await City.find({}, 'cityName imageUrl');
    let updatedCount = 0;

    for (const city of cities) {
      const key = String(city.cityName || '').trim().toLowerCase();
      const mappedImage = cityPosterMap[key];
      if (!mappedImage) {
        console.log(`No poster mapping for: ${city.cityName}`);
        continue;
      }

      if (city.imageUrl !== mappedImage) {
        city.imageUrl = mappedImage;
        await city.save();
        console.log(`Updated: ${city.cityName} -> ${mappedImage}`);
        updatedCount += 1;
      }
    }

    console.log(`\nTotal updated: ${updatedCount} cities with poster images`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to apply city poster images:', error.message);
    process.exit(1);
  }
};

run();
