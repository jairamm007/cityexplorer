import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageHelpers';
import ImageCropModal from '../components/ImageCropModal';

const initialPlaceForm = {
  cityId: '',
  name: '',
  description: '',
  location: '',
  category: 'Attraction',
  imageUrl: '',
  latitude: '',
  longitude: '',
  timings: '',
  ticketPrice: '',
  bestTimeToVisit: '',
  travelTips: '',
};

const baseCategoryOptions = [
  'Attraction',
  'Park',
  'Mall',
  'Restaurant',
  'Temple',
  'Shop',
  'Hospital',
  'Museum',
  'Market',
  'Landmark',
  'Other',
];

const sortCitiesAlphabetically = (items) => [...items].sort((left, right) => left.cityName.localeCompare(right.cityName));

const CreatePlace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(isEditMode);
  const [placeForm, setPlaceForm] = useState(initialPlaceForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOpen, setCropOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const options = new Set(baseCategoryOptions);
    if (placeForm.category) {
      options.add(placeForm.category);
    }
    return Array.from(options);
  }, [placeForm.category]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const presetCityId = location.state?.cityId;
    if (presetCityId) {
      setPlaceForm((prev) => ({ ...prev, cityId: presetCityId }));
    }
  }, [isEditMode, location.state]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await api.get('/cities');
        setCities(sortCitiesAlphabetically(response.data));
      } catch (error) {
        toast.error('Unable to load cities for this form');
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadPlace = async () => {
      setLoadingPlace(true);
      try {
        const response = await api.get(`/attractions/${id}`);
        const place = response.data;
        setPlaceForm({
          cityId: place.cityId?._id || place.cityId || '',
          name: place.name || '',
          description: place.description || '',
          location: place.location || '',
          category: place.category || 'Attraction',
          imageUrl: place.imageUrl || '',
          latitude: place.latitude ?? '',
          longitude: place.longitude ?? '',
          timings: place.timings || '',
          ticketPrice: place.ticketPrice || '',
          bestTimeToVisit: place.bestTimeToVisit || '',
          travelTips: place.travelTips || '',
        });
        setImagePreviewUrl(resolveImageUrl(place.imageUrl || ''));
      } catch (error) {
        toast.error('Unable to load place for editing');
        navigate('/admin');
      } finally {
        setLoadingPlace(false);
      }
    };

    loadPlace();
  }, [id, isEditMode, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPlaceForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'imageUrl' && !imageFile) {
      setImagePreviewUrl(resolveImageUrl(value));
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setCropImageSrc(objectUrl);
    setCropOpen(true);
  };

  const handleOpenUrlCrop = () => {
    if (!placeForm.imageUrl.trim()) {
      toast.info('Add an image URL first to crop it.');
      return;
    }

    const resolved = resolveImageUrl(placeForm.imageUrl.trim());
    setCropImageSrc(resolved);
    setCropOpen(true);
  };

  const handleRemoveCurrentImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    setPlaceForm((prev) => ({ ...prev, imageUrl: '' }));
    toast.success('Image removed from this place form');
  };

  const handleApplyCrop = ({ file, previewUrl }) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    setCropOpen(false);
    toast.success('Image crop applied');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(placeForm).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = isEditMode
        ? await api.put(`/attractions/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post('/attractions', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      toast.success(`${placeForm.category} ${isEditMode ? 'updated' : 'saved'} successfully!`);
      const nextCityId = response.data.cityId?._id || response.data.cityId || placeForm.cityId;
      if (nextCityId) {
        navigate(`/admin/city/${nextCityId}`);
      } else {
        navigate('/admin/places');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        `Unable to ${isEditMode ? 'update' : 'save'} place`;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-[40px] bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          Back to dashboard
        </button>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">{isEditMode ? 'Edit Place' : 'Add a New Place'}</h1>
        <p className="mt-2 text-slate-600">
          Add or update attractions, restaurants, malls, and other place listings with the same interface as the user portal.
        </p>
      </div>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        {loadingPlace ? (
          <p className="text-slate-500">Loading place details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">City</span>
              <select
                name="cityId"
                value={placeForm.cityId}
                onChange={handleChange}
                disabled={loadingCities}
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              >
                <option value="">{loadingCities ? 'Loading cities...' : 'Select city'}</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.cityName}, {city.country}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select
                name="category"
                value={placeForm.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {[
              { name: 'name', label: 'Place name' },
              { name: 'location', label: 'Location description' },
              { name: 'imageUrl', label: 'Image URL' },
              { name: 'latitude', label: 'Latitude (optional)' },
              { name: 'longitude', label: 'Longitude (optional)' },
              { name: 'timings', label: 'Opening hours' },
              { name: 'ticketPrice', label: 'Ticket price / cost' },
              { name: 'bestTimeToVisit', label: 'Best time to visit' },
            ].map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                <input
                  name={field.name}
                  value={placeForm[field.name]}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            ))}

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Upload Photo (optional)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleImageFileChange}
                className="mt-2 block w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="mt-2 text-xs text-slate-500">
                Optional. Use Image URL, upload photo, or both. Upload supports up to 20MB.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleOpenUrlCrop}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900"
                >
                  Crop from URL
                </button>
                {imagePreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCropImageSrc(imagePreviewUrl);
                      setCropOpen(true);
                    }}
                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900"
                  >
                    Crop current image
                  </button>
                ) : null}
                {imagePreviewUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveCurrentImage}
                    className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remove current image
                  </button>
                ) : null}
              </div>
              {imageFile ? <p className="mt-2 text-xs text-slate-600">Selected: {imageFile.name}</p> : null}
            </label>

            {imagePreviewUrl ? (
              <div className="lg:col-span-2 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                <img
                  src={imagePreviewUrl}
                  alt="Place preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                name="description"
                value={placeForm.description}
                onChange={handleChange}
                rows="5"
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Describe the experience and what makes this place special."
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Travel tips</span>
              <textarea
                name="travelTips"
                value={placeForm.travelTips}
                onChange={handleChange}
                rows="4"
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Share transport tips, timing tips, reservation tips, or what to carry."
              />
            </label>

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || loadingCities}
                className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? `${isEditMode ? 'Updating' : 'Saving'} place...` : `${isEditMode ? 'Update' : 'Save'} place`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaceForm(initialPlaceForm);
                  setImageFile(null);
                  setImagePreviewUrl('');
                  setCropImageSrc('');
                  setCropOpen(false);
                }}
                disabled={saving}
                className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
              >
                Clear form
              </button>
            </div>
          </form>
        )}
      </section>

      <ImageCropModal
        isOpen={cropOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropOpen(false)}
        onApply={handleApplyCrop}
        initialAspect={4 / 3}
      />
    </div>
  );
};

export default CreatePlace;