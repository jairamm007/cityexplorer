import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      map.setView(position, 12);
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
    return { level: 'Great', note: 'Clear to partly cloudy conditions. Good time for outdoor visits.' };
  }
  if ([3, 45, 48].includes(code)) {
    return { level: 'Caution', note: 'Cloudy or foggy conditions. Visibility may be reduced.' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { level: 'Rain alert', note: 'Rain is expected. Carry rain protection and plan indoor stops.' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { level: 'Snow alert', note: 'Snowy conditions likely. Travel with extra caution.' };
  }
  if ([95, 96, 99].includes(code)) {
    return { level: 'Storm alert', note: 'Thunderstorm risk. Avoid exposed outdoor plans.' };
  }

  return { level: 'Moderate', note: 'Conditions are changing. Recheck weather before long travel.' };
};

const openGoogleSearch = (placeName) => {
  window.open(`https://www.google.com/search?q=${encodeURIComponent(placeName)}`, '_blank', 'noopener,noreferrer');
};

const PlaceSearchCard = ({
  place,
  subtitle,
  distanceText,
  description,
  showViewLink = false,
  onPlan,
  planLoading = false,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGoogleSearch(place.name);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Search ${place.name} on Google in a new tab`}
      onClick={() => openGoogleSearch(place.name)}
      onKeyDown={handleKeyDown}
      className="cursor-pointer rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{place.name}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {showViewLink ? (
            <Link
              to={`/attraction/${place._id}`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
            >
              View
            </Link>
          ) : null}
          {onPlan ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPlan(place);
              }}
              disabled={planLoading}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {planLoading ? 'Adding...' : 'Add to planner'}
            </button>
          ) : null}
        </div>
      </div>
      {description ? <p className="mt-4 text-slate-600">{description}</p> : null}
      {place.location ? <p className="mt-3 text-sm text-slate-500">Location: {place.location}</p> : null}
      {distanceText ? <p className="mt-2 text-sm font-medium text-slate-700">Distance from you: {distanceText}</p> : null}
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Click card to search on Google</p>
    </article>
  );
};

const CityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [city, setCity] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [planningPlaceId, setPlanningPlaceId] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const loadCity = async () => {
      setLoading(true);
      try {
        const [cityRes, attractionsRes] = await Promise.all([
          api.get(`/cities/${id}`),
          api.get('/attractions', { params: { cityId: id } }),
        ]);
        setCity(cityRes.data);
        setAttractions(attractionsRes.data);
      } catch (error) {
        toast.error('Unable to load city details');
      } finally {
        setLoading(false);
      }
    };

    loadCity();
  }, [id]);

  useEffect(() => {
    const loadCoords = async () => {
      if (!city) {
        return;
      }

      if (city.latitude != null && city.longitude != null) {
        setCoords({ lat: Number(city.latitude), lng: Number(city.longitude) });
        return;
      }

      try {
        const response = await fetch(
          buildOpenStreetMapSearchUrl(`${city.cityName}, ${city.state || city.country}`)
        );
        const results = await response.json();
        if (results.length > 0) {
          setCoords({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
        }
      } catch (error) {
        console.warn('City geocoding failed:', error);
      }
    };

    loadCoords();
  }, [city]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

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
      if (!coords) {
        return;
      }

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

  const restaurantList = useMemo(
    () => attractions.filter((item) => /restaurant/i.test(item.category)),
    [attractions]
  );

  const topAttractions = useMemo(
    () => attractions.filter((item) => !/restaurant/i.test(item.category)).slice(0, 5),
    [attractions]
  );

  const filteredAttractions = useMemo(() => {
    let filtered = attractions.filter(
      (item) => !/restaurant/i.test(item.category) && !/mall|market/i.test(item.category)
    );
    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category.toLowerCase().includes(filterCategory.toLowerCase()));
    }
    if (filterRating !== 'all') {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter((item) => (item.averageRating || 0) >= minRating);
    }
    return filtered;
  }, [attractions, filterCategory, filterRating]);

  const mallList = useMemo(
    () => attractions.filter((item) => /mall|market/i.test(item.category)),
    [attractions]
  );

  const allCityPlaces = useMemo(
    () => [...attractions].sort((left, right) => left.name.localeCompare(right.name)),
    [attractions]
  );

  const getPlaceCoordinates = (item) => {
    if (item.latitude != null && item.longitude != null) {
      return { lat: Number(item.latitude), lng: Number(item.longitude) };
    }

    if (coords) {
      return coords;
    }

    return null;
  };

  const getPlaceDistance = (item) => {
    if (!currentLocation) {
      return null;
    }

    const placeCoordinates = getPlaceCoordinates(item);
    if (!placeCoordinates) {
      return null;
    }

    return haversineDistanceKm(currentLocation, placeCoordinates);
  };

  const nearbyAttractions = useMemo(() => {
    if (!currentLocation) {
      return [];
    }

    return attractions
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item) => ({
        ...item,
        distanceKm: haversineDistanceKm(currentLocation, {
          lat: Number(item.latitude),
          lng: Number(item.longitude),
        }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 4);
  }, [attractions, currentLocation]);

  const cityDistance = useMemo(() => {
    if (!currentLocation || !coords) {
      return null;
    }

    return haversineDistanceKm(currentLocation, coords);
  }, [coords, currentLocation]);

  const pvpToBabaiDistance = useMemo(() => {
    if (!/vijayawada/i.test(city?.cityName || '')) {
      return null;
    }

    const pvpMall = mallList.find((item) => /pvp/i.test(item.name || ''));
    const babaiHotel = restaurantList.find((item) => /babai\s*hotel/i.test(item.name || ''));

    if (!pvpMall || !babaiHotel) {
      return null;
    }

    const pvpCoords = getPlaceCoordinates(pvpMall);
    const hotelCoords = getPlaceCoordinates(babaiHotel);

    if (!pvpCoords || !hotelCoords) {
      return null;
    }

    return haversineDistanceKm(pvpCoords, hotelCoords);
  }, [city?.cityName, mallList, restaurantList, coords]);

  const directionsUrl = useMemo(() => buildDirectionsUrl(coords, currentLocation), [coords, currentLocation]);
  const ownerId = city?.createdBy?._id || city?.createdBy || null;
  const isOwner = Boolean(user && ownerId && ownerId === getUserId(user));
  const addedByLabel = isOwner
    ? `Added by you (${city?.createdBy?.name || user?.name}${city?.createdBy?.email || user?.email ? ` | ${city?.createdBy?.email || user?.email}` : ''})`
    : city?.createdBy?.name
      ? `Added by ${city.createdBy.name}${city.createdBy.email ? ` | ${city.createdBy.email}` : ''}`
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

  const handleSaveCity = async () => {
    if (!user) {
      toast.info('Please log in to save cities');
      navigate('/login');
      return;
    }

    setSavingFavorite(true);
    try {
      const response = await api.post('/users/favorites/add', { cityId: id });
      updateUser(response.data.user);
      toast.success('City added to favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save city');
    } finally {
      setSavingFavorite(false);
    }
  };

  const requireAuth = () => {
    if (user) {
      return true;
    }

    toast.info('Please log in to use planner actions');
    navigate('/login');
    return false;
  };

  const handlePlanPlace = async (place) => {
    if (!place?._id) {
      return;
    }

    if (!requireAuth()) {
      return;
    }

    setPlanningPlaceId(place._id);
    try {
      const response = await api.post('/users/planned-trips/add', {
        attractionId: place._id,
        bookingStatus: 'saved',
      });
      updateUser(response.data.user);
      toast.success(`${place.name} added to your planner`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add place to planner');
    } finally {
      setPlanningPlaceId('');
    }
  };

  const handleEditCity = () => {
    navigate(`/dashboard/add-city?edit=${city._id}`);
  };

  const handleDeleteCity = async () => {
    const confirmed = window.confirm(`Delete ${city.cityName}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/cities/${city._id}`);
      toast.success('City deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete city');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !city) {
    return <p className="text-slate-500">Loading city details...</p>;
  }

  const cityImage = resolveImageUrl(city.imageUrl || '');
  const cityGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${city.cityName} ${city.country || ''}`.trim())}`;

  useEffect(() => {
    setImageFailed(false);
  }, [city.imageUrl, city._id]);

  const weatherDisplay = weather?.current_weather;
  const daily = weather?.daily;
  const weatherReport = weatherDisplay ? buildWeatherReport(weatherDisplay.weathercode) : null;
  const weatherDetailsUrl = coords ? buildOpenMeteoUrl(coords.lat, coords.lng) : null;

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[40px] bg-white shadow-xl">
        <div className="relative h-96 w-full">
          {cityImage && !imageFailed ? (
            <img
              src={cityImage}
              alt={city.cityName}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">Image unavailable</div>
          )}
        </div>
        <div className="space-y-6 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-amber-500">{city.country}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">{city.cityName}</h1>
              {(city.state || city.location) ? (
                <p className="mt-3 text-slate-600">{[city.state, city.location].filter(Boolean).join(' · ')}</p>
              ) : null}
              <p className="mt-3 text-sm font-medium text-slate-500">{addedByLabel}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={handleEditCity}
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    Edit City
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCity}
                    disabled={deleting}
                    className="rounded-full border border-rose-300 bg-rose-50 px-6 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70"
                  >
                    {deleting ? 'Deleting...' : 'Delete City'}
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={handleSaveCity}
                disabled={savingFavorite}
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-70"
              >
                {savingFavorite ? 'Saving...' : 'Save City'}
              </button>
              <a
                href={cityGoogleUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                View in Google
              </a>
              <Link
                to="/explore"
                className="rounded-full border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Back to exploration
              </Link>
            </div>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-700">{city.description}</p>
          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tourist spots</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{topAttractions.length}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Restaurants</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{restaurantList.length}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Malls & markets</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{mallList.length}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Nearby discovery</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {routeSummary?.distanceKm
                  ? formatDistance(routeSummary.distanceKm)
                  : cityDistance
                    ? formatDistance(cityDistance)
                    : nearbyAttractions.length
                      ? `${nearbyAttractions.length} found`
                      : 'Map view'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[2fr,1.2fr]" id="places">
        <div className="space-y-8">
          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{city.cityName}: famous tourist spots</h2>
            <p className="mt-3 text-slate-600">Enjoy the must-see attractions from this city with category and rating filters.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="museum">Museum</option>
                <option value="park">Park</option>
                <option value="monument">Monument</option>
                <option value="landmark">Landmark</option>
                <option value="temple">Temple</option>
                <option value="beach">Beach</option>
                <option value="historical">Historical</option>
              </select>
              <select
                value={filterRating}
                onChange={(event) => setFilterRating(event.target.value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
            {filteredAttractions.length ? (
              <div className="mt-6 space-y-4">
                {filteredAttractions.map((item) => (
                  <PlaceSearchCard
                    key={item._id}
                    place={item}
                    subtitle={`${item.category}${item.averageRating ? ` · ${item.averageRating}/5 rating` : ''}`}
                    description={item.description}
                    distanceText={getPlaceDistance(item) != null ? formatDistance(getPlaceDistance(item)) : null}
                    showViewLink
                    onPlan={handlePlanPlace}
                    planLoading={planningPlaceId === item._id}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No tourist spots available for this city yet.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{city.cityName}: malls & shopping</h2>
            <p className="mt-3 text-slate-600">Find the top shopping spots, malls, and local market areas.</p>
            {pvpToBabaiDistance != null ? (
              <div className="mt-4 rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                PVP Mall to Babai Hotel distance: <span className="font-semibold text-slate-900">{formatDistance(pvpToBabaiDistance)}</span>
              </div>
            ) : null}
            {mallList.length ? (
              <div className="mt-6 space-y-4">
                {mallList.map((item) => (
                  <PlaceSearchCard
                    key={item._id}
                    place={item}
                    subtitle={item.category}
                    description={item.description}
                    distanceText={getPlaceDistance(item) != null ? formatDistance(getPlaceDistance(item)) : null}
                    showViewLink
                    onPlan={handlePlanPlace}
                    planLoading={planningPlaceId === item._id}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No mall or market entries available for this city yet.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{city.cityName}: restaurants & dining</h2>
            <p className="mt-3 text-slate-600">Discover local favorites and popular dining spots.</p>
            {restaurantList.length ? (
              <div className="mt-6 space-y-4">
                {restaurantList.map((item) => (
                  <PlaceSearchCard
                    key={item._id}
                    place={item}
                    subtitle={item.category}
                    description={item.description}
                    distanceText={getPlaceDistance(item) != null ? formatDistance(getPlaceDistance(item)) : null}
                    showViewLink
                    onPlan={handlePlanPlace}
                    planLoading={planningPlaceId === item._id}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No restaurants have been added for this city yet.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">All places in {city.cityName}</h2>
            <p className="mt-3 text-slate-600">
              Browse all attractions, shopping places, and restaurants tagged under this city and open any place detail directly.
            </p>
            {allCityPlaces.length ? (
              <div className="mt-6 space-y-4">
                {allCityPlaces.map((item) => (
                  <PlaceSearchCard
                    key={item._id}
                    place={item}
                    subtitle={`${item.category}${item.averageRating ? ` · ${item.averageRating}/5 rating` : ''}`}
                    description={item.description}
                    distanceText={getPlaceDistance(item) != null ? formatDistance(getPlaceDistance(item)) : null}
                    showViewLink
                    onPlan={handlePlanPlace}
                    planLoading={planningPlaceId === item._id}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No places are available for this city yet.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Nearby places from your location</h2>
            <p className="mt-3 text-slate-600">
              If location access is enabled, CityExplorer highlights the closest places in this city to support nearby discovery.
            </p>
            {nearbyAttractions.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {nearbyAttractions.map((item) => (
                  <div key={item._id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-500">{item.category}</p>
                    <p className="mt-3 text-slate-700">{formatDistance(item.distanceKm)}</p>
                    <Link
                      to={`/attraction/${item._id}`}
                      className="mt-4 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                    >
                      View place
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-slate-500">Enable location access to see nearby places in this city.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">Live location</h2>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {trackingLocation ? 'Refresh live location' : 'Enable live location'}
              </button>
            </div>
            {cityDistance ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-700">
                  <p>
                    You are <span className="font-semibold text-slate-900">{formatDistance(cityDistance)}</span> from {city.cityName}.
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
                    className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                  >
                    Open directions
                  </a>
                ) : null}
              </div>
            ) : null}
            {coords || currentLocation ? (
              <div className="mt-6 h-96 overflow-hidden rounded-[28px] border border-slate-200">
                <MapContainer center={currentLocation || coords} zoom={12} scrollWheelZoom className="h-full w-full">
                  <TileLayer url={FREE_MAP_TILE_URL} attribution={FREE_MAP_ATTRIBUTION} />
                  <RecenterMap position={currentLocation || coords} />
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]}>
                      <Popup>Your current location</Popup>
                    </Marker>
                  )}
                  {routePath ? <Polyline positions={routePath} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85 }} /> : null}
                  {coords ? (
                    <Marker position={[coords.lat, coords.lng]}>
                      <Popup>{city.cityName}</Popup>
                    </Marker>
                  ) : null}
                  {attractions.map((item) =>
                    item.latitude != null && item.longitude != null ? (
                      <Marker key={item._id} position={[Number(item.latitude), Number(item.longitude)]}>
                        <Popup>
                          <strong>{item.name}</strong>
                          <p>{item.category}</p>
                        </Popup>
                      </Marker>
                    ) : null
                  )}
                </MapContainer>
              </div>
            ) : (
              <p className="mt-6 text-slate-500">Live location is unavailable for this city right now.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">Weather report</h2>
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
                <div className="rounded-[28px] bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{city.cityName} weather</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <p className="text-xl font-semibold text-slate-900">{weatherReport?.level || 'Moderate'}</p>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{weatherCodeLabel(weatherDisplay.weathercode)}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{weatherReport?.note}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Current temperature</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.temperature)}°C</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Wind speed</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.windspeed)} km/h</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50 p-4 sm:col-span-2">
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
              <p className="mt-4 text-slate-500">Weather unavailable for this city.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Travel information</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              <p><span className="font-semibold text-slate-900">City:</span> {city.cityName}</p>
              <p><span className="font-semibold text-slate-900">Country:</span> {city.country}</p>
              {city.state ? <p><span className="font-semibold text-slate-900">Region:</span> {city.state}</p> : null}
              {city.location ? <p><span className="font-semibold text-slate-900">Location:</span> {city.location}</p> : null}
              {cityDistance ? <p><span className="font-semibold text-slate-900">Distance from you:</span> {formatDistance(cityDistance)}</p> : null}
              {routeSummary ? (
                <p>
                  <span className="font-semibold text-slate-900">Road route:</span> {formatDistance(routeSummary.distanceKm)} and about {routeSummary.durationMinutes} minutes
                </p>
              ) : null}
              <p><span className="font-semibold text-slate-900">Best visiting time:</span> Early mornings and late afternoons are ideal for most attractions.</p>
              <p><span className="font-semibold text-slate-900">Travel tip:</span> Save this city and shortlist attractions before leaving so your itinerary stays organized.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityDetail;
