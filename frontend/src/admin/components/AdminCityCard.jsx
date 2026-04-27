import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../utils/imageHelpers';

const AdminCityCard = ({ city, onDelete, onViewPlaces, deleting = false, placeCount = 0 }) => {
  const navigate = useNavigate();
  const cityImage = resolveImageUrl(city.imageUrl || '');
  const ownerName = city.createdBy?.name;
  const ownerEmail = city.createdBy?.email;
  const cityId = city._id || city.id;
  const [imageFailed, setImageFailed] = useState(false);
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${city.cityName} ${city.country || ''}`.trim())}`;

  useEffect(() => {
    setImageFailed(false);
  }, [city.imageUrl, cityId]);

  const openCity = () => {
    navigate(`/admin/city/${cityId}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCity();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openCity}
      onKeyDown={handleCardKeyDown}
      className="group cursor-pointer overflow-hidden rounded-[32px] bg-white shadow-xl transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="h-64 overflow-hidden bg-slate-100">
        {cityImage && !imageFailed ? (
          <img
            src={cityImage}
            alt={city.cityName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Image unavailable</div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-500">{city.country}</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{city.cityName}</h3>
          {ownerName ? <p className="mt-2 text-sm text-slate-500">Added by {ownerName}{ownerEmail ? ` | ${ownerEmail}` : ''}</p> : null}
        </div>
        <p className="text-slate-600">{city.description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/city/${cityId}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open
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
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewPlaces(cityId);
            }}
            className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            {placeCount} places
          </button>
          <Link
            to={`/admin/cities/edit/${cityId}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(cityId);
            }}
            disabled={deleting}
            className="inline-flex rounded-full border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCityCard;