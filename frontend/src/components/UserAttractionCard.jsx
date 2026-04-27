import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildDirectionsUrl, formatDistance, haversineDistanceKm } from '../utils/userMapHelpers';
import { resolveImageUrl } from '../utils/userImageHelpers';

const AttractionCard = ({ attraction, currentLocation }) => {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const attractionImage = resolveImageUrl(attraction.imageUrl || '');
  const ownerName = attraction.createdBy?.name;
  const ownerEmail = attraction.createdBy?.email;
  const attractionCoordinates =
    attraction.latitude != null && attraction.longitude != null
      ? { lat: Number(attraction.latitude), lng: Number(attraction.longitude) }
      : attraction.cityId?.latitude != null && attraction.cityId?.longitude != null
        ? { lat: Number(attraction.cityId.latitude), lng: Number(attraction.cityId.longitude) }
        : null;
  const distanceFromUser = currentLocation && attractionCoordinates ? haversineDistanceKm(currentLocation, attractionCoordinates) : null;
  const directionsUrl = buildDirectionsUrl(attractionCoordinates, currentLocation);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${attraction.name} ${attraction.cityId?.cityName || ''}`.trim())}`;

  const openDetails = () => {
    navigate(`/attraction/${attraction._id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails();
    }
  };

  useEffect(() => {
    setImageFailed(false);
  }, [attraction.imageUrl, attraction._id]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="mb-4 h-48 overflow-hidden rounded-3xl bg-slate-100">
        {attractionImage && !imageFailed ? (
          <img
            src={attractionImage}
            alt={attraction.name}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Image unavailable</div>
        )}
      </div>
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
        {attraction.category}
      </span>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{attraction.name}</h3>
      {attraction.cityId?.cityName ? (
        <p className="mt-2 text-sm text-amber-700">{`${attraction.cityId.cityName}, ${attraction.cityId.country}`}</p>
      ) : null}
      {ownerName ? <p className="mt-2 text-sm text-slate-500">Added by {ownerName}{ownerEmail ? ` | ${ownerEmail}` : ''}</p> : null}
      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{attraction.description}</p>
      <p className="mt-3 text-sm text-slate-500">Location: {attraction.location}</p>
      {distanceFromUser != null ? <p className="mt-2 text-sm font-medium text-slate-700">Distance from you: {formatDistance(distanceFromUser)}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={`/attraction/${attraction._id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          View details
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
        {directionsUrl ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open directions
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default AttractionCard;
