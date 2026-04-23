import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiCamera } from 'react-icons/fi';
import CityCard from '../components/UserCityCard';
import AttractionCard from '../components/UserAttractionCard';
import useCurrentLocation from '../hooks/useUserCurrentLocation';
import api from '../services/userApi';

const sortCitiesAlphabetically = (items) =>
  [...items].sort((left, right) => left.cityName.localeCompare(right.cityName));

const buildCityPlaceCounts = (attractions) =>
  attractions.reduce((counts, attraction) => {
    const cityId = attraction.cityId?._id || attraction.cityId;
    if (!cityId) {
      return counts;
    }

    const key = String(cityId);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

const HOME_CITY_LIMIT = 9;
const HOME_ATTRACTION_LIMIT = 9;

const Home = () => {
  const [cities, setCities] = useState([]);
  const [featuredAttractions, setFeaturedAttractions] = useState([]);
  const [cityPlaceCounts, setCityPlaceCounts] = useState({});
  const [search, setSearch] = useState('');
  const { currentLocation, trackingLocation } = useCurrentLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [citiesResponse, attractionsResponse] = await Promise.all([
          api.get('/cities', { params: { limit: 24, includeOwner: false } }),
          api.get('/attractions', { params: { limit: 24, includeOwner: false } }),
        ]);
        setCities(sortCitiesAlphabetically(citiesResponse.data));
        setFeaturedAttractions(attractionsResponse.data.slice(0, HOME_ATTRACTION_LIMIT));
        const counts = buildCityPlaceCounts(attractionsResponse.data);
        setCityPlaceCounts(counts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-12 px-2 sm:px-4 md:px-6 lg:px-8">
      <section className="relative min-h-[90vh] rounded-[40px] bg-gradient-to-b from-[#f7ece1] via-[#fcf7f1] to-white px-6 py-20 text-slate-900 shadow-2xl shadow-slate-200 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Discover the world</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-900 sm:text-6xl">
            Explore Cities & <span className="text-amber-600">Cultural Landmarks</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Your digital travel companion for discovering monuments, museums, parks, and hidden gems in cities around the world.
          </p>
          <form onSubmit={handleSearch} className="mt-6 flex w-full max-w-4xl flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cities or countries..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none shadow-sm transition focus:border-amber-400"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-8 py-4 font-semibold text-slate-900 transition hover:bg-amber-400 sm:min-w-[160px]"
            >
              Explore
            </button>
          </form>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Featured Cities</h2>
            <p className="mt-2 text-slate-600">Popular destinations waiting to be explored.</p>
          </div>
          <Link to="/explore" className="rounded-full border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100">
            View All Cities
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {cities.length ? (
            cities.slice(0, HOME_CITY_LIMIT).map((city) => (
              <CityCard
                key={city._id}
                city={city}
                currentLocation={currentLocation}
                placeCount={cityPlaceCounts[String(city._id || city.id)] || 0}
              />
            ))
          ) : (
            <p className="text-slate-500">Loading featured cities...</p>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Featured Attractions</h2>
            <p className="mt-2 text-slate-600">Start with a few standout monuments, museums, and landmarks.</p>
          </div>
          <Link to="/explore?view=attractions" className="rounded-full border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100">
            Explore More
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredAttractions.length ? (
            featuredAttractions.map((attraction) => (
              <AttractionCard key={attraction._id} attraction={attraction} currentLocation={currentLocation} />
            ))
          ) : (
            <p className="text-slate-500">Loading featured attractions...</p>
          )}
        </div>
      </section>

      <section className="rounded-[40px] bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Live location</h2>
            <p className="mt-2 text-slate-600">
              {trackingLocation
                ? 'Distances and directions are active for the cards above.'
                : 'Allow location access to see live distance from your current place.'}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {currentLocation
              ? `Current position: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
              : 'Waiting for location permission...'}
          </p>
        </div>
      </section>

      <section className="rounded-[40px] bg-white p-6 shadow-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 border-r border-slate-200/80 pr-6 lg:border-r-0 lg:pr-0">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <FiMapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Location-Based Discovery</h3>
            <p className="text-slate-600">Find nearby tourist spots and hidden gems wherever you are in the world.</p>
          </div>
          <div className="space-y-4 border-r border-slate-200/80 pr-6 lg:border-r-0 lg:pr-0">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <FiUsers className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Community Driven</h3>
            <p className="text-slate-600">Real reviews and recommendations from travelers who have been there.</p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <FiCamera className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Rich Photo Galleries</h3>
            <p className="text-slate-600">Browse beautiful city visuals and plan your perfect visit with confidence.</p>
          </div>
        </div>
      </section>

      <footer className="rounded-[40px] bg-[#fff7ee] px-8 py-10 text-center text-slate-600 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-500">CityExplorer</p>
        <p className="mx-auto mt-4 max-w-2xl text-base">Discover the world's cultural heritage, one city at a time.</p>
      </footer>
    </div>
  );
};

export default Home;
