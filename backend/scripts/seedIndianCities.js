const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const City = require('../models/City');
const Attraction = require('../models/Attraction');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const landmarkImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
const shoppingImage = 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80';
const inorbitMallImage = '/uploads/images/attraction-inorbit-mall-hyderabad.png';
const charminarImage = '/uploads/images/attraction-charminar.png';
const mtrBengaluruImage = '/uploads/images/attraction-mtr-bengaluru.png';
const orionMallImage = '/uploads/images/attraction-orion-mall.png';
const pvpSquareMallImage = '/uploads/images/attraction-pvp-square-mall.png';
const foodImage = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80';
const cityImages = {
  Vijayawada: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  Itanagar: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  Guwahati: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  Patna: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  Raipur: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
  Goa: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  Ahmedabad: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
  Gurugram: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  Shimla: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  Ranchi: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  Bengaluru: 'https://images.unsplash.com/photo-1494503317504-17cfb12fc224?auto=format&fit=crop&w=1200&q=80',
  Kochi: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  Indore: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  Mumbai: 'https://images.unsplash.com/photo-1526481280695-3c4691c04682?auto=format&fit=crop&w=1200&q=80',
  Imphal: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  Shillong: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
  Aizawl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
  Kohima: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  Bhubaneswar: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  Amritsar: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
  Jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  Gangtok: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
  Chennai: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
  Hyderabad: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
  Agartala: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  Lucknow: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  Dehradun: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  Kolkata: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
  Delhi: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
};

