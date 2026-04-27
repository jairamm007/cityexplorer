import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../components/AuthContext';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageHelpers';
import ImageCropModal from '../components/ImageCropModal';

const AdminProfile = () => {
  const { user, updateUser } = useAdminAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileImageUrlInput, setProfileImageUrlInput] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [nameStatus, setNameStatus] = useState('idle');
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const response = await api.get('/admin/auth/profile');
        const nextUser = response.data.user;
        updateUser(nextUser);
        setFormData({
          name: nextUser.name || '',
          profileImage: nextUser.profileImage || '',
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load admin profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadAdminProfile();
  }, [updateUser]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: user.name || '',
      profileImage: user.profileImage || '',
    }));
  }, [user]);

  useEffect(() => {
    const trimmedName = formData.name.trim();
    const currentName = String(user?.name || '').trim();

    if (!trimmedName || !user) {
      setNameStatus('idle');
      setNameSuggestions([]);
      return undefined;
    }

    if (trimmedName === currentName) {
      setNameStatus('idle');
      setNameSuggestions([]);
      return undefined;
    }

    setNameStatus('checking');
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get('/admin/auth/profile-name-status', {
          params: { name: trimmedName },
        });
        setNameStatus(response.data.available ? 'available' : 'taken');
        setNameSuggestions(Array.isArray(response.data.suggestions) ? response.data.suggestions : []);
      } catch (error) {
        setNameStatus('idle');
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [formData.name, user]);

  const imagePreview = resolveImageUrl(formData.profileImage || user?.profileImage || '');

  const uploadProfileImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/admin/auth/profile-image', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const nextImage = response.data.profileImage || '';
      const nextUser = response.data.user;

      setFormData((prev) => ({
        ...prev,
        profileImage: nextImage,
      }));
      updateUser(nextUser);
      setProfileImageUrlInput('');
      toast.success('Profile photo uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload profile photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'name' && nameSuggestions.length) {
      setNameSuggestions([]);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.put('/admin/auth/profile', {
        name: formData.name,
        profileImage: formData.profileImage,
      });

      updateUser(response.data.user);
      toast.success('Admin profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update admin profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropOpen(true);
    event.target.value = '';
  };

  const handleOpenUrlCrop = () => {
    if (!profileImageUrlInput.trim()) {
      toast.info('Add a profile image URL first to crop it.');
      return;
    }

    setCropImageSrc(resolveImageUrl(profileImageUrlInput.trim()));
    setCropOpen(true);
  };

  const handleApplyCrop = async ({ file }) => {
    setCropOpen(false);
    await uploadProfileImage(file);
  };

  const handlePhotoRemove = async () => {
    setSavingProfile(true);
    try {
      const response = await api.put('/admin/auth/profile', {
        name: formData.name,
        profileImage: '',
      });

      setFormData((prev) => ({
        ...prev,
        profileImage: '',
      }));
      setProfileImageUrlInput('');
      updateUser(response.data.user);
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove profile photo');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/admin/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">
        Loading admin profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Profile Manager</h1>
        <p className="mt-2 text-slate-600">
          Update your admin display name, profile picture, and account password.
        </p>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="w-full rounded-[28px] border border-slate-200 bg-slate-50 p-6 lg:max-w-sm">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-amber-300 bg-white">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={formData.name || user?.name || 'Admin'}
                  className="h-full w-full object-cover"
                  onError={() =>
                    setFormData((prev) => ({
                      ...prev,
                      profileImage: '',
                    }))
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-amber-700">
                  {(formData.name || user?.name || 'A').trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="mt-5 text-center">
              <p className="text-lg font-semibold text-slate-900">{user?.name || 'Admin'}</p>
              <p className="text-sm text-slate-500">{user?.email || '-'}</p>
            </div>

            <div className="mt-6 space-y-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="text-xs text-slate-500">
                {uploadingImage ? 'Uploading cropped photo...' : 'Upload JPG, PNG, or GIF up to 20MB.'}
              </p>
              <input
                type="text"
                value={profileImageUrlInput}
                onChange={(event) => setProfileImageUrlInput(event.target.value)}
                className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                placeholder="Or paste a profile image URL to crop and upload"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleOpenUrlCrop}
                  disabled={uploadingImage}
                  className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Crop from URL
                </button>
                {imagePreview ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCropImageSrc(imagePreview);
                      setCropOpen(true);
                    }}
                    disabled={uploadingImage}
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Crop current photo
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handlePhotoRemove}
                disabled={savingProfile || uploadingImage || !formData.profileImage}
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove photo
              </button>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Profile Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Admin display name"
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                required
              />
              {formData.name.trim() && nameStatus === 'checking' ? (
                <p className="mt-2 text-xs text-slate-500">Checking profile name...</p>
              ) : null}
              {formData.name.trim() && nameStatus === 'available' ? (
                <p className="mt-2 text-xs text-emerald-600">This profile name is available.</p>
              ) : null}
              {nameSuggestions.length ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">Profile name is taken. Try one of these</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {nameSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, name: suggestion }));
                          setNameSuggestions([]);
                        }}
                        className="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Role</label>
              <input
                type="text"
                value={(user?.role || 'admin').toUpperCase()}
                disabled
                className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile || uploadingImage || nameStatus === 'checking' || nameStatus === 'taken'}
              className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-50"
            >
              {savingProfile ? 'Saving profile...' : nameStatus === 'checking' ? 'Checking name...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">Change Password</h2>
        <p className="mt-2 text-slate-600">Use your current password to set a new one.</p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {changingPassword ? 'Updating password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      <ImageCropModal
        isOpen={cropOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropOpen(false)}
        onApply={handleApplyCrop}
        initialAspect={1}
      />
    </div>
  );
};

export default AdminProfile;
