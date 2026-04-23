import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { toast } from 'react-toastify';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageHelpers';
import {
  buildDirectionsUrl,
  buildOpenMeteoUrl,
  buildOpenStreetMapSearchUrl,
  buildOsrmRouteUrl,
  FREE_MAP_ATTRIBUTION,
  FREE_MAP_TILE_URL,
  formatDistance,
  haversineDistanceKm,
  weatherCodeLabel,
} from '../utils/mapHelpers';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 15000,
};

const buildWeatherReport = (code) => {
  if ([0, 1, 2].includes(code)) {
    return { level: 'Great', note: 'Clear to partly cloudy conditions. Great for visiting this place.' };
  }
  if ([3, 45, 48].includes(code)) {
    return { level: 'Caution', note: 'Cloudy or foggy conditions. Visibility may be lower.' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { level: 'Rain alert', note: 'Rain likely. Keep alternate indoor plans ready.' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { level: 'Snow alert', note: 'Snow possible. Travel with extra caution.' };
  }
  if ([95, 96, 99].includes(code)) {
    return { level: 'Storm alert', note: 'Thunderstorm risk. Avoid exposed outdoor activity.' };
  }

  return { level: 'Moderate', note: 'Conditions may change. Recheck before departure.' };
};

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [map, position]);

  return null;
};

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingPlace, setDeletingPlace] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/attractions/${id}`);
        setPlace(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load place details');
        navigate('/admin/places');
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id, navigate]);

  useEffect(() => {
    const loadCoords = async () => {
      if (!place) {
        return;
      }

      if (place.latitude != null && place.longitude != null) {
        setCoords({ lat: Number(place.latitude), lng: Number(place.longitude) });
        return;
      }

      if (place.cityId?.latitude != null && place.cityId?.longitude != null) {
        setCoords({ lat: Number(place.cityId.latitude), lng: Number(place.cityId.longitude) });
        return;
      }

      try {
        const query = `${place.location || ''} ${place.name || ''}`.trim();
        if (!query) {
          return;
        }
        const response = await fetch(buildOpenStreetMapSearchUrl(query));
        const results = await response.json();
        if (results.length > 0) {
          setCoords({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
        }
      } catch (error) {
        console.warn('Place geocoding failed:', error);
      }
    };

    loadCoords();
  }, [place]);

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
      () => {
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

  const handleDeletePlace = async () => {
    if (!place) {
      return;
    }

    const confirmed = window.confirm(`Delete ${place.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingPlace(true);
    try {
      await api.delete(`/attractions/${place._id}`);
      toast.success('Place deleted successfully');
      if (place.cityId?._id) {
        navigate(`/city/${place.cityId._id}`);
      } else {
        navigate('/admin/places');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete place');
    } finally {
      setDeletingPlace(false);
    }
  };

  const distanceFromUser = useMemo(() => {
    if (!coords || !currentLocation) {
      return null;
    }

    return haversineDistanceKm(currentLocation, coords);
  }, [coords, currentLocation]);

  const directionsUrl = useMemo(() => buildDirectionsUrl(coords, currentLocation), [coords, currentLocation]);
  const weatherDisplay = weather?.current_weather;
  const daily = weather?.daily;
  const weatherReport = weatherDisplay ? buildWeatherReport(weatherDisplay.weathercode) : null;
  const placeImage = resolveImageUrl(place?.imageUrl || '');
  const placeGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${place?.name || ''} ${place?.cityId?.cityName || ''}`.trim())}`;
  const ownerName = place?.createdBy?.name;
  const ownerEmail = place?.createdBy?.email;
  const addedByLabel = ownerName
    ? `Added by ${ownerName}${ownerEmail ? ` | ${ownerEmail}` : ''}`
    : 'Added by CityExplorer';
  const weatherDetailsUrl = coords ? buildOpenMeteoUrl(coords.lat, coords.lng) : null;

  if (loading) {
    return <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">Loading place details...</div>;
  }

  if (!place) {
    return <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">Place not found.</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-600">{place.category || 'Place'}</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">{place.name}</h1>
            {place.cityId?._id ? (
              <Link to={`/city/${place.cityId._id}`} className="mt-2 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800">
                {place.cityId.cityName}, {place.cityId.country}
              </Link>
            ) : null}
            <p className="mt-4 max-w-3xl text-slate-600">{place.description || 'No place description yet.'}</p>
            {place.location ? <p className="mt-3 text-sm text-slate-500">Location: {place.location}</p> : null}
            <p className="mt-3 text-sm font-medium text-slate-500">{addedByLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/admin/places')} className="ui-action-ghost">
              Back to places
            </button>
            <Link to={`/places/edit/${place._id}`} className="ui-action-pill">
              Edit place
            </Link>
            <button
              type="button"
              onClick={handleDeletePlace}
              disabled={deletingPlace}
              className="rounded-full border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {deletingPlace ? 'Deleting place...' : 'Delete place'}
            </button>
            <a
              href={placeGoogleUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View in Google
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl xl:col-span-2">
          <div className="h-72 bg-slate-100">
            {placeImage ? (
              <img src={placeImage} alt={place.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No image available</div>
            )}
          </div>
          <div className="p-6 text-sm text-slate-600">
            <p>Timings: {place.timings || 'Not specified'}</p>
            <p className="mt-2">Ticket price: {place.ticketPrice || 'Not specified'}</p>
            <p className="mt-2">Best time: {place.bestTimeToVisit || 'Not specified'}</p>
            <p className="mt-2">Travel tips: {place.travelTips || 'Not available'}</p>
          </div>
        </article>

        <article className="rounded-[30px] bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">Live Location</h2>
          <p className="mt-2 text-sm text-slate-600">
            {trackingLocation
              ? 'Tracking active. You can see live distance and route estimate.'
              : 'Enable location tracking to compute live distance and route.'}
          </p>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-4 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Use my live location
          </button>
          <p className="mt-4 text-sm text-slate-600">
            Distance to place: {distanceFromUser != null ? formatDistance(distanceFromUser) : 'Enable live location'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Route estimate:{' '}
            {loadingRoute
              ? 'Calculating...'
              : routeSummary
                ? `${routeSummary.distanceKm.toFixed(1)} km, ${routeSummary.durationMinutes} min`
                : 'Unavailable'}
          </p>
          {directionsUrl ? (
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800">
              Open turn-by-turn directions
            </a>
          ) : null}
        </article>
      </section>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">GPS route map</h2>
          {distanceFromUser != null ? <p className="text-sm text-slate-600">{formatDistance(distanceFromUser)} from your location</p> : null}
        </div>
        {coords || currentLocation ? (
          <div className="mt-5 h-[420px] overflow-hidden rounded-[26px] border border-slate-200">
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
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>{place.name}</Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Map is unavailable until coordinates are found for this place.</p>
        )}
      </section>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
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
        {loadingWeather ? <p className="mt-2 text-sm text-slate-500">Loading weather...</p> : null}
        {!loadingWeather && weatherDisplay ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{place.name} weather</p>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{weatherCodeLabel(weatherDisplay.weathercode)}</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{weatherReport?.level || 'Moderate'}</p>
              <p className="mt-1 text-sm text-slate-600">{weatherReport?.note}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current temp</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.temperature)} deg C</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Wind speed</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(weatherDisplay.windspeed)} km/h</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Today range</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {daily?.temperature_2m_min?.[0] != null && daily?.temperature_2m_max?.[0] != null
                    ? `${Math.round(daily.temperature_2m_min[0])} to ${Math.round(daily.temperature_2m_max[0])} deg C`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {!loadingWeather && !weatherDisplay ? (
          <p className="mt-2 text-sm text-slate-500">Weather data will appear once place coordinates are available.</p>
        ) : null}
      </section>
    </div>
  );
};

export default PlaceDetail;
