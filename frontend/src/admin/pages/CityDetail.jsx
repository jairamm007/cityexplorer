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
    return { level: 'Great', note: 'Clear to partly cloudy conditions. Good for city exploration.' };
  }
  if ([3, 45, 48].includes(code)) {
    return { level: 'Caution', note: 'Cloudy or foggy conditions may reduce visibility.' };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { level: 'Rain alert', note: 'Rain likely. Consider indoor alternatives and rain gear.' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { level: 'Snow alert', note: 'Snow possible. Expect slower movement outdoors.' };
  }
  if ([95, 96, 99].includes(code)) {
    return { level: 'Storm alert', note: 'Thunderstorm risk. Avoid exposed outdoor routes.' };
  }

  return { level: 'Moderate', note: 'Conditions are mixed. Check again before travel.' };
};

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [map, position]);

  return null;
};

const PlaceCard = ({ place, onDelete, deleting }) => {
  const navigate = useNavigate();
  const imageUrl = resolveImageUrl(place.imageUrl || '');
  const ownerName = place.createdBy?.name;
  const ownerEmail = place.createdBy?.email;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${place.name} ${place.cityId?.cityName || ''}`.trim())}`;

  const openPlace = () => {
    navigate(`/place/${place._id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPlace();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openPlace}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="h-48 bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
          {place.category || 'Place'}
        </span>
        <h3 className="text-xl font-semibold text-slate-900">{place.name}</h3>
        {place.location ? <p className="text-sm text-slate-600">Location: {place.location}</p> : null}
        {ownerName ? <p className="text-sm text-slate-500">Added by {ownerName}{ownerEmail ? ` | ${ownerEmail}` : ''}</p> : null}
        {place.description ? <p className="text-sm text-slate-600 line-clamp-3">{place.description}</p> : null}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/place/${place._id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open place
          </Link>
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View in Google
          </a>
          <Link
            to={`/places/edit/${place._id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Edit place
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(place._id);
            }}
            disabled={deleting}
            className="inline-flex rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete place'}
          </button>
        </div>
      </div>
    </article>
  );
};

const CityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingCity, setDeletingCity] = useState(false);
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);

  useEffect(() => {
    const loadCityDetail = async () => {
      setLoading(true);
      try {
        const [cityResponse, placesResponse] = await Promise.all([
          api.get(`/cities/${id}`),
          api.get('/attractions', { params: { cityId: id } }),
        ]);

        setCity(cityResponse.data);
        setPlaces(placesResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load city details');
        navigate('/admin/cities');
      } finally {
        setLoading(false);
      }
    };

    loadCityDetail();
  }, [id, navigate]);

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
        const response = await fetch(buildOpenStreetMapSearchUrl(`${city.cityName}, ${city.state || city.country}`));
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

  const deleteCity = async () => {
    const confirmed = window.confirm('Delete this city? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingCity(true);
    try {
      await api.delete(`/cities/${id}`);
      toast.success('City deleted');
      navigate('/admin/cities');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete city');
    } finally {
      setDeletingCity(false);
    }
  };

  const deletePlace = async (placeId) => {
    const confirmed = window.confirm('Delete this place? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingPlaceId(placeId);
    try {
      await api.delete(`/attractions/${placeId}`);
      setPlaces((prev) => prev.filter((entry) => entry._id !== placeId));
      toast.success('Place deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete place');
    } finally {
      setDeletingPlaceId(null);
    }
  };

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

  const restaurants = useMemo(
    () => places.filter((entry) => /restaurant/i.test(entry.category || '')),
    [places]
  );

  const mallsAndMarkets = useMemo(
    () => places.filter((entry) => /mall|market/i.test(entry.category || '')),
    [places]
  );

  const attractions = useMemo(
    () => places.filter((entry) => !/restaurant/i.test(entry.category || '') && !/mall|market/i.test(entry.category || '')),
    [places]
  );

  const cityDistance = useMemo(() => {
    if (!coords || !currentLocation) {
      return null;
    }

    return haversineDistanceKm(currentLocation, coords);
  }, [coords, currentLocation]);

  const cityLabelForSearch = `${city?.cityName || ''} ${city?.country || ''}`.trim();
  const cityImage = resolveImageUrl(city?.imageUrl || '');
  const cityGoogleUrl = `https://www.google.com/search?q=${encodeURIComponent(cityLabelForSearch)}`;
  const cityOwnerName = city?.createdBy?.name;
  const cityOwnerEmail = city?.createdBy?.email;
  const addedByLabel = cityOwnerName
    ? `Added by ${cityOwnerName}${cityOwnerEmail ? ` | ${cityOwnerEmail}` : ''}`
    : 'Added by CityExplorer';
  const weatherDisplay = weather?.current_weather;
  const daily = weather?.daily;
  const weatherReport = weatherDisplay ? buildWeatherReport(weatherDisplay.weathercode) : null;
  const directionsUrl = buildDirectionsUrl(coords, currentLocation);
  const weatherDetailsUrl = coords ? buildOpenMeteoUrl(coords.lat, coords.lng) : null;

  if (loading) {
    return <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">Loading city details...</div>;
  }

  if (!city) {
    return <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">City not found.</div>;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[40px] bg-white shadow-xl">
        <div className="h-64 w-full bg-slate-100 md:h-80">
          {cityImage ? (
            <img src={cityImage} alt={city.cityName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No city image</div>
          )}
        </div>
        <div className="space-y-4 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-600">{city.country || 'City'}</p>
          <h1 className="text-4xl font-semibold text-slate-900">{city.cityName}</h1>
          <p className="text-slate-600">{city.description || 'No city description yet.'}</p>
          <p className="text-sm text-slate-500">
            {city.state ? `${city.state} • ` : ''}
            {city.location || 'Location not specified'}
          </p>
          <p className="text-sm font-medium text-slate-500">{addedByLabel}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={() => navigate('/admin/cities')} className="ui-action-ghost">
              Back to cities
            </button>
            <Link to={`/cities/edit/${city._id}`} className="ui-action-pill">
              Edit city
            </Link>
            <button
              type="button"
              onClick={deleteCity}
              disabled={deletingCity}
              className="rounded-full border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {deletingCity ? 'Deleting city...' : 'Delete city'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/places/new', { state: { cityId: city._id } })}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Add place in this city
            </button>
            <a
              href={cityGoogleUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View in Google
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-[30px] bg-white p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">Live Location</h2>
          <p className="mt-2 text-sm text-slate-600">
            {trackingLocation
              ? 'Tracking active. Distances and route estimate are now live.'
              : 'Location tracking is off. Enable it for live distance and route estimates.'}
          </p>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-4 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Use my live location
          </button>
          <div className="mt-4 text-sm text-slate-600">
            <p>
              Distance to city: {cityDistance != null ? formatDistance(cityDistance) : 'Enable live location'}
            </p>
            <p className="mt-1">
              Route estimate:{' '}
              {loadingRoute
                ? 'Calculating...'
                : routeSummary
                  ? `${routeSummary.distanceKm.toFixed(1)} km, ${routeSummary.durationMinutes} min`
                  : 'Unavailable'}
            </p>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Open turn-by-turn directions
              </a>
            ) : null}
          </div>
        </article>

        <article className="rounded-[30px] bg-white p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Weather report</h2>
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
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{city.cityName} weather</p>
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
            <p className="mt-2 text-sm text-slate-500">Weather data will appear once city coordinates are available.</p>
          ) : null}
        </article>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total places', value: places.length },
          { label: 'Attractions', value: attractions.length },
          { label: 'Restaurants', value: restaurants.length },
          { label: 'Malls & markets', value: mallsAndMarkets.length },
        ].map((card) => (
          <article key={card.label} className="rounded-[30px] bg-white p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      {attractions.length ? (
        <section className="rounded-[40px] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Attractions</h2>
          <p className="mt-2 text-slate-600">Admin view with full edit and delete control.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {attractions.map((place) => (
              <PlaceCard
                key={place._id}
                place={place}
                onDelete={deletePlace}
                deleting={deletingPlaceId === place._id}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[30px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">GPS route map</h2>
          {cityDistance != null ? <p className="text-sm text-slate-600">{formatDistance(cityDistance)} from your location</p> : null}
        </div>
        {coords || currentLocation ? (
          <div className="mt-5 h-[420px] overflow-hidden rounded-[26px] border border-slate-200">
            <MapContainer center={currentLocation || coords} zoom={12} scrollWheelZoom className="h-full w-full">
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
                  <Popup>{city.cityName}</Popup>
                </Marker>
              ) : null}
              {places.map((item) =>
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
          <p className="mt-4 text-sm text-slate-500">Map is unavailable until coordinates are found for this city.</p>
        )}
      </section>

      {restaurants.length ? (
        <section className="rounded-[40px] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Restaurants</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((place) => (
              <PlaceCard
                key={place._id}
                place={place}
                onDelete={deletePlace}
                deleting={deletingPlaceId === place._id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {mallsAndMarkets.length ? (
        <section className="rounded-[40px] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Malls & Markets</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mallsAndMarkets.map((place) => (
              <PlaceCard
                key={place._id}
                place={place}
                onDelete={deletePlace}
                deleting={deletingPlaceId === place._id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!places.length ? (
        <section className="rounded-[40px] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">No places yet</h2>
          <p className="mt-2 text-slate-600">Start by adding places for this city from the admin portal.</p>
          <button
            type="button"
            onClick={() => navigate('/admin/places/new', { state: { cityId: city._id } })}
            className="mt-4 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add first place
          </button>
        </section>
      ) : null}
    </div>
  );
};

export default CityDetail;
