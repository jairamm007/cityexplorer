import { Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../utils/imageHelpers';

const AdminAttractionCard = ({ attraction, onDelete, deleting = false }) => {
  const navigate = useNavigate();
  const attractionImage = resolveImageUrl(attraction.imageUrl || '');
  const ownerName = attraction.createdBy?.name;
  const ownerEmail = attraction.createdBy?.email;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${attraction.name} ${attraction.cityId?.cityName || ''}`.trim())}`;

  const openPlace = () => {
    navigate(`/admin/place/${attraction._id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPlace();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPlace}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="mb-4 h-48 overflow-hidden rounded-3xl bg-slate-100">
        {attractionImage ? (
          <img src={attractionImage} alt={attraction.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
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
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={`/admin/place/${attraction._id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Open
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
          to={`/admin/places/edit/${attraction._id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(attraction._id);
          }}
          disabled={deleting}
          className="inline-flex rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default AdminAttractionCard;