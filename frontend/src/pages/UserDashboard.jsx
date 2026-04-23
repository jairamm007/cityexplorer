import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/userApi';
import { useAuth } from '../components/UserAuthContext';
import AttractionCard from '../components/UserAttractionCard';
import CityCard from '../components/UserCityCard';
import useCurrentLocation from '../hooks/useUserCurrentLocation';

const getUserId = (user) => user?._id || user?.id || null;

const actionCards = [
  {
    title: 'Add a New City',
    description: 'Create a city page with travel details, image, and map coordinates.',
    buttonLabel: 'Add city',
    path: '/dashboard/add-city',
  },
  {
    title: 'Add a New Attraction',
    description: 'Create a sightseeing spot, landmark, or activity and save it to a city.',
    buttonLabel: 'Add attraction',
    path: '/dashboard/add-place?type=attraction',
  },
  {
    title: 'Add a Restaurant',
    description: 'Save a restaurant listing with timings, price notes, and helpful tips.',
    buttonLabel: 'Add restaurant',
    path: '/dashboard/add-place?type=restaurant',
  },
];

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityDisplayLimit, setCityDisplayLimit] = useState('6');
  const [placeDisplayLimit, setPlaceDisplayLimit] = useState('6');
  const [loading, setLoading] = useState(true);
  const { currentLocation, trackingLocation } = useCurrentLocation();

  const currentUserId = getUserId(user);
  const myCities = cities.filter((city) => (city.createdBy?._id || city.createdBy) === currentUserId);
  const myPlaces = attractions.filter((attraction) => (attraction.createdBy?._id || attraction.createdBy) === currentUserId);
  const cityPlaceCounts = buildCityPlaceCounts(attractions);
  const visibleCities = cityDisplayLimit === 'all' ? cities : cities.slice(0, Number(cityDisplayLimit));
  const visiblePlaces = placeDisplayLimit === 'all' ? attractions : attractions.slice(0, Number(placeDisplayLimit));

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [citiesResponse, attractionsResponse] = await Promise.all([
          api.get('/cities', { params: { includeOwner: false } }),
          api.get('/attractions', { params: { includeOwner: false } }),
        ]);
        setCities(sortCitiesAlphabetically(citiesResponse.data));
        setAttractions(attractionsResponse.data);
      } catch (error) {
        setCities([]);
        setAttractions([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          You now land on the dashboard after sign-in. Choose what you want to add, and we will take you to the correct save form.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Signed in as {user?.name} • {user?.email}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {actionCards.map((card) => (
          <article key={card.title} className="rounded-[36px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{card.description}</p>
            <button
              type="button"
              onClick={() => navigate(card.path)}
              className="mt-6 ui-action-pill"
            >
              {card.buttonLabel}
            </button>
          </article>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Added by you</h2>
            <p className="text-slate-600">Edit or delete anything you personally added from these shortcuts.</p>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading your contributions...</p>
        ) : myCities.length || myPlaces.length ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Your cities</h3>
              <div className="mt-4 grid gap-6">
                {myCities.length ? (
                  myCities.slice(0, 3).map((city) => (
                    <CityCard
                      key={city._id}
                      city={city}
                      currentLocation={currentLocation}
                      placeCount={cityPlaceCounts[String(city._id || city.id)] || 0}
                    />
                  ))
                ) : (
                  <p className="text-slate-500">You have not added any cities yet.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Your places</h3>
              <div className="mt-4 grid gap-6">
                {myPlaces.length ? (
                  myPlaces.slice(0, 3).map((attraction) => (
                    <AttractionCard key={attraction._id} attraction={attraction} currentLocation={currentLocation} />
                  ))
                ) : (
                  <p className="text-slate-500">You have not added any attractions or restaurants yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-slate-500">Your added cities, attractions, and restaurants will appear here once you create them.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Saved cities</h2>
            <p className="text-slate-600">Your latest city entries are still available here.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={cityDisplayLimit}
              onChange={(event) => setCityDisplayLimit(event.target.value)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-amber-400"
            >
              <option value="6">Show 6</option>
              <option value="12">Show 12</option>
              <option value="all">Show all</option>
            </select>
            <Link
              to="/explore"
              className="ui-action-ghost"
            >
              View All
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading saved cities...</p>
        ) : cities.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCities.map((city) => (
              <CityCard
                key={city._id}
                city={city}
                currentLocation={currentLocation}
                placeCount={cityPlaceCounts[String(city._id || city.id)] || 0}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-slate-500">No cities found yet. Add one from the dashboard above.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Latest saved places</h2>
            <p className="text-slate-600">A quick look at the newest attractions and restaurant listings.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={placeDisplayLimit}
              onChange={(event) => setPlaceDisplayLimit(event.target.value)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-amber-400"
            >
              <option value="6">Show 6</option>
              <option value="12">Show 12</option>
              <option value="all">Show all</option>
            </select>
            <Link
              to="/explore?view=attractions"
              className="ui-action-ghost"
            >
              View All
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading saved places...</p>
        ) : attractions.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlaces.map((attraction) => (
              <AttractionCard key={attraction._id} attraction={attraction} currentLocation={currentLocation} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-slate-500">No places saved yet. Use the buttons above to add the first one.</p>
        )}
      </section>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Live location</h2>
            <p className="mt-2 text-slate-600">
              {trackingLocation
                ? 'Distances and directions are active for your cities and places.'
                : 'Allow location access to see live travel distance on your cards.'}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {currentLocation
              ? `Current position: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
              : 'Location permission not confirmed yet'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
