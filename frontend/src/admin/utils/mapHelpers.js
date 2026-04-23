export const FREE_MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const FREE_MAP_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export const OPEN_STREET_MAP_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving';

export const haversineDistanceKm = (start, end) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lng - start.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRadians(start.lat))
      * Math.cos(toRadians(end.lat))
      * Math.sin(dLon / 2)
      * Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (distanceKm) => {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
};

export const buildDirectionsUrl = (destination, currentLocation) => {
  if (!destination) {
    return null;
  }

  const destinationPart = `${destination.lat},${destination.lng}`;
  if (!currentLocation) {
    return `https://www.openstreetmap.org/directions?route=;${destinationPart}`;
  }

  return `https://www.openstreetmap.org/directions?route=${currentLocation.lat},${currentLocation.lng};${destinationPart}`;
};

export const buildOpenStreetMapSearchUrl = (query) =>
  `${OPEN_STREET_MAP_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;

export const buildOpenMeteoUrl = (lat, lng) =>
  `${OPEN_METEO_FORECAST_URL}?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

export const buildOsrmRouteUrl = (start, end) =>
  `${OSRM_ROUTE_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=simplified&geometries=geojson`;

export const weatherCodeLabel = (code) => {
  const labels = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return labels[code] || `Weather code ${code}`;
};
