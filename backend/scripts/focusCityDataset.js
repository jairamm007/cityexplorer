const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const City = require('../models/City');
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cityImage = {
  Mumbai: '/uploads/images/city-mumbai.jpeg',
  Kolkata: '/uploads/images/city-kolkata.jpeg',
  Delhi: '/uploads/images/city-delhi.jpeg',
  Chennai: '/uploads/images/city-chennai.jpeg',
  Bangalore: '/uploads/images/city-bangalore.jpeg',
  Hyderabad: '/uploads/images/city-hyderabad.jpeg',
  Vijayawada: '/uploads/images/city-vijayawada.jpeg',
  Mangalagiri: '/uploads/images/city-mangalagiri.jpeg',
  Vizag: '/uploads/images/city-vizag.jpeg',
};

const attractionImage = {
  Charminar: '/uploads/images/attraction-charminar.png',
  'Golconda Fort': '/uploads/images/attraction-golconda-fort.png',
  'Salar Jung Museum': '/uploads/images/attraction-salar-jung-museum.png',
  'Hussain Sagar': '/uploads/images/attraction-hussain-sagar.png',
  'Inorbit Mall': '/uploads/images/attraction-inorbit-mall-hyderabad.png',
  'Inorbit Mall Hyderabad': '/uploads/images/attraction-inorbit-mall-hyderabad.png',
  'Cubbon Park': '/uploads/images/attraction-cubbon-park.png',
  'Orion Mall': '/uploads/images/attraction-orion-mall.png',
  MTR: '/uploads/images/attraction-mtr-bengaluru.png',
  'MTR Bengaluru': '/uploads/images/attraction-mtr-bengaluru.png',
  'Undavalli Caves': '/uploads/images/attraction-undavalli-caves.png',
  'Bhavani Island': '/uploads/images/attraction-bhavani-island.png',
  'PVP Square Mall': '/uploads/images/attraction-pvp-square-mall.png',
  'Mangalagiri Eco Park': '/uploads/images/attraction-mangalagiri-eco-park.png',
  'Mangalagiri Handloom Market': '/uploads/images/attraction-mangalagiri-handloom-market.png',
  'Capital Mall Mangalagiri': '/uploads/images/attraction-capital-mall-mangalagiri.png',
  'Andhra Spice Kitchen Mangalagiri': '/uploads/images/attraction-andhra-spice-kitchen-mangalagiri.png',
  'RK Beach': '/uploads/images/attraction-rk-beach.png',
  Kailasagiri: '/uploads/images/attraction-kailasagiri.png',
  'INS Kurusura Submarine Museum': '/uploads/images/attraction-ins-kurusura-submarine-museum.png',
  'CMR Central Vizag': '/uploads/images/attraction-cmr-central-vizag.png',
  'Dharani Restaurant': '/uploads/images/attraction-dharani-restaurant-vizag.png',
  'Dharani Restaurant Vizag': '/uploads/images/attraction-dharani-restaurant-vizag.png',
};

