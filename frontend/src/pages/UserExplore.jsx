import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const Explore = () => {
  const [cities, setCities] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [view, setView] = useState(searchParams.get('view') || 'cities');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [rating, setRating] = useState(searchParams.get('rating') || 'all');
  const { currentLocation, trackingLocation } = useCurrentLocation();

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setView(searchParams.get('view') || 'cities');
    setCategory(searchParams.get('category') || 'all');
    setRating(searchParams.get('rating') || 'all');
  }, [searchParams]);

  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('q') || '';
        const [citiesResponse, attractionsResponse] = await Promise.all([
          api.get('/cities', { params: { q: query, includeOwner: false } }),
          api.get('/attractions', {
            params: {
              q: query,
              includeOwner: false,
              category: searchParams.get('category') && searchParams.get('category') !== 'all'
                ? searchParams.get('category')
                : '',
            },
          }),
        ]);
        setCities(sortCitiesAlphabetically(citiesResponse.data));
        setAttractions(attractionsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, [searchParams]);

  const filteredAttractions = useMemo(() => {
    let next = [...attractions];
    if (category !== 'all') {
      next = next.filter((item) => item.category?.toLowerCase().includes(category.toLowerCase()));
    }
    if (rating !== 'all') {
      const minRating = Number(rating);
      next = next.filter((item) => (item.averageRating || 0) >= minRating);
    }
    return next;
  }, [attractions, category, rating]);

  const cityPlaceCounts = useMemo(() => {
    return buildCityPlaceCounts(attractions);
  }, [cities, attractions]);

  const updateParams = (next) => {
    const params = {};
    if (next.q?.trim()) params.q = next.q.trim();
    if (next.view && next.view !== 'cities') params.view = next.view;
    if (next.category && next.category !== 'all') params.category = next.category;
    if (next.rating && next.rating !== 'all') params.rating = next.rating;
    setSearchParams(params);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateParams({ q: search, view, category, rating });
  };

  const hasResults = view === 'cities' ? cities.length > 0 : filteredAttractions.length > 0;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Explore Cities and Attractions</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Browse destinations, monuments, museums, parks, and cultural landmarks from one place.
          Switch between city discovery and attraction discovery depending on how you want to plan.
        </p>

        <form onSubmit={handleSearch} className="mt-6 grid gap-4 xl:grid-cols-[2fr,1fr,1fr,auto]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cities, attractions, countries, or landmark names..."
            className="w-full rounded-full border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none focus:border-amber-400"
          />
          <select
            value={view}
            onChange={(event) => {
              const nextView = event.target.value;
              setView(nextView);
              updateParams({ q: search, view: nextView, category, rating });
            }}
            className="rounded-full border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none focus:border-amber-400"
          >
            <option value="cities">Explore Cities</option>
            <option value="attractions">Explore Attractions</option>
          </select>
          <select
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setCategory(nextCategory);
              updateParams({ q: search, view, category: nextCategory, rating });
            }}
            className="rounded-full border border-slate-300 bg-white px-5 py-4 text-slate-900 outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            <option value="monument">Monuments</option>
            <option value="museum">Museums</option>
            <option value="park">Parks</option>
            <option value="landmark">Landmarks</option>
            <option value="restaurant">Restaurants</option>
          </select>
          <button type="submit" className="rounded-full bg-slate-900 px-8 py-4 text-white transition hover:bg-slate-700">
            Search
          </button>
        </form>

        {view === 'attractions' ? (
          <div className="mt-4 flex flex-wrap gap-4">
            <select
              value={rating}
              onChange={(event) => {
                const nextRating = event.target.value;
                setRating(nextRating);
                updateParams({ q: search, view, category, rating: nextRating });
              }}
              className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400"
            >
              <option value="all">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
            <p className="flex items-center text-sm text-slate-500">
              Attraction discovery includes category and rating filters to match the report flow.
            </p>
          </div>
        ) : null}

        <div className="mt-4 rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
          {trackingLocation
            ? 'Live location is enabled, so distances and directions are shown on city and place cards.'
            : 'Allow location access to see live distance from your current place to each city or place.'}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading exploration data...</p>
      ) : hasResults ? (
        view === 'cities' ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cities.map((city) => (
              <CityCard
                key={city._id}
                city={city}
                currentLocation={currentLocation}
                placeCount={cityPlaceCounts[String(city._id || city.id)] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAttractions.map((attraction) => (
              <AttractionCard key={attraction._id} attraction={attraction} currentLocation={currentLocation} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold">No matches found</h2>
          <p className="mt-3 text-slate-600">
            Try a different search term, switch between cities and attractions, or clear the filters.
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 text-slate-900 hover:bg-amber-300">
            Return Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Explore;