const cityData = [
  {
    city: {
      cityName: 'Vijayawada',
      country: 'India',
      state: 'Andhra Pradesh',
      location: 'Banks of the Krishna River',
      description: 'A lively Andhra city known for temple hills, riverfront views, shopping hubs, and strong local food culture.',
      imageUrl: cityImages.Vijayawada,
      latitude: 16.5062,
      longitude: 80.648,
    },
    places: [
      ['Kanaka Durga Temple', 'Temple', 'Indrakeeladri Hill, Vijayawada', 'A revered hilltop temple and one of the city’s biggest spiritual landmarks.', landmarkImage],
      ['PVP Square Mall', 'Mall', 'MG Road, Labbipet, Vijayawada', 'A central shopping and entertainment mall with cinemas, stores, and food outlets.', pvpSquareMallImage],
      ['Babai Hotel', 'Restaurant', 'Governor Peta, Vijayawada', 'A classic Vijayawada restaurant loved for Andhra breakfasts and comfort meals.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Itanagar',
      country: 'India',
      state: 'Arunachal Pradesh',
      location: 'Eastern Himalayan foothills',
      description: 'A scenic capital city with hill views, monasteries, local heritage, and a relaxed gateway feel to Arunachal Pradesh.',
      imageUrl: cityImages.Itanagar,
      latitude: 27.0844,
      longitude: 93.6053,
    },
    places: [
      ['Ita Fort', 'Historical site', 'Itanagar, Arunachal Pradesh', 'The historic brick fort that gave the capital its name.', landmarkImage],
      ['Ganga Market', 'Market', 'Itanagar, Arunachal Pradesh', 'A busy local shopping area for everyday city life and regional goods.', shoppingImage],
      ['Zomsa Restaurant', 'Restaurant', 'Itanagar, Arunachal Pradesh', 'A well-known local dining stop for regional food and casual meals.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Guwahati',
      country: 'India',
      state: 'Assam',
      location: 'Brahmaputra riverfront',
      description: 'Assam’s largest city, known for temples, river views, shopping districts, and Northeast food culture.',
      imageUrl: cityImages.Guwahati,
      latitude: 26.1445,
      longitude: 91.7362,
    },
    places: [
      ['Kamakhya Temple', 'Temple', 'Nilachal Hill, Guwahati', 'A major Shakti Peetha and one of Northeast India’s most visited temples.', landmarkImage],
      ['City Centre Mall', 'Mall', 'Christian Basti, Guwahati', 'A popular mall for shopping, movies, and evening hangouts.', shoppingImage],
      ['Khorikaa', 'Restaurant', 'GS Road, Guwahati', 'A favorite spot for Assamese and Northeast regional cuisine.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Patna',
      country: 'India',
      state: 'Bihar',
      location: 'Ganges river plain',
      description: 'A historic river city with museums, monuments, old markets, and a strong North Indian food scene.',
      imageUrl: cityImages.Patna,
      latitude: 25.5941,
      longitude: 85.1376,
    },
    places: [
      ['Golghar', 'Landmark', 'Patna, Bihar', 'A signature colonial-era granary and a recognizable Patna landmark.', landmarkImage],
      ['P&M Mall', 'Mall', 'Patliputra Colony, Patna', 'One of Patna’s best-known malls for fashion, multiplexes, and dining.', shoppingImage],
      ['Bansi Vihar', 'Restaurant', 'Fraser Road, Patna', 'A popular family dining restaurant known for vegetarian North Indian meals.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Raipur',
      country: 'India',
      state: 'Chhattisgarh',
      location: 'Central India',
      description: 'A fast-growing city with urban lakes, temples, shopping centers, and regional Chhattisgarhi food nearby.',
      imageUrl: cityImages.Raipur,
      latitude: 21.2514,
      longitude: 81.6296,
    },
    places: [
      ['Nandan Van Zoo & Safari', 'Nature park', 'Raipur, Chhattisgarh', 'A popular wildlife and family outing spot near the city.', landmarkImage],
      ['Magneto The Mall', 'Mall', 'Labhandi, Raipur', 'A major Raipur mall for shopping, movies, and dining.', shoppingImage],
      ['Girnar Restaurant', 'Restaurant', 'Raipur, Chhattisgarh', 'A long-running favorite for family dining and North Indian food.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Goa',
      country: 'India',
      state: 'Goa',
      location: 'Konkan coast',
      description: 'A beach-focused destination known for sea views, markets, nightlife, shopping streets, and seafood dining.',
      imageUrl: cityImages.Goa,
      latitude: 15.2993,
      longitude: 74.124,
    },
    places: [
      ['Baga Beach', 'Beach', 'North Goa', 'One of Goa’s most popular beach stretches for nightlife and waterside activity.', landmarkImage],
      ['Mall de Goa', 'Mall', 'Porvorim, Goa', 'A modern shopping mall with stores, food options, and multiplex screens.', shoppingImage],
      ['Fisherman’s Wharf', 'Restaurant', 'Goa', 'A popular restaurant for Goan seafood and riverside-style dining.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Ahmedabad',
      country: 'India',
      state: 'Gujarat',
      location: 'Sabarmati riverfront',
      description: 'A heritage-meets-modern city known for stepwells, riverfront spaces, shopping roads, and Gujarati food.',
      imageUrl: cityImages.Ahmedabad,
      latitude: 23.0225,
      longitude: 72.5714,
    },
    places: [
      ['Sabarmati Riverfront', 'Landmark', 'Ahmedabad, Gujarat', 'A popular urban riverfront for walking, views, and public events.', landmarkImage],
      ['AlphaOne Mall', 'Mall', 'Vastrapur, Ahmedabad', 'A well-known destination for shopping, cinema, and food courts.', shoppingImage],
      ['Agashiye', 'Restaurant', 'Old Ahmedabad, Gujarat', 'A famous restaurant for traditional Gujarati thali dining.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Gurugram',
      country: 'India',
      state: 'Haryana',
      location: 'Delhi NCR',
      description: 'A modern business city filled with malls, towers, entertainment zones, and upscale dining.',
      imageUrl: cityImages.Gurugram,
      latitude: 28.4595,
      longitude: 77.0266,
    },
    places: [
      ['Cyber Hub', 'Entertainment district', 'DLF Cyber City, Gurugram', 'A major social and food destination packed with cafés and nightlife.', landmarkImage],
      ['Ambience Mall', 'Mall', 'NH-8, Gurugram', 'One of the biggest malls in NCR with a huge retail and entertainment mix.', shoppingImage],
      ['SodaBottleOpenerWala', 'Restaurant', 'Gurugram, Haryana', 'A popular restaurant known for playful interiors and Bombay-style comfort food.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Shimla',
      country: 'India',
      state: 'Himachal Pradesh',
      location: 'Himalayan hill station',
      description: 'A classic hill city known for cool weather, colonial streets, ridge walks, and mountain shopping lanes.',
      imageUrl: cityImages.Shimla,
      latitude: 31.1048,
      longitude: 77.1734,
    },
    places: [
      ['The Ridge', 'Landmark', 'Shimla, Himachal Pradesh', 'The city’s iconic open promenade with mountain and church views.', landmarkImage],
      ['Mall Road', 'Market', 'Shimla, Himachal Pradesh', 'The best-known shopping stretch for tourists in central Shimla.', shoppingImage],
      ['Cafe Simla Times', 'Restaurant', 'Shimla, Himachal Pradesh', 'A popular café-style restaurant for views, snacks, and modern meals.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Ranchi',
      country: 'India',
      state: 'Jharkhand',
      location: 'Chotanagpur plateau',
      description: 'A green plateau city known for waterfalls nearby, lakes, local markets, and growing urban hangouts.',
      imageUrl: cityImages.Ranchi,
      latitude: 23.3441,
      longitude: 85.3096,
    },
    places: [
      ['Rock Garden', 'Park', 'Ranchi, Jharkhand', 'A local sightseeing spot with viewpoints and landscaped spaces.', landmarkImage],
      ['Nucleus Mall', 'Mall', 'Ranchi, Jharkhand', 'One of Ranchi’s most popular malls for shopping and movies.', shoppingImage],
      ['Kaveri Restaurant', 'Restaurant', 'Ranchi, Jharkhand', 'A dependable local favorite for vegetarian and family dining.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Bengaluru',
      country: 'India',
      state: 'Karnataka',
      location: 'Southern tech hub',
      description: 'India’s startup capital with gardens, palaces, premium malls, cafés, and an all-day food culture.',
      imageUrl: cityImages.Bengaluru,
      latitude: 12.9716,
      longitude: 77.5946,
    },
    places: [
      ['Lalbagh Botanical Garden', 'Garden', 'Bengaluru, Karnataka', 'A landmark green space and one of Bengaluru’s best-known attractions.', landmarkImage],
      ['Orion Mall', 'Mall', 'Rajajinagar, Bengaluru', 'A major mall with retail, food, and waterfront surroundings.', orionMallImage],
      ['MTR', 'Restaurant', 'Lalbagh Road, Bengaluru', 'An iconic Bengaluru restaurant for South Indian breakfasts and meals.', mtrBengaluruImage],
    ],
  },
  {
    city: {
      cityName: 'Kochi',
      country: 'India',
      state: 'Kerala',
      location: 'Arabian Sea coast',
      description: 'A waterfront city known for Chinese fishing nets, heritage streets, shopping zones, and seafood dining.',
      imageUrl: cityImages.Kochi,
      latitude: 9.9312,
      longitude: 76.2673,
    },
    places: [
      ['Fort Kochi Beach', 'Landmark', 'Kochi, Kerala', 'A popular heritage waterfront area with the city’s iconic fishing-net views.', landmarkImage],
      ['Lulu Mall', 'Mall', 'Edappally, Kochi', 'One of India’s best-known super malls with huge retail and entertainment options.', shoppingImage],
      ['Kashi Art Cafe', 'Restaurant', 'Fort Kochi, Kerala', 'A famous café-restaurant for relaxed dining in a heritage neighborhood.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Indore',
      country: 'India',
      state: 'Madhya Pradesh',
      location: 'Malwa region',
      description: 'A clean, fast-moving city famous for street food, temples, markets, malls, and central Indian access.',
      imageUrl: cityImages.Indore,
      latitude: 22.7196,
      longitude: 75.8577,
    },
    places: [
      ['Rajwada Palace', 'Landmark', 'Indore, Madhya Pradesh', 'A historic palace complex and one of Indore’s most recognizable sites.', landmarkImage],
      ['C21 Mall', 'Mall', 'Indore, Madhya Pradesh', 'A popular shopping and cinema destination in the city.', shoppingImage],
      ['Sarafa Night Market', 'Food street', 'Indore, Madhya Pradesh', 'A legendary late-night food destination for Indore specialties.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Mumbai',
      country: 'India',
      state: 'Maharashtra',
      location: 'Arabian Sea waterfront',
      description: 'India’s financial capital with sea-facing landmarks, giant malls, nightlife, cinema culture, and iconic dining.',
      imageUrl: cityImages.Mumbai,
      latitude: 19.076,
      longitude: 72.8777,
    },
    places: [
      ['Gateway of India', 'Landmark', 'Colaba, Mumbai', 'Mumbai’s signature waterfront monument and a classic first-stop attraction.', landmarkImage],
      ['Phoenix Palladium', 'Mall', 'Lower Parel, Mumbai', 'A premium shopping destination with luxury stores and dining.', shoppingImage],
      ['Leopold Cafe', 'Restaurant', 'Colaba, Mumbai', 'A famous Mumbai restaurant-café with heritage character and global popularity.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Imphal',
      country: 'India',
      state: 'Manipur',
      location: 'Imphal Valley',
      description: 'A valley city known for local culture, war memorial sites, lively women-run markets, and regional cuisine.',
      imageUrl: cityImages.Imphal,
      latitude: 24.817,
      longitude: 93.9368,
    },
    places: [
      ['Kangla Fort', 'Historical site', 'Imphal, Manipur', 'A major cultural and historical landmark in central Imphal.', landmarkImage],
      ['Ima Keithel', 'Market', 'Imphal, Manipur', 'The famous women-run market and one of Manipur’s most unique shopping spaces.', shoppingImage],
      ['Luxmi Kitchen', 'Restaurant', 'Imphal, Manipur', 'A known local dining option for Manipuri and Indian dishes.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Shillong',
      country: 'India',
      state: 'Meghalaya',
      location: 'Khasi hills',
      description: 'A cool hill city known for viewpoints, music culture, busy markets, and café-style dining.',
      imageUrl: cityImages.Shillong,
      latitude: 25.5788,
      longitude: 91.8933,
    },
    places: [
      ['Ward’s Lake', 'Park', 'Shillong, Meghalaya', 'A central city attraction for walks, boating, and relaxed views.', landmarkImage],
      ['Police Bazaar', 'Market', 'Shillong, Meghalaya', 'Shillong’s main shopping and tourist hub for clothes, gifts, and snacks.', shoppingImage],
      ['Cafe Shillong', 'Restaurant', 'Shillong, Meghalaya', 'A popular city restaurant-café known for ambience and mixed cuisine.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Aizawl',
      country: 'India',
      state: 'Mizoram',
      location: 'Hill ridges of Mizoram',
      description: 'A scenic ridge-top city with panoramic streets, local markets, churches, and peaceful urban views.',
      imageUrl: cityImages.Aizawl,
      latitude: 23.7271,
      longitude: 92.7176,
    },
    places: [
      ['Durtlang Hills Viewpoint', 'Viewpoint', 'Aizawl, Mizoram', 'A popular city viewpoint with broad hill and skyline panoramas.', landmarkImage],
      ['Bara Bazar', 'Market', 'Aizawl, Mizoram', 'A lively local shopping district with everyday city commerce.', shoppingImage],
      ['David’s Kitchen', 'Restaurant', 'Aizawl, Mizoram', 'A known dining spot for casual meals and local city outings.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Kohima',
      country: 'India',
      state: 'Nagaland',
      location: 'Naga hills',
      description: 'A hill capital with war history, local craft culture, scenic roads, and vibrant seasonal markets.',
      imageUrl: cityImages.Kohima,
      latitude: 25.6751,
      longitude: 94.1086,
    },
    places: [
      ['Kohima War Cemetery', 'Historical site', 'Kohima, Nagaland', 'One of the city’s most significant historical landmarks.', landmarkImage],
      ['Naga Bazaar', 'Market', 'Kohima, Nagaland', 'A central local shopping area reflecting everyday life and regional produce.', shoppingImage],
      ['The Hut Restaurant', 'Restaurant', 'Kohima, Nagaland', 'A well-liked local dining stop for casual meals in Kohima.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Bhubaneswar',
      country: 'India',
      state: 'Odisha',
      location: 'Temple city of Odisha',
      description: 'A planned heritage city known for temples, museums, shopping centers, and easy access to coastal Odisha.',
      imageUrl: cityImages.Bhubaneswar,
      latitude: 20.2961,
      longitude: 85.8245,
    },
    places: [
      ['Lingaraj Temple', 'Temple', 'Bhubaneswar, Odisha', 'The city’s most famous temple and a major spiritual landmark.', landmarkImage],
      ['Esplanade One', 'Mall', 'Rasulgarh, Bhubaneswar', 'A major mall for shopping, entertainment, and food outlets.', shoppingImage],
      ['Dalma', 'Restaurant', 'Bhubaneswar, Odisha', 'A popular place to try traditional Odia cuisine in a city setting.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Amritsar',
      country: 'India',
      state: 'Punjab',
      location: 'Majha region',
      description: 'A deeply cultural city known for the Golden Temple, shopping streets, and legendary Punjabi food.',
      imageUrl: cityImages.Amritsar,
      latitude: 31.634,
      longitude: 74.8723,
    },
    places: [
      ['Golden Temple', 'Temple', 'Amritsar, Punjab', 'One of India’s most beloved spiritual and architectural landmarks.', landmarkImage],
      ['Alpha One Mall', 'Mall', 'Amritsar, Punjab', 'A popular mall for shopping, movies, and air-conditioned downtime.', shoppingImage],
      ['Kesar Da Dhaba', 'Restaurant', 'Amritsar, Punjab', 'A legendary restaurant known for rich Punjabi comfort food.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Jaipur',
      country: 'India',
      state: 'Rajasthan',
      location: 'Pink City',
      description: 'A royal city of forts, bazaars, shopping avenues, and classic Rajasthani dining experiences.',
      imageUrl: cityImages.Jaipur,
      latitude: 26.9124,
      longitude: 75.7873,
    },
    places: [
      ['Hawa Mahal', 'Palace', 'Jaipur, Rajasthan', 'Jaipur’s most famous façade and a signature city landmark.', landmarkImage],
      ['World Trade Park', 'Mall', 'Malviya Nagar, Jaipur', 'A well-known Jaipur mall for shopping, dining, and movies.', shoppingImage],
      ['Laxmi Misthan Bhandar', 'Restaurant', 'Johari Bazaar, Jaipur', 'A popular stop for Rajasthani dishes, snacks, and sweets.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Gangtok',
      country: 'India',
      state: 'Sikkim',
      location: 'Eastern Himalayas',
      description: 'A hill capital known for mountain views, monasteries, shopping roads, and cozy cafés.',
      imageUrl: cityImages.Gangtok,
      latitude: 27.3389,
      longitude: 88.6065,
    },
    places: [
      ['MG Marg', 'Landmark', 'Gangtok, Sikkim', 'The city’s most popular pedestrian street and central urban attraction.', landmarkImage],
      ['Lal Bazaar', 'Market', 'Gangtok, Sikkim', 'A busy local shopping spot for produce, crafts, and everyday items.', shoppingImage],
      ['Taste of Tibet', 'Restaurant', 'Gangtok, Sikkim', 'A favorite restaurant for momos, noodles, and Tibetan-style comfort food.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Chennai',
      country: 'India',
      state: 'Tamil Nadu',
      location: 'Coromandel Coast',
      description: 'A major coastal metro known for beaches, temples, giant malls, and some of South India’s most loved food.',
      imageUrl: cityImages.Chennai,
      latitude: 13.0827,
      longitude: 80.2707,
    },
    places: [
      ['Marina Beach', 'Beach', 'Chennai, Tamil Nadu', 'The city’s defining waterfront attraction and a famous evening hangout.', landmarkImage],
      ['Express Avenue', 'Mall', 'Royapettah, Chennai', 'A major mall destination for retail, multiplexes, and dining.', shoppingImage],
      ['Murugan Idli Shop', 'Restaurant', 'Chennai, Tamil Nadu', 'A popular Chennai dining spot for idli, dosa, and breakfast staples.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Hyderabad',
      country: 'India',
      state: 'Telangana',
      location: 'Deccan Plateau',
      description: 'A major historic-tech city famous for monuments, biryani, museums, malls, and old-city markets.',
      imageUrl: cityImages.Hyderabad,
      latitude: 17.385,
      longitude: 78.4867,
    },
    places: [
      ['Charminar', 'Landmark', 'Hyderabad, Telangana', 'The city’s most iconic monument and a centerpiece of old Hyderabad.', charminarImage],
      ['Inorbit Mall', 'Mall', 'Hitec City, Hyderabad', 'A popular mall for modern shopping, movies, and dining.', inorbitMallImage],
      ['Paradise Biryani', 'Restaurant', 'Secunderabad, Hyderabad', 'One of the best-known restaurant names associated with Hyderabad biryani.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Agartala',
      country: 'India',
      state: 'Tripura',
      location: 'Western Tripura plain',
      description: 'A calm capital city with royal heritage, local markets, shopping pockets, and Bengali-influenced food culture.',
      imageUrl: cityImages.Agartala,
      latitude: 23.8315,
      longitude: 91.2868,
    },
    places: [
      ['Ujjayanta Palace', 'Palace', 'Agartala, Tripura', 'The city’s best-known royal landmark and museum complex.', landmarkImage],
      ['Bazar Kolkata Area', 'Market', 'Agartala, Tripura', 'A busy local shopping stretch for garments and everyday city trade.', shoppingImage],
      ['Royal Veg', 'Restaurant', 'Agartala, Tripura', 'A known casual family dining option in the city.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Lucknow',
      country: 'India',
      state: 'Uttar Pradesh',
      location: 'Awadh region',
      description: 'A heritage city known for nawabi architecture, shopping roads, kebab culture, and graceful old-world charm.',
      imageUrl: cityImages.Lucknow,
      latitude: 26.8467,
      longitude: 80.9462,
    },
    places: [
      ['Bara Imambara', 'Historical site', 'Lucknow, Uttar Pradesh', 'Lucknow’s signature heritage attraction and one of its top landmarks.', landmarkImage],
      ['Lulu Mall', 'Mall', 'Lucknow, Uttar Pradesh', 'A major modern shopping and entertainment destination in the city.', shoppingImage],
      ['Tunday Kababi', 'Restaurant', 'Lucknow, Uttar Pradesh', 'A legendary restaurant tied closely to Lucknow’s kebab identity.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Dehradun',
      country: 'India',
      state: 'Uttarakhand',
      location: 'Doon Valley',
      description: 'A valley city and gateway to the hills with institutions, shopping roads, cafés, and nearby nature spots.',
      imageUrl: cityImages.Dehradun,
      latitude: 30.3165,
      longitude: 78.0322,
    },
    places: [
      ['Robber’s Cave', 'Nature spot', 'Dehradun, Uttarakhand', 'One of Dehradun’s most popular short-outing natural attractions.', landmarkImage],
      ['Pacific Mall', 'Mall', 'Dehradun, Uttarakhand', 'A prominent mall in the city for shopping and movie outings.', shoppingImage],
      ['Kalsang Friends Corner', 'Restaurant', 'Dehradun, Uttarakhand', 'A favorite restaurant for Tibetan, Chinese, and casual meals.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Kolkata',
      country: 'India',
      state: 'West Bengal',
      location: 'Hooghly river corridor',
      description: 'A cultural metro known for colonial landmarks, bookstores, shopping streets, and legendary Bengali-Calcutta dining.',
      imageUrl: cityImages.Kolkata,
      latitude: 22.5726,
      longitude: 88.3639,
    },
    places: [
      ['Victoria Memorial', 'Monument', 'Kolkata, West Bengal', 'A defining Kolkata landmark and one of the city’s most visited attractions.', landmarkImage],
      ['South City Mall', 'Mall', 'Kolkata, West Bengal', 'One of Kolkata’s biggest and busiest malls for retail and entertainment.', shoppingImage],
      ['Peter Cat', 'Restaurant', 'Park Street, Kolkata', 'A classic Kolkata restaurant famous for its chelo kebab and old-city dining vibe.', foodImage],
    ],
  },
  {
    city: {
      cityName: 'Delhi',
      country: 'India',
      state: 'Delhi',
      location: 'National Capital Territory',
      description: 'The capital city of India, filled with forts, boulevards, giant malls, old markets, and iconic North Indian food.',
      imageUrl: cityImages.Delhi,
      latitude: 28.6139,
      longitude: 77.209,
    },
    places: [
      ['India Gate', 'Landmark', 'New Delhi, Delhi', 'One of the capital’s most recognizable public landmarks and evening gathering spots.', landmarkImage],
      ['Select Citywalk', 'Mall', 'Saket, New Delhi', 'A top Delhi mall for shopping, movies, and premium dining.', shoppingImage],
      ['Karim’s', 'Restaurant', 'Jama Masjid, Old Delhi', 'A legendary Delhi restaurant known for Mughlai food and old-city flavor.', foodImage],
    ],
  },
];

const toAttractionDoc = (cityMap, cityName, place) => ({
  cityId: cityMap[cityName],
  name: place[0],
  category: place[1],
  location: place[2],
  description: place[3],
  imageUrl: place[4],
  timings: place[1] === 'Restaurant' ? '11:00 AM - 11:00 PM' : '10:00 AM - 9:00 PM',
  ticketPrice: place[1] === 'Mall' || place[1] === 'Market' ? 'Free entry' : place[1] === 'Restaurant' ? 'Approx. INR 800 for two' : 'Check local entry details',
  bestTimeToVisit: place[1] === 'Restaurant' ? 'Lunch or evening' : place[1] === 'Mall' || place[1] === 'Market' ? 'Afternoon or evening' : 'Morning or evening',
  travelTips: place[1] === 'Restaurant' ? 'Try to visit outside peak meal hours for easier seating.' : place[1] === 'Mall' || place[1] === 'Market' ? 'Weekday visits are usually more comfortable than weekends.' : 'Start early if you want a quieter visit and easier local travel.',
});

const seedIndianCities = async () => {
  try {
    await connectDB();

    await Attraction.deleteMany({});
    await City.deleteMany({});

    const createdCities = await City.insertMany(cityData.map((item) => item.city));
    const cityMap = createdCities.reduce((acc, city) => {
      acc[city.cityName] = city._id;
      return acc;
    }, {});

    const attractionDocs = cityData.flatMap((item) =>
      item.places.map((place) => toAttractionDoc(cityMap, item.city.cityName, place))
    );

    await Attraction.insertMany(attractionDocs);

    console.log(`Indian city seed completed: ${createdCities.length} cities, ${attractionDocs.length} places.`);
    process.exit(0);
  } catch (error) {
    console.error('Indian city seed failed:', error);
    process.exit(1);
  }
};

seedIndianCities();
