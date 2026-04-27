import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../components/UserAuthContext';
import api from '../services/userApi';
import { resolveImageUrl } from '../utils/userImageHelpers';

const PlannerImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-500">
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-44 w-full rounded-2xl object-cover"
      onError={() => setFailed(true)}
    />
  );
};

const sanitizeTravelData = (nextUser) => ({
  favoriteDestinations: (nextUser?.favoriteDestinations || []).filter(Boolean),
  favoriteAttractions: (nextUser?.favoriteAttractions || []).filter(Boolean),
  plannedTrips: (nextUser?.plannedTrips || []).filter((trip) => Boolean(trip && trip._id)),
});

const PlannerSectionSkeleton = ({ cards = 3, compact = false }) => (
  <section className="rounded-3xl bg-white p-8 shadow-lg">
    <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
    <div className="mt-3 h-4 w-80 animate-pulse rounded-full bg-slate-100" />
    <div className={`mt-6 grid gap-6 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-5 flex gap-3">
            <div className="h-10 w-24 animate-pulse rounded-full bg-amber-200" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const PlannerTripSkeleton = () => (
  <section className="rounded-3xl bg-white p-8 shadow-lg">
    <div className="h-8 w-64 animate-pulse rounded-full bg-slate-200" />
    <div className="mt-3 h-4 w-72 animate-pulse rounded-full bg-slate-100" />
    <div className="mt-6 space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-40 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex gap-3">
            <div className="h-10 w-24 animate-pulse rounded-full bg-amber-200" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Favorites = () => {
  const { user, updateUser } = useAuth();
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [favoriteAttractions, setFavoriteAttractions] = useState([]);
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncTravelData = (nextUser) => {
    const safeData = sanitizeTravelData(nextUser);
    setFavoriteCities(safeData.favoriteDestinations);
    setFavoriteAttractions(safeData.favoriteAttractions);
    setPlannedTrips(safeData.plannedTrips);
    updateUser(nextUser);
  };

  useEffect(() => {
    if (!user) {
      setFavoriteCities([]);
      setFavoriteAttractions([]);
      setPlannedTrips([]);
      setLoading(false);
      return;
    }

    // Show cached planner data immediately while the latest profile loads once.
    const safeCachedData = sanitizeTravelData(user);
    setFavoriteCities(safeCachedData.favoriteDestinations);
    setFavoriteAttractions(safeCachedData.favoriteAttractions);
    setPlannedTrips(safeCachedData.plannedTrips);

    const fetchTravelData = async () => {
      if (!user?.id && !user?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/users/profile');
        syncTravelData(response.data);
      } catch (error) {
        toast.error('Unable to load your saved travel items');
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, [user?.id, user?._id, updateUser]);

  const handleRemoveCity = async (cityId) => {
    try {
      const response = await api.post('/users/favorites/remove', { cityId });
      syncTravelData(response.data.user);
      toast.success('City removed from favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove city');
    }
  };

  const handleRemoveAttraction = async (attractionId) => {
    try {
      const response = await api.post('/users/favorites/attractions/remove', { attractionId });
      syncTravelData(response.data.user);
      toast.success('Place removed from favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove place');
    }
  };

  const handleRemoveTrip = async (tripId) => {
    try {
      const response = await api.post('/users/planned-trips/remove', { tripId });
      syncTravelData(response.data.user);
      toast.success('Place removed from your plans');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove planned trip');
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-14 text-center shadow-lg">
        <h1 className="text-5xl font-semibold">Access Denied</h1>
        <p className="mt-4 text-slate-600">Please log in to view your favorites and bookings.</p>
        <Link to="/login" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-700">
          Log In
        </Link>
      </div>
    );
  }

  const hasSavedItems = favoriteCities.length || favoriteAttractions.length || plannedTrips.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">My Travel Planner</h1>
        <p className="mt-2 text-slate-600">Manage your favorite cities, saved places, and trip bookings in one place.</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <PlannerSectionSkeleton />
          <PlannerSectionSkeleton cards={2} compact />
          <PlannerTripSkeleton />
        </div>
      ) : (
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">Favorite Cities</h2>
            <p className="mt-2 text-slate-600">Destinations you want to keep handy while planning trips.</p>
            {favoriteCities.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {favoriteCities.map((city) => (
                  <div key={city._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <PlannerImage src={resolveImageUrl(city.imageUrl || '')} alt={city.cityName} />
                    <h3 className="mt-4 text-xl font-semibold">{city.cityName}</h3>
                    <p className="mt-2 text-slate-600">{city.country}</p>
                    <div className="mt-5 flex gap-3">
                      <Link to={`/city/${city._id}`} className="inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                        View City
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city._id)}
                        className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No favorite cities yet.</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">Favorite Attractions</h2>
            <p className="mt-2 text-slate-600">Places you saved directly from attraction detail pages.</p>
            {favoriteAttractions.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {favoriteAttractions.map((attraction) => (
                  <div key={attraction._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-xl font-semibold">{attraction.name}</h3>
                    <p className="mt-2 text-slate-600">{attraction.category}</p>
                    <p className="mt-3 text-sm text-slate-500">
                      {attraction.cityId?.cityName ? `${attraction.cityId.cityName}, ${attraction.cityId.country}` : attraction.location}
                    </p>
                    <div className="mt-5 flex gap-3">
                      <Link to={`/attraction/${attraction._id}`} className="inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                        View Place
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttraction(attraction._id)}
                        className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No favorite attractions yet.</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">Planned Trips & Bookings</h2>
            <p className="mt-2 text-slate-600">Saved itinerary items and places you marked as booked.</p>
            {plannedTrips.length ? (
              <div className="mt-6 space-y-4">
                {plannedTrips.map((trip) => (
                  <div key={trip._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold">{trip.attractionId?.name || 'Planned place'}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {trip.attractionId?.cityId?.cityName
                            ? `${trip.attractionId.cityId.cityName}, ${trip.attractionId.cityId.country}`
                            : 'City details unavailable'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">
                        {trip.bookingStatus === 'booked' ? 'Booked' : 'Saved'}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                      <p>Visit date: {trip.visitDate ? new Date(trip.visitDate).toLocaleDateString() : 'Not set'}</p>
                      <p>Travelers: {trip.travelers || 1}</p>
                      <p>Ticket price: {trip.attractionId?.ticketPrice || 'Check venue'}</p>
                    </div>
                    {trip.notes ? <p className="mt-3 text-slate-600">{trip.notes}</p> : null}
                    <div className="mt-5 flex gap-3">
                      {trip.attractionId?._id ? (
                        <Link to={`/attraction/${trip.attractionId._id}`} className="inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                          View Place
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleRemoveTrip(trip._id)}
                        className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No planned trips or bookings yet.</p>
            )}
          </section>

          {!hasSavedItems ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
              <h2 className="text-xl font-semibold">No saved travel items yet</h2>
              <p className="mt-3 text-slate-600">Start exploring cities and attractions to build your own CityExplorer trip flow.</p>
              <Link to="/explore" className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 text-slate-900 hover:bg-amber-300">
                Explore Cities
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Favorites;
