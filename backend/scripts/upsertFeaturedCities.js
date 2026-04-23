const dotenv = require('dotenv');
const connectDB = require('../config/db');
const City = require('../models/City');
const Attraction = require('../models/Attraction');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const featuredCities = [
  {
    cityName: 'Hyderabad',
    country: 'India',
    state: 'Telangana',
    location: 'Deccan Plateau',
    description:
      'A historic city blending grand Islamic architecture, technology hubs, lakeside sights, world-famous biryani, shopping zones, and modern hangouts.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    cityName: 'Vijayawada',
    country: 'India',
    state: 'Andhra Pradesh',
    location: 'Banks of the Krishna River',
    description:
      'A vibrant Andhra city known for the Kanaka Durga Temple, riverfront views, shopping hubs, local food, and easy access to historic cave sites.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5062,
    longitude: 80.648,
  },
];

const featuredAttractions = [
  {
    cityName: 'Hyderabad',
    name: 'Charminar',
    description:
      'The signature 16th-century monument of Hyderabad and one of India\'s most recognized city landmarks.',
    location: 'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002, India',
    category: 'Landmark',
    imageUrl: 'https://images.unsplash.com/photo-1588416499018-d74cead4a0fb?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.3616,
    longitude: 78.4747,
    timings: '9:30 AM - 5:30 PM',
    ticketPrice: 'INR 25',
    bestTimeToVisit: 'Evening',
    travelTips: 'Explore Laad Bazaar nearby for bangles and local shopping.',
  },
  {
    cityName: 'Hyderabad',
    name: 'Golconda Fort',
    description:
      'A massive hill fort known for panoramic views, acoustic design, and royal history.',
    location: 'Khair Complex, Ibrahim Bagh, Hyderabad, Telangana 500008, India',
    category: 'Fort',
    imageUrl: 'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.3833,
    longitude: 78.4011,
    timings: '9:00 AM - 5:30 PM',
    ticketPrice: 'INR 25',
    bestTimeToVisit: 'Late afternoon',
    travelTips: 'Stay for sunset views if weather permits.',
  },
  {
    cityName: 'Hyderabad',
    name: 'Salar Jung Museum',
    description:
      'One of India\'s most celebrated museums, known for its vast art, sculpture, clock, and decorative collections.',
    location: 'Darulshifa, Hyderabad, Telangana 500002, India',
    category: 'Museum',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.3713,
    longitude: 78.4804,
    timings: '10:00 AM - 5:00 PM',
    ticketPrice: 'INR 50',
    bestTimeToVisit: 'Morning',
    travelTips: 'Keep at least 2-3 hours because the museum complex is very large.',
  },
  {
    cityName: 'Hyderabad',
    name: 'Inorbit Mall',
    description:
      'A popular shopping and entertainment mall in Hitec City with fashion stores, multiplex screens, and dining options.',
    location: 'Mindspace, Madhapur, Hyderabad, Telangana 500081, India',
    category: 'Mall',
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.4344,
    longitude: 78.3866,
    timings: '11:00 AM - 10:00 PM',
    ticketPrice: 'Free entry',
    bestTimeToVisit: 'Afternoon or evening',
    travelTips: 'Good option for indoor shopping and food when the weather is hot or rainy.',
  },
  {
    cityName: 'Hyderabad',
    name: 'Paradise Biryani',
    description:
      'A famous Hyderabad restaurant closely associated with the city\'s iconic biryani culture.',
    location: 'SD Road, Secunderabad, Hyderabad, Telangana 500003, India',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.4417,
    longitude: 78.4983,
    timings: '11:00 AM - 11:00 PM',
    ticketPrice: 'Approx. INR 1000 for two',
    bestTimeToVisit: 'Lunch or dinner',
    travelTips: 'Expect a crowd during weekends and meal rush hours.',
  },
  {
    cityName: 'Hyderabad',
    name: 'Shah Ghouse',
    description:
      'A favorite Hyderabad restaurant for biryani, grilled dishes, and late-night food runs.',
    location: 'Tolichowki, Hyderabad, Telangana 500008, India',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    latitude: 17.4039,
    longitude: 78.4336,
    timings: '12:00 PM - 12:00 AM',
    ticketPrice: 'Approx. INR 900 for two',
    bestTimeToVisit: 'Dinner',
    travelTips: 'Expect a busy dinner rush, especially on weekends.',
  },
  {
    cityName: 'Vijayawada',
    name: 'Kanaka Durga Temple',
    description:
      'A revered hilltop temple dedicated to Goddess Durga with sweeping views of the Krishna River and the city.',
    location: 'Indrakeeladri Hill, Vijayawada, Andhra Pradesh 520001, India',
    category: 'Temple',
    imageUrl: 'https://images.unsplash.com/photo-1624958723474-8f5a75ef0cbb?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5083,
    longitude: 80.6131,
    timings: '4:00 AM - 9:00 PM',
    ticketPrice: 'Free',
    bestTimeToVisit: 'Early morning',
    travelTips: 'Go early in the day to avoid long darshan queues and heat.',
  },
  {
    cityName: 'Vijayawada',
    name: 'Prakasam Barrage',
    description:
      'An iconic river barrage and viewpoint that lights up beautifully in the evening along the Krishna waterfront.',
    location: 'Krishna River, Vijayawada, Andhra Pradesh, India',
    category: 'Landmark',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5067,
    longitude: 80.6161,
    timings: 'Open 24 hours',
    ticketPrice: 'Free',
    bestTimeToVisit: 'Evening',
    travelTips: 'Best visited around sunset when the riverfront gets cooler and more scenic.',
  },
  {
    cityName: 'Vijayawada',
    name: 'Undavalli Caves',
    description:
      'Ancient rock-cut caves near Vijayawada known for their monolithic architecture and peaceful hill views.',
    location: 'Undavalli, Andhra Pradesh 522501, India',
    category: 'Historical site',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.4957,
    longitude: 80.5748,
    timings: '9:00 AM - 6:00 PM',
    ticketPrice: 'INR 20',
    bestTimeToVisit: 'Morning or late afternoon',
    travelTips: 'Combine it with a short outing across the Krishna river for a half-day plan.',
  },
  {
    cityName: 'Vijayawada',
    name: 'PVP Square Mall',
    description:
      'A central Vijayawada mall with shopping, movie screens, food outlets, and indoor entertainment.',
    location: 'MG Road, Labbipet, Vijayawada, Andhra Pradesh 520010, India',
    category: 'Mall',
    imageUrl: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5069,
    longitude: 80.6486,
    timings: '10:00 AM - 10:00 PM',
    ticketPrice: 'Free entry',
    bestTimeToVisit: 'Afternoon or evening',
    travelTips: 'Useful for a relaxed indoor break after local sightseeing.',
  },
  {
    cityName: 'Vijayawada',
    name: 'Babai Hotel',
    description:
      'A well-known Vijayawada restaurant loved for classic Andhra breakfasts, meals, and local comfort food.',
    location: 'Governor Peta, Vijayawada, Andhra Pradesh 520002, India',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5185,
    longitude: 80.6282,
    timings: '7:00 AM - 10:30 PM',
    ticketPrice: 'Approx. INR 500 for two',
    bestTimeToVisit: 'Breakfast or lunch',
    travelTips: 'Great stop to try local Andhra flavors without overplanning.',
  },
  {
    cityName: 'Vijayawada',
    name: 'RR Durbar',
    description:
      'A popular Vijayawada restaurant known for spicy Andhra meals, biryani, and family dining.',
    location: 'Benz Circle, Vijayawada, Andhra Pradesh 520010, India',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    latitude: 16.5016,
    longitude: 80.6466,
    timings: '12:00 PM - 11:00 PM',
    ticketPrice: 'Approx. INR 900 for two',
    bestTimeToVisit: 'Lunch or dinner',
    travelTips: 'A dependable stop for richer Andhra meals after city shopping or temple visits.',
  },
];

const upsertData = async () => {
  try {
    await connectDB();

    const cityIds = {};

    for (const city of featuredCities) {
      const savedCity = await City.findOneAndUpdate(
        { cityName: city.cityName },
        { $set: city },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      cityIds[city.cityName] = savedCity._id;
    }

    for (const item of featuredAttractions) {
      const cityId = cityIds[item.cityName] || (await City.findOne({ cityName: item.cityName }))?._id;

      if (!cityId) {
        continue;
      }

      await Attraction.findOneAndUpdate(
        { cityId, name: item.name },
        {
          $set: {
            cityId,
            name: item.name,
            description: item.description,
            location: item.location,
            category: item.category,
            imageUrl: item.imageUrl,
            latitude: item.latitude,
            longitude: item.longitude,
            timings: item.timings,
            ticketPrice: item.ticketPrice,
            bestTimeToVisit: item.bestTimeToVisit,
            travelTips: item.travelTips,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    console.log('Featured city data upserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Featured city upsert failed:', error);
    process.exit(1);
  }
};

upsertData();
