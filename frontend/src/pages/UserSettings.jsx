import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/userApi';
import { useAuth } from '../components/UserAuthContext';
import { resolveImageUrl } from '../utils/userImageHelpers';
import ImageCropModal from '../components/UserImageCropModal';

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    profileImage: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrlInput, setProfileImageUrlInput] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [nameStatus, setNameStatus] = useState('idle');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        updateUser(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [updateUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        profileImage: user.profileImage || '',
      });
      setImagePreview(resolveImageUrl(user.profileImage || ''));
    }
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
        const response = await api.get('/users/profile-name-status', {
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

  const uploadProfileImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/users/profile-image', uploadData, {
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
      setImagePreview(resolveImageUrl(nextImage));
      updateUser(nextUser);
      setProfileImageUrlInput('');
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name' && nameSuggestions.length) {
      setNameSuggestions([]);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setCropImageSrc(objectUrl);
    setCropOpen(true);
    e.target.value = '';
  };

  const handleOpenUrlCrop = () => {
    if (!profileImageUrlInput.trim()) {
      toast.info('Add a profile image URL first to crop it.');
      return;
    }

    setCropImageSrc(resolveImageUrl(profileImageUrlInput.trim()));
    setCropOpen(true);
  };

  const handleApplyCrop = async ({ file, previewUrl }) => {
    setImagePreview(previewUrl);
    setCropOpen(false);
    await uploadProfileImage(file);
  };

  const handleRemovePhoto = async () => {
    setLoading(true);
    try {
      const response = await api.put('/users/profile', {
        ...formData,
        profileImage: '',
      });

      setFormData((prev) => ({
        ...prev,
        profileImage: '',
      }));
      setImagePreview('');
      setProfileImageUrlInput('');
      updateUser(response.data.user);
      toast.success('Profile photo removed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      setNameSuggestions([]);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const suggestions = error.response?.data?.suggestions;
      if (Array.isArray(suggestions) && suggestions.length) {
        setNameSuggestions(suggestions);
      }
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setActiveTab('profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This will permanently delete your account and profile data. Do you want to continue?');
    if (!confirmed) {
      return;
    }

    setDeletingAccount(true);
    try {
      await api.delete('/users/account');
      localStorage.removeItem('cityexplorer_user');
      localStorage.removeItem('cityexplorer_token');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {profileLoading ? (
        <div className="rounded-[40px] bg-white p-8 shadow-xl">
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      ) : (
        <>
      <div className="rounded-[40px] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-amber-400 bg-slate-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={() => setImagePreview('')}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-slate-500">No photo</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Member since</p>
              <p className="text-slate-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {user?.bio && (
              <div>
                <p className="text-sm font-semibold text-slate-600">Bio</p>
                <p className="text-slate-700">{user.bio}</p>
              </div>
            )}
            {user?.location && (
              <div>
                <p className="text-sm font-semibold text-slate-600">Location</p>
                <p className="text-slate-700">{user.location}</p>
              </div>
            )}
            {user?.phone && (
              <div>
                <p className="text-sm font-semibold text-slate-600">Phone</p>
                <p className="text-slate-700">{user.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[40px] bg-white shadow-xl">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition ${
              activeTab === 'profile'
                ? 'border-b-2 border-amber-400 text-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition ${
              activeTab === 'password'
                ? 'border-b-2 border-amber-400 text-amber-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Change Password
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Your name"
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
                <label className="block text-sm font-semibold text-slate-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Tell us about yourself (max 500 characters)"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="+1 (555) 000-0000"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Changing your phone number will reset its verification status.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Your city or country"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Profile Photo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="mt-2 block w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {uploadingImage ? 'Uploading cropped photo...' : 'Choose a JPG, PNG, or GIF from your device up to 20MB.'}
                </p>
                <input
                  type="text"
                  value={profileImageUrlInput}
                  onChange={(event) => setProfileImageUrlInput(event.target.value)}
                  className="mt-3 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  placeholder="Or paste a profile image URL to crop and upload"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleOpenUrlCrop}
                    disabled={uploadingImage}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Crop current photo
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={loading || uploadingImage || !formData.profileImage}
                  className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove photo
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingImage || nameStatus === 'checking' || nameStatus === 'taken'}
                className="w-full rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : nameStatus === 'checking' ? 'Checking name...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Enter current password"
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
                  placeholder="Enter new password (min 6 characters)"
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
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="rounded-[40px] border border-red-200 bg-red-50 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-red-700">Delete Account</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-red-900">
          Deleting your account will permanently remove your profile, saved cities, favorites, and planned trips. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          className="mt-6 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {deletingAccount ? 'Deleting...' : 'Delete my account'}
        </button>
      </div>

      <ImageCropModal
        isOpen={cropOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropOpen(false)}
        onApply={handleApplyCrop}
        initialAspect={1}
      />
        </>
      )}
    </div>
  );
};

export default UserSettings;