const targetCities = [
  {
    cityName: 'Mumbai',
    country: 'India',
    state: 'Maharashtra',
    location: 'Arabian Sea coast',
    description: 'Financial capital with heritage landmarks, sea views, premium shopping, and iconic food culture.',
    imageUrl: cityImage.Mumbai,
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    cityName: 'Kolkata',
    country: 'India',
    state: 'West Bengal',
    location: 'Hooghly riverfront',
    description: 'Cultural capital known for colonial architecture, books, trams, and classic Bengali cuisine.',
    imageUrl: cityImage.Kolkata,
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    cityName: 'Delhi',
    country: 'India',
    state: 'Delhi',
    location: 'National Capital Region',
    description: 'Historic and modern capital with forts, monuments, museums, markets, and global food.',
    imageUrl: cityImage.Delhi,
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    cityName: 'Chennai',
    country: 'India',
    state: 'Tamil Nadu',
    location: 'Coromandel Coast',
    description: 'Coastal metro known for temples, beaches, Carnatic culture, and South Indian food.',
    imageUrl: cityImage.Chennai,
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    cityName: 'Bangalore',
    country: 'India',
    state: 'Karnataka',
    location: 'Southern plateau',
    description: 'Tech hub with gardens, breweries, malls, startup culture, and varied cuisine.',
    imageUrl: cityImage.Bangalore,
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    cityName: 'Hyderabad',
    country: 'India',
    state: 'Telangana',
    location: 'Deccan Plateau',
    description: 'Historic city blending old monuments, IT districts, biryani, and nightlife.',
    imageUrl: cityImage.Hyderabad,
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    cityName: 'Vijayawada',
    country: 'India',
    state: 'Andhra Pradesh',
    location: 'Krishna riverfront',
    description: 'Fast-growing city with temple hills, shopping roads, river views, and rich Andhra flavors.',
    imageUrl: cityImage.Vijayawada,
    latitude: 16.5062,
    longitude: 80.648,
  },
  {
    cityName: 'Mangalagiri',
    country: 'India',
    state: 'Andhra Pradesh',
    location: 'Guntur district',
    description: 'Temple town known for Panakala Narasimha Swamy temple and proximity to Vijayawada-Amaravati belt.',
    imageUrl: cityImage.Mangalagiri,
    latitude: 16.4304,
    longitude: 80.5682,
  },
  {
    cityName: 'Vizag',
    country: 'India',
    state: 'Andhra Pradesh',
    location: 'Bay of Bengal coast',
    description: 'Port city with beaches, hills, museums, and a strong tourism and naval identity.',
    imageUrl: cityImage.Vizag,
    latitude: 17.6868,
    longitude: 83.2185,
  },
];

