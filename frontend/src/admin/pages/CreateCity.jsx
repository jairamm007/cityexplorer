import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageHelpers';
import ImageCropModal from '../components/ImageCropModal';

const initialCityForm = {
  cityName: '',
  country: '',
  state: '',
  location: '',
  description: '',
  imageUrl: '',
  latitude: '',
  longitude: '',
};

const CreateCity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [cityForm, setCityForm] = useState(initialCityForm);
  const [saving, setSaving] = useState(false);
  const [loadingCity, setLoadingCity] = useState(isEditMode);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadCity = async () => {
      setLoadingCity(true);
      try {
        const response = await api.get(`/cities/${id}`);
        const city = response.data;
        setCityForm({
          cityName: city.cityName || '',
          country: city.country || '',
          state: city.state || '',
          location: city.location || '',
          description: city.description || '',
          imageUrl: city.imageUrl || '',
          latitude: city.latitude ?? '',
          longitude: city.longitude ?? '',
        });
        setImagePreviewUrl(resolveImageUrl(city.imageUrl || ''));
      } catch (error) {
        toast.error('Unable to load city for editing');
        navigate('/admin');
      } finally {
        setLoadingCity(false);
      }
    };

    loadCity();
  }, [id, isEditMode, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCityForm((prev) => ({ ...prev, [name]: value }));
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
    if (!cityForm.imageUrl.trim()) {
      toast.info('Add an image URL first to crop it.');
      return;
    }

    const resolved = resolveImageUrl(cityForm.imageUrl.trim());
    setCropImageSrc(resolved);
    setCropOpen(true);
  };

  const handleRemoveCurrentImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    setCityForm((prev) => ({ ...prev, imageUrl: '' }));
    toast.success('Image removed from this city form');
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
      Object.entries(cityForm).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = isEditMode
        ? await api.put(`/cities/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post('/cities', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      toast.success(isEditMode ? 'City updated successfully!' : 'City saved successfully!');
      navigate(`/city/${response.data._id}`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        (isEditMode ? 'Unable to update city' : 'Unable to save city');
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
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">{isEditMode ? 'Edit City' : 'Add a New City'}</h1>
        <p className="mt-2 text-slate-600">
          {isEditMode ? 'Update the city details and replace the image if needed.' : 'Fill in the city details below, then save it to CityExplorer.'}
        </p>
      </div>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        {loadingCity ? (
          <p className="text-slate-500">Loading city details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
            {[
              { name: 'cityName', label: 'City name' },
              { name: 'country', label: 'Country' },
              { name: 'state', label: 'State / Region' },
              { name: 'location', label: 'Location description' },
              { name: 'imageUrl', label: 'Image URL' },
              { name: 'latitude', label: 'Latitude (optional)' },
              { name: 'longitude', label: 'Longitude (optional)' },
            ].map((field) => (
              <label key={field.name} className="block">
                <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                <input
                  name={field.name}
                  value={cityForm[field.name]}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
            ))}

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Upload Image (optional)</span>
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
                  alt="City preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                name="description"
                value={cityForm.description}
                onChange={handleChange}
                rows="5"
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Share what makes this city worth exploring."
              />
            </label>

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? (isEditMode ? 'Updating city...' : 'Saving city...') : isEditMode ? 'Update city' : 'Save city'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCityForm(initialCityForm);
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
        initialAspect={16 / 9}
      />
    </div>
  );
};

export default CreateCity;