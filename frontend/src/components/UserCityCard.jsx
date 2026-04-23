import { Link, useNavigate } from 'react-router-dom';
import { buildDirectionsUrl, formatDistance, haversineDistanceKm } from '../utils/userMapHelpers';
import { resolveImageUrl } from '../utils/userImageHelpers';

const CityCard = ({ city, currentLocation, placeCount = 0 }) => {
  const navigate = useNavigate();
  const cityImage = resolveImageUrl(city.imageUrl || '');
  const ownerName = city.createdBy?.name;
  const ownerEmail = city.createdBy?.email;
  const cityCoordinates = city.latitude != null && city.longitude != null ? { lat: Number(city.latitude), lng: Number(city.longitude) } : null;
  const distanceFromUser = currentLocation && cityCoordinates ? haversineDistanceKm(currentLocation, cityCoordinates) : null;
  const directionsUrl = buildDirectionsUrl(cityCoordinates, currentLocation);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${city.cityName} ${city.country || ''}`.trim())}`;

  const openDetails = () => {
    navigate(`/city/${city._id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      className="group cursor-pointer overflow-hidden rounded-[32px] bg-white shadow-xl transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="h-64 overflow-hidden bg-slate-100">
        {cityImage ? (
          <img
            src={cityImage}
            alt={city.cityName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-500">{city.country}</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{city.cityName}</h3>
          {ownerName ? <p className="mt-2 text-sm text-slate-500">Added by {ownerName}{ownerEmail ? ` | ${ownerEmail}` : ''}</p> : null}
          {city.location ? <p className="mt-2 text-sm text-slate-600">Location: {city.location}</p> : null}
          {distanceFromUser != null ? <p className="mt-2 text-sm font-medium text-slate-700">Distance from you: {formatDistance(distanceFromUser)}</p> : null}
        </div>
        <p className="text-slate-600">{city.description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/city/${city._id}#places`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            {placeCount} places
          </Link>
          <Link
            to={`/city/${city._id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
          >
            View details
          </Link>
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View in Google
          </a>
          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Open directions
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CityCard;