const targetPlaces = {
  Mumbai: [
    { name: 'Gateway of India', category: 'Landmark', location: 'Colaba, Mumbai', latitude: 18.922, longitude: 72.8347 },
    { name: 'Marine Drive', category: 'Scenic spot', location: 'South Mumbai', latitude: 18.943, longitude: 72.8238 },
    { name: 'Juhu Beach', category: 'Beach', location: 'Juhu, Mumbai', latitude: 19.099, longitude: 72.8264 },
    { name: 'Siddhivinayak Temple', category: 'Temple', location: 'Prabhadevi, Mumbai', latitude: 19.0176, longitude: 72.8302 },
    { name: 'Phoenix Palladium', category: 'Mall', location: 'Lower Parel, Mumbai', latitude: 18.9941, longitude: 72.8258 },
    { name: 'Leopold Cafe', category: 'Restaurant', location: 'Colaba, Mumbai', latitude: 18.9227, longitude: 72.8328 },
  ],
  Kolkata: [
    { name: 'Victoria Memorial', category: 'Monument', location: 'Maidan, Kolkata', latitude: 22.5448, longitude: 88.3426 },
    { name: 'Howrah Bridge', category: 'Landmark', location: 'Howrah-Kolkata', latitude: 22.585, longitude: 88.3468 },
    { name: 'Dakshineswar Kali Temple', category: 'Temple', location: 'Dakshineswar, Kolkata', latitude: 22.6557, longitude: 88.3573 },
    { name: 'Science City', category: 'Museum', location: 'EM Bypass, Kolkata', latitude: 22.5401, longitude: 88.3966 },
    { name: 'South City Mall', category: 'Mall', location: 'Jadavpur, Kolkata', latitude: 22.5014, longitude: 88.3614 },
    { name: 'Peter Cat', category: 'Restaurant', location: 'Park Street, Kolkata', latitude: 22.5526, longitude: 88.3526 },
  ],
  Delhi: [
    { name: 'Red Fort', category: 'Historical monument', location: 'Old Delhi', latitude: 28.6562, longitude: 77.241 },
    { name: 'India Gate', category: 'Landmark', location: 'Central Delhi', latitude: 28.6129, longitude: 77.2295 },
    { name: 'Qutub Minar', category: 'Historical monument', location: 'Mehrauli, Delhi', latitude: 28.5244, longitude: 77.1855 },
    { name: 'Akshardham Temple', category: 'Temple', location: 'NH24, Delhi', latitude: 28.6127, longitude: 77.2773 },
    { name: 'Select Citywalk', category: 'Mall', location: 'Saket, Delhi', latitude: 28.5287, longitude: 77.2197 },
    { name: 'Karims', category: 'Restaurant', location: 'Jama Masjid, Delhi', latitude: 28.6507, longitude: 77.2334 },
  ],
  Chennai: [
    { name: 'Marina Beach', category: 'Beach', location: 'Marina, Chennai', latitude: 13.0505, longitude: 80.2824 },
    { name: 'Kapaleeshwarar Temple', category: 'Temple', location: 'Mylapore, Chennai', latitude: 13.0339, longitude: 80.2697 },
    { name: 'Fort St George', category: 'Historical monument', location: 'Rajaji Salai, Chennai', latitude: 13.0796, longitude: 80.287 },
    { name: 'Government Museum', category: 'Museum', location: 'Egmore, Chennai', latitude: 13.0722, longitude: 80.2641 },
    { name: 'Express Avenue Mall', category: 'Mall', location: 'Royapettah, Chennai', latitude: 13.0608, longitude: 80.2612 },
    { name: 'Murugan Idli Shop', category: 'Restaurant', location: 'T Nagar, Chennai', latitude: 13.0418, longitude: 80.2341 },
  ],
  Bangalore: [
    { name: 'Lalbagh Botanical Garden', category: 'Garden', location: 'Lalbagh, Bangalore', latitude: 12.9507, longitude: 77.5848 },
    { name: 'Bangalore Palace', category: 'Palace', location: 'Vasanth Nagar, Bangalore', latitude: 12.9982, longitude: 77.5925 },
    { name: 'Cubbon Park', category: 'Park', location: 'Central Bangalore', latitude: 12.9763, longitude: 77.5929 },
    { name: 'ISKCON Temple Bangalore', category: 'Temple', location: 'Rajajinagar, Bangalore', latitude: 13.0098, longitude: 77.5511 },
    { name: 'Orion Mall', category: 'Mall', location: 'Rajajinagar, Bangalore', latitude: 13.0117, longitude: 77.555 },
    { name: 'MTR Bengaluru', category: 'Restaurant', location: 'Lalbagh Road, Bangalore', latitude: 12.9551, longitude: 77.5854 },
  ],
  Hyderabad: [
    { name: 'Charminar', category: 'Landmark', location: 'Old City, Hyderabad', latitude: 17.3616, longitude: 78.4747 },
    { name: 'Golconda Fort', category: 'Fort', location: 'Ibrahim Bagh, Hyderabad', latitude: 17.3833, longitude: 78.4011 },
    { name: 'Salar Jung Museum', category: 'Museum', location: 'Darulshifa, Hyderabad', latitude: 17.3713, longitude: 78.4804 },
    { name: 'Hussain Sagar', category: 'Lake', location: 'Hyderabad', latitude: 17.4239, longitude: 78.4738 },
    { name: 'Inorbit Mall Hyderabad', category: 'Mall', location: 'Madhapur, Hyderabad', latitude: 17.4344, longitude: 78.3866 },
    { name: 'Paradise Biryani', category: 'Restaurant', location: 'Secunderabad, Hyderabad', latitude: 17.4417, longitude: 78.4983 },
  ],
  Vijayawada: [
    { name: 'Kanaka Durga Temple', category: 'Temple', location: 'Indrakeeladri, Vijayawada', latitude: 16.5083, longitude: 80.6131 },
    { name: 'Prakasam Barrage', category: 'Landmark', location: 'Krishna River, Vijayawada', latitude: 16.5067, longitude: 80.6161 },
    { name: 'Undavalli Caves', category: 'Historical site', location: 'Undavalli', latitude: 16.4957, longitude: 80.5748 },
    { name: 'Bhavani Island', category: 'Park', location: 'Vijayawada', latitude: 16.5273, longitude: 80.6293 },
    { name: 'PVP Square Mall', category: 'Mall', location: 'Labbipet, Vijayawada', latitude: 16.5069, longitude: 80.6486 },
    { name: 'Babai Hotel', category: 'Restaurant', location: 'Governor Peta, Vijayawada', latitude: 16.5185, longitude: 80.6282 },
  ],
  Mangalagiri: [
    { name: 'Panakala Narasimha Swamy Temple', category: 'Temple', location: 'Mangalagiri Hill', latitude: 16.4394, longitude: 80.5582 },
    { name: 'Lakshmi Narasimha Swamy Temple', category: 'Temple', location: 'Mangalagiri', latitude: 16.4301, longitude: 80.5631 },
    { name: 'Mangalagiri Eco Park', category: 'Park', location: 'Mangalagiri', latitude: 16.427, longitude: 80.564 },
    { name: 'Mangalagiri Handloom Market', category: 'Market', location: 'Mangalagiri', latitude: 16.4292, longitude: 80.5648 },
    { name: 'Capital Mall Mangalagiri', category: 'Mall', location: 'Near Amaravati Road, Mangalagiri', latitude: 16.4441, longitude: 80.5738 },
    { name: 'Andhra Spice Kitchen Mangalagiri', category: 'Restaurant', location: 'Mangalagiri', latitude: 16.4315, longitude: 80.5654 },
  ],
  Vizag: [
    { name: 'RK Beach', category: 'Beach', location: 'Beach Road, Vizag', latitude: 17.71, longitude: 83.3215 },
    { name: 'Kailasagiri', category: 'Hill park', location: 'Vizag', latitude: 17.7498, longitude: 83.3426 },
    { name: 'INS Kurusura Submarine Museum', category: 'Museum', location: 'Beach Road, Vizag', latitude: 17.7178, longitude: 83.3322 },
    { name: 'Simhachalam Temple', category: 'Temple', location: 'Simhachalam, Vizag', latitude: 17.7676, longitude: 83.2529 },
    { name: 'CMR Central Vizag', category: 'Mall', location: 'Maddilapalem, Vizag', latitude: 17.7283, longitude: 83.3152 },
    { name: 'Dharani Restaurant Vizag', category: 'Restaurant', location: 'Vizag', latitude: 17.7235, longitude: 83.3065 },
  ],
};

