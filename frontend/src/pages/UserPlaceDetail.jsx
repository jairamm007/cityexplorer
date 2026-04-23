import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { toast } from 'react-toastify';
import { useAuth } from '../components/UserAuthContext';
import api from '../services/userApi';
import {
  buildDirectionsUrl,
  buildOpenMeteoUrl,
  buildOpenStreetMapSearchUrl,
  buildOsrmRouteUrl,
  formatDistance,
  FREE_MAP_ATTRIBUTION,
  FREE_MAP_TILE_URL,
  haversineDistanceKm,
  weatherCodeLabel,
} from '../utils/userMapHelpers';
import { resolveImageUrl } from '../utils/userImageHelpers';

const getUserId = (user) => user?._id || user?.id || null;

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [map, position]);

  return null;
};

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 15000,
};

const buildWeatherReport = (code) => {
  if ([0, 1, 2].includes(code)) {
    return { level: 'Great', note: 'Clear to partly cloudy conditions. Good time for outdoor plans.' };
  }
  if ([3, 45, 48].includes(code)) {
    return { level: 'Caution', note: 'Cloudy or foggy conditions. Visibility can be lower.' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { level: 'Rain alert', note: 'Rain likely. Keep a flexible plan and carry rain protection.' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { level: 'Snow alert', note: 'Snow possible. Plan with warm gear and extra travel time.' };
  }
  if ([95, 96, 99].includes(code)) {
    return { level: 'Storm alert', note: 'Thunderstorm risk. Avoid exposed outdoor activities.' };
  }

  return { level: 'Moderate', note: 'Conditions may shift. Recheck before you leave.' };
};

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [attraction, setAttraction] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '', image: null });
  const [reviews, setReviews] = useState([]);
  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [deletingPlace, setDeletingPlace] = useState(false);
  const [tripForm, setTripForm] = useState({
    visitDate: '',
    travelers: 1,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, reviewsRes] = await Promise.all([
          api.get(`/attractions/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setAttraction(detailRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        toast.error('Unable to load place details');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const loadCoords = async () => {
      if (!attraction) return;
      if (attraction.latitude != null && attraction.longitude != null) {
        setCoords({ lat: Number(attraction.latitude), lng: Number(attraction.longitude) });
        return;
      }

      if (attraction.cityId?.latitude != null && attraction.cityId?.longitude != null) {
        setCoords({ lat: Number(attraction.cityId.latitude), lng: Number(attraction.cityId.longitude) });
        return;
      }

      try {
        const response = await fetch(buildOpenStreetMapSearchUrl(`${attraction.location} ${attraction.name}`));
        const results = await response.json();
        if (results.length > 0) {
          setCoords({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
        }
      } catch (error) {
        console.warn('Geocoding failed:', error);
      }
    };

    loadCoords();
  }, [attraction]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setTrackingLocation(true);
      },
      (error) => {
        console.warn('Geolocation unavailable:', error);
        setTrackingLocation(false);
      },
      GEOLOCATION_OPTIONS
    );
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coords) return;

      setLoadingWeather(true);
      try {
        const response = await fetch(buildOpenMeteoUrl(coords.lat, coords.lng));
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [coords]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!coords || !currentLocation) {
        setRoutePath(null);
        setRouteSummary(null);
        return;
      }

      setLoadingRoute(true);
      try {
        const response = await fetch(buildOsrmRouteUrl(currentLocation, coords));
        const data = await response.json();
        const route = data?.routes?.[0];

        if (!route?.geometry?.coordinates?.length) {
          setRoutePath([
            [currentLocation.lat, currentLocation.lng],
            [coords.lat, coords.lng],
          ]);
          setRouteSummary(null);
          return;
        }

        setRoutePath(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        setRouteSummary({
          distanceKm: route.distance / 1000,
          durationMinutes: Math.round(route.duration / 60),
        });
      } catch (error) {
        console.warn('Route lookup failed:', error);
        setRoutePath([
          [currentLocation.lat, currentLocation.lng],
          [coords.lat, coords.lng],
        ]);
        setRouteSummary(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [coords, currentLocation]);

  const distanceFromUser = useMemo(
    () => (coords && currentLocation ? haversineDistanceKm(currentLocation, coords) : null),
    [coords, currentLocation]
  );
  const directionsUrl = useMemo(() => buildDirectionsUrl(coords, currentLocation), [coords, currentLocation]);
  const placeGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${attraction?.name || ''} ${attraction?.cityId?.cityName || ''}`.trim())}`;
  const ownerId = attraction?.createdBy?._id || attraction?.createdBy || null;
  const isOwner = Boolean(user && ownerId && ownerId === getUserId(user));
  const addedByLabel = isOwner
    ? `Added by you (${attraction?.createdBy?.name || user?.name}${attraction?.createdBy?.email || user?.email ? ` | ${attraction?.createdBy?.email || user?.email}` : ''})`
    : attraction?.createdBy?.name
      ? `Added by ${attraction.createdBy.name}${attraction.createdBy.email ? ` | ${attraction.createdBy.email}` : ''}`
      : 'Added by CityExplorer';

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.info('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setTrackingLocation(true);
        toast.success('Live location tracking is active');
      },
      () => {
        toast.error('Unable to access your location');
      },
      GEOLOCATION_OPTIONS
    );
  };

  const requireAuth = () => {
    if (user) {
      return true;
    }

    toast.info('Please log in to save places, plan visits, or share reviews');
    navigate('/login');
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!requireAuth()) return;

    const formData = new FormData();
    formData.append('attractionId', id);
    formData.append('rating', review.rating);
    formData.append('comment', review.comment);
    if (review.image) {
      formData.append('image', review.image);
    }

    try {
      const response = await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReviews((prev) => [...prev, response.data]);
      setReview({ rating: 5, comment: '', image: null });
      toast.success('Review posted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to post review');
    }
  };

  const handleSaveFavorite = async () => {
    if (!requireAuth()) return;

    setSavingFavorite(true);
    try {
      const response = await api.post('/users/favorites/attractions/add', { attractionId: id });
      updateUser(response.data.user);
      toast.success('Place added to favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save place');
    } finally {
      setSavingFavorite(false);
    }
  };

  const handlePlanTrip = async (bookingStatus) => {
    if (!requireAuth()) return;

    setSavingTrip(true);
    try {
      const response = await api.post('/users/planned-trips/add', {
        attractionId: id,
        visitDate: tripForm.visitDate || undefined,
        travelers: Number(tripForm.travelers) || 1,
        notes: tripForm.notes,
        bookingStatus,
      });
      updateUser(response.data.user);
      toast.success(bookingStatus === 'booked' ? 'Place marked as booked' : 'Place added to your trip plan');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update trip plan');
    } finally {
      setSavingTrip(false);
    }
  };

  const handleEditPlace = () => {
    const type = /restaurant/i.test(attraction.category) ? 'restaurant' : 'attraction';
    navigate(`/dashboard/add-place?type=${type}&edit=${attraction._id}`);
  };

  const handleDeletePlace = async () => {
    const confirmed = window.confirm(`Delete ${attraction.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingPlace(true);
    try {
      await api.delete(`/attractions/${attraction._id}`);
      toast.success('Place deleted successfully');
      navigate(attraction.cityId?._id ? `/city/${attraction.cityId._id}` : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete place');
    } finally {
      setDeletingPlace(false);
    }
  };

  if (!attraction) {
    return <p className="text-slate-500">Loading place details...</p>;
  }

  const attractionImage = resolveImageUrl(attraction.imageUrl || '');

  const weatherDisplay = weather?.current_weather;
  const daily = weather?.daily;
  const weatherReport = weatherDisplay ? buildWeatherReport(weatherDisplay.weathercode) : null;
  const weatherDetailsUrl = coords ? buildOpenMeteoUrl(coords.lat, coords.lng) : null;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{attraction.name}</h1>
            {attraction.cityId?._id ? (
              <Link to={`/city/${attraction.cityId._id}`} className="mt-2 inline-flex text-amber-700 hover:text-amber-800">
                {attraction.cityId.cityName}, {attraction.cityId.country}
              </Link>
            ) : null}
            <p className="mt-3 max-w-3xl text-slate-600">{attraction.description}</p>
            <p className="mt-3 text-sm font-medium text-slate-500">{addedByLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={handleEditPlace}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeletePlace}
                  disabled={deletingPlace}
                  className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70"
                >
                  {deletingPlace ? 'Deleting...' : 'Delete'}
                </button>
              </>
            ) : null}
            <a
              href={placeGoogleUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View in Google
            </a>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {attraction.averageRating ? `${attraction.averageRating}/5 rating` : 'New attraction'}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            {attractionImage ? (
              <img src={attractionImage} alt={attraction.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center text-slate-400">No image available</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Category</h2>
              <p className="mt-2 text-slate-700">{attraction.category}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Location</h2>
              <p className="mt-2 text-slate-700">{attraction.location}</p>
              {coords ? (
                <p className="mt-2 text-sm text-slate-500">
                  Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              ) : null}
              {distanceFromUser ? <p className="mt-2 text-sm font-medium text-slate-700">Distance from you: {formatDistance(distanceFromUser)}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold">Timings</h2>
                <p className="mt-2 text-slate-700">{attraction.timings || 'Timings not available'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold">Ticket Price</h2>
                <p className="mt-2 text-slate-700">{attraction.ticketPrice || 'Free entry'}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleSaveFavorite}
                disabled={savingFavorite}
                className="w-full rounded-3xl bg-amber-500 py-3 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-70"
              >
                {savingFavorite ? 'Saving...' : 'Save to Favorites'}
              </button>
              <Link
                to="/favorites"
                className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open My Planner
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Map and directions</h2>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {trackingLocation ? 'Refresh live location' : 'Enable live location'}
            </button>
          </div>
          {distanceFromUser ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-slate-50 px-4 py-3">
              <div className="text-sm text-slate-700">
                <p>
                  You are <span className="font-semibold text-slate-900">{formatDistance(distanceFromUser)}</span> from {attraction.name}.
                </p>
                {routeSummary ? (
                  <p className="mt-1 text-slate-500">
                    Routed distance {formatDistance(routeSummary.distanceKm)} · About {routeSummary.durationMinutes} min by road
                  </p>
                ) : loadingRoute ? (
                  <p className="mt-1 text-slate-500">Calculating road route...</p>
                ) : null}
              </div>
              {directionsUrl ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                >
                  Open directions
                </a>
              ) : null}
            </div>
          ) : null}
          {coords || currentLocation ? (
            <div className="mt-5 h-96 overflow-hidden rounded-3xl border border-slate-200">
              <MapContainer center={currentLocation || coords} zoom={13} scrollWheelZoom className="h-full w-full">
                <TileLayer url={FREE_MAP_TILE_URL} attribution={FREE_MAP_ATTRIBUTION} />
                <RecenterMap position={currentLocation || coords} />
                {currentLocation ? (
                  <Marker position={[currentLocation.lat, currentLocation.lng]}>
                    <Popup>Your current location</Popup>
                  </Marker>
                ) : null}
                {routePath ? <Polyline positions={routePath} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85 }} /> : null}
                {coords ? (
                  <Marker position={coords}>
                    <Popup>{attraction.name}</Popup>
                  </Marker>
                ) : null}
              </MapContainer>
            </div>
          ) : (
            <p className="mt-5 text-slate-500">Location coordinates unavailable for this attraction.</p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Weather report</h2>
            {weatherDetailsUrl ? (
              <a
                href={weatherDetailsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Open weather API details
              </a>
            ) : null}
          </div>
          {loadingWeather ? (
            <p className="mt-4 text-slate-500">Loading weather...</p>
          ) : weatherDisplay ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{attraction.name} weather</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-slate-900">{weatherReport?.level || 'Moderate'}</p>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{weatherCodeLabel(weatherDisplay.weathercode)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{weatherReport?.note}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Current temperature</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.temperature)}°C</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Wind speed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.windspeed)} km/h</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Today range</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {daily?.temperature_2m_min?.[0] != null && daily?.temperature_2m_max?.[0] != null
                      ? `${Math.round(daily.temperature_2m_min[0])}°C to ${Math.round(daily.temperature_2m_max[0])}°C`
                      : 'Range unavailable'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Live data from Open-Meteo</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-500">Weather unavailable for this location.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold">Travel tips and visit info</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <h3 className="text-lg font-semibold">Best Time to Visit</h3>
            <p className="mt-3 text-slate-700">
              {attraction.bestTimeToVisit || 'Early morning or late afternoon are usually the best times to avoid crowds.'}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <h3 className="text-lg font-semibold">Travel Tips</h3>
            <p className="mt-3 text-slate-700">
              {attraction.travelTips || 'Bring comfortable shoes, water, and check local entry rules before visiting.'}
            </p>
            {distanceFromUser ? <p className="mt-3 text-sm text-slate-500">Current distance: {formatDistance(distanceFromUser)}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold">Book or Save This Place</h2>
        <p className="mt-2 text-slate-600">
          Add the attraction to your itinerary with an optional date, travelers, and notes, or mark it as booked for later reference.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Visit date</span>
            <input
              type="date"
              value={tripForm.visitDate}
              onChange={(event) => setTripForm((prev) => ({ ...prev, visitDate: event.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Travelers</span>
            <input
              type="number"
              min="1"
              value={tripForm.travelers}
              onChange={(event) => setTripForm((prev) => ({ ...prev, travelers: event.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              value={tripForm.notes}
              onChange={(event) => setTripForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows="3"
              placeholder="Transport reminders, ideal visit window, travel companions..."
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handlePlanTrip('saved')}
            disabled={savingTrip}
            className="rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-70"
          >
            Save to Trip Plan
          </button>
          <button
            type="button"
            onClick={() => handlePlanTrip('booked')}
            disabled={savingTrip}
            className="rounded-3xl border border-amber-400 px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-70"
          >
            Mark as Booked
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold">Traveler Reviews</h2>
        <div className="mt-5 space-y-4">
          {reviews.length ? (
            reviews.map((item) => (
              <div key={item._id || `${item.userId?._id}-${item.createdAt}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.userId?.name || 'Anonymous'}</span>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">{item.rating} / 5</span>
                </div>
                <p className="mt-3 text-slate-600">{item.comment || 'No comment provided.'}</p>
                {item.imageUrl ? (
                  <img src={resolveImageUrl(item.imageUrl)} alt="Review" className="mt-3 h-48 max-w-full rounded-3xl object-cover" />
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-slate-500">No reviews yet. Be the first to share your experience.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-semibold">Share Your Review</h2>
        <p className="mt-2 text-slate-600">Upload your rating, comment, and an optional travel photo to help future visitors.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Rating</span>
            <select
              value={review.rating}
              onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Comment</span>
            <textarea
              value={review.comment}
              onChange={(event) => setReview({ ...review, comment: event.target.value })}
              rows="4"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Upload Photo (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setReview({ ...review, image: event.target.files[0] })}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <button type="submit" className="rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700">
            Submit review
          </button>
        </form>
      </section>
    </div>
  );
};

export default PlaceDetail;