const imageForCategory = (category) => {
  const key = category.toLowerCase();
  if (key.includes('restaurant')) return 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80';
  if (key.includes('mall') || key.includes('market')) return 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80';
  if (key.includes('beach') || key.includes('lake')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  if (key.includes('park') || key.includes('garden') || key.includes('hill')) return 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80';
  if (key.includes('museum')) return 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80';
  if (key.includes('temple')) return 'https://images.unsplash.com/photo-1624958723474-8f5a75ef0cbb?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
};

const imageForPlace = (place) => attractionImage[place.name] || imageForCategory(place.category);

const run = async () => {
  try {
    await connectDB();

    const keptCityIds = [];
    const cityIdByName = {};

    for (const city of targetCities) {
      const doc = await City.findOneAndUpdate(
        { cityName: city.cityName },
        { $set: city },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      keptCityIds.push(doc._id);
      cityIdByName[city.cityName] = doc._id;
    }

    await Attraction.deleteMany({ cityId: { $nin: keptCityIds } });
    await City.deleteMany({ _id: { $nin: keptCityIds } });

    for (const city of targetCities) {
      const cityId = cityIdByName[city.cityName];
      const places = targetPlaces[city.cityName] || [];
      const allowedNames = places.map((item) => item.name);

      await Attraction.deleteMany({
        cityId,
        name: { $nin: allowedNames },
      });

      for (const item of places) {
        await Attraction.findOneAndUpdate(
          { cityId, name: item.name },
          {
            $set: {
              cityId,
              name: item.name,
              description: `${item.name} is a popular ${item.category.toLowerCase()} in ${city.cityName}.`,
              location: item.location,
              category: item.category,
              imageUrl: imageForPlace(item),
              latitude: item.latitude,
              longitude: item.longitude,
              timings: '9:00 AM - 9:00 PM',
              ticketPrice: item.category.toLowerCase().includes('restaurant') ? 'Approx. INR 800 for two' : 'Entry varies by season',
              bestTimeToVisit: 'October to March',
              travelTips: `Best visited during daytime; combine nearby spots in ${city.cityName} for a complete trip.`,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    const finalAttractions = await Attraction.find({ cityId: { $in: keptCityIds } }).select('_id');
    const attractionIds = finalAttractions.map((item) => item._id);

    await Review.deleteMany({ attractionId: { $nin: attractionIds } });

    await User.updateMany(
      {},
      {
        $pull: {
          favoriteDestinations: { $nin: keptCityIds },
          favoriteAttractions: { $nin: attractionIds },
          plannedTrips: { attractionId: { $nin: attractionIds } },
        },
      }
    );

    console.log('City dataset focused successfully.');
    console.log(`Cities kept: ${targetCities.length}`);
    console.log(`Places now available: ${attractionIds.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to focus dataset:', error);
    process.exit(1);
  }
};

run();
