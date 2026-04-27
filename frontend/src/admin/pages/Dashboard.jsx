import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminAttractionCard from '../components/AdminAttractionCard';
import AdminCityCard from '../components/AdminCityCard';
import { useAdminAuth } from '../components/AuthContext';
import api from '../services/api';

const buildCityPlaceCounts = (attractions) =>
  attractions.reduce((counts, attraction) => {
    const cityId = attraction.cityId?._id || attraction.cityId;
    if (!cityId) {
      return counts;
    }

    const key = String(cityId);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAdminAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchCities, setSearchCities] = useState('');
  const [searchPlaces, setSearchPlaces] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingCityId, setDeletingCityId] = useState(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);
  const [citiesOpen, setCitiesOpen] = useState(true);
  const [placesOpen, setPlacesOpen] = useState(true);

  const currentView = useMemo(() => {
    if (location.pathname.startsWith('/admin/cities')) {
      return 'cities';
    }
    if (location.pathname.startsWith('/admin/places')) {
      return 'places';
    }
    if (location.pathname.startsWith('/admin/users')) {
      return 'users';
    }
    return 'all';
  }, [location.pathname]);

  const showOverview = currentView === 'all';
  const showCities = currentView === 'all' || currentView === 'cities';
  const showPlaces = currentView === 'all' || currentView === 'places';
  const showUsers = currentView === 'all' || currentView === 'users';

  const currentUserId = user?.id || user?._id || null;
  const selectedCityId = searchParams.get('cityId') || '';
  const selectedCity = useMemo(
    () => cities.find((city) => (city._id || city.id) === selectedCityId) || null,
    [cities, selectedCityId]
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overviewResponse, usersResponse, citiesResponse, attractionsResponse] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/users'),
          api.get('/cities'),
          api.get('/attractions'),
        ]);

        setOverview(overviewResponse.data.totals);
        setUsers(usersResponse.data);
        setCities(citiesResponse.data);
        setAttractions(attractionsResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchUsers.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter((entry) => {
      const role = entry.role || '';
      return [entry.name, entry.email, role, entry.authProvider]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [searchUsers, users]);

  const filteredCities = useMemo(() => {
    const term = searchCities.trim().toLowerCase();
    if (!term) {
      return cities;
    }

    return cities.filter((city) =>
      [city.cityName, city.country, city.state, city.location, city.createdBy?.name, city.createdBy?.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [cities, searchCities]);

  const filteredPlaces = useMemo(() => {
    const term = searchPlaces.trim().toLowerCase();
    return attractions.filter((attraction) => {
      const matchesCity = selectedCityId ? (attraction.cityId?._id || attraction.cityId) === selectedCityId : true;
      const matchesTerm = !term
        || [
          attraction.name,
          attraction.category,
          attraction.location,
          attraction.cityId?.cityName,
          attraction.createdBy?.name,
          attraction.createdBy?.email,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));

      return matchesCity && matchesTerm;
    });
  }, [attractions, searchPlaces, selectedCityId]);

  const cityPlaceCounts = useMemo(() => {
    return buildCityPlaceCounts(attractions);
  }, [attractions, cities]);

  const openCityPlaces = (cityId) => {
    if (!cityId) {
      return;
    }

    setPlacesOpen(true);
    navigate(`/places?cityId=${encodeURIComponent(cityId)}#places`);

    requestAnimationFrame(() => {
      const element = document.getElementById('places');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const clearCityPlaces = () => {
    navigate('/admin/places#places');
  };

  const updateRole = async (userId, nextRole) => {
    setUpdatingRoleId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((entry) => (entry._id === userId || entry.id === userId ? { ...entry, role: response.data.user.role } : entry))
      );
      toast.success('User role updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm('Delete this user account? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((entry) => (entry._id || entry.id) !== userId));
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const deleteCity = async (cityId) => {
    const confirmed = window.confirm('Delete this city? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingCityId(cityId);
    try {
      await api.delete(`/cities/${cityId}`);
      setCities((prev) => prev.filter((city) => city._id !== cityId));
      toast.success('City deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete city');
    } finally {
      setDeletingCityId(null);
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
      setAttractions((prev) => prev.filter((place) => place._id !== placeId));
      toast.success('Place deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete place');
    } finally {
      setDeletingPlaceId(null);
    }
  };

  const jumpToSection = (sectionId) => {
    if (sectionId === 'cities') {
      navigate('/admin/cities#cities');
      requestAnimationFrame(() => {
        const element = document.getElementById('cities');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return;
    }
    if (sectionId === 'places') {
      navigate('/admin/places#places');
      requestAnimationFrame(() => {
        const element = document.getElementById('places');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return;
    }
    if (sectionId === 'users') {
      navigate('/admin/users#users');
      requestAnimationFrame(() => {
        const element = document.getElementById('users');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <div className="rounded-[40px] bg-white p-8 shadow-xl text-slate-500">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[40px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          This admin portal uses the same visual language as the user site, but gives you full control over users,
          cities, malls, restaurants, attractions, and other place listings.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Signed in as {user?.name} • {user?.email}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Add a New City',
            description: 'Create a city page with travel details, image, and map coordinates.',
            button: 'Add city',
            action: () => navigate('/admin/cities/new'),
            style: 'pill',
          },
          {
            title: 'Add a New Place',
            description: 'Create a restaurant, mall, attraction, or custom place listing.',
            button: 'Add place',
            action: () => navigate('/admin/places/new'),
            style: 'pill',
          },
          {
            title: 'Manage Users',
            description: 'Edit roles or delete accounts from the user directory.',
            button: 'View users',
            action: () => jumpToSection('users'),
            style: 'ghost',
          },
        ].map((card) => (
          <article key={card.title} className="rounded-[36px] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{card.description}</p>
            <button
              type="button"
              onClick={card.action}
              className={`mt-6 ${
                card.style === 'pill'
                  ? 'ui-action-pill'
                  : 'ui-action-ghost'
              }`}
            >
              {card.button}
            </button>
          </article>
        ))}
      </section>

      {showOverview ? (
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <p className="text-slate-600">Quick totals for your portal content and registered accounts.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total users', value: overview?.users ?? 0, sectionId: 'users' },
            { label: 'Admins', value: overview?.admins ?? 0, sectionId: 'users' },
            { label: 'Cities', value: overview?.cities ?? 0, sectionId: 'cities' },
            { label: 'Attractions', value: overview?.attractions ?? 0, sectionId: 'places' },
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => jumpToSection(card.sectionId)}
              className="rounded-[32px] bg-white p-6 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
              <p className="mt-3 text-sm text-slate-500">Click to jump</p>
            </button>
          ))}
        </div>
      </section>
      ) : null}

      {showCities ? (
      <section className="rounded-[40px] bg-white p-8 shadow-xl" id="cities">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Cities</h2>
            <p className="text-slate-600">Edit or delete any city, including user-added entries and seeded defaults.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="w-full max-w-md rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              value={searchCities}
              onChange={(event) => setSearchCities(event.target.value)}
              placeholder="Search city, country, state, or owner"
            />
            <button
              type="button"
              onClick={() => setCitiesOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              All
              <span className={`inline-block transition-transform duration-300 ${citiesOpen ? 'rotate-180' : ''}`}>v</span>
            </button>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${citiesOpen ? 'mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          {filteredCities.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCities.map((city) => (
                <AdminCityCard
                  key={city._id}
                  city={city}
                  onDelete={deleteCity}
                  onViewPlaces={openCityPlaces}
                  deleting={deletingCityId === city._id}
                  placeCount={cityPlaceCounts[city._id] || 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No cities match your search.</p>
          )}
        </div>
      </section>
      ) : null}

      {showPlaces ? (
      <section className="rounded-[40px] bg-white p-8 shadow-xl" id="places">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Places</h2>
            <p className="text-slate-600">
              {selectedCity
                ? `Showing all places for ${selectedCity.cityName}. Edit or delete them from here.`
                : 'Manage attractions, restaurants, malls, markets, and other place listings.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="w-full max-w-md rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              value={searchPlaces}
              onChange={(event) => setSearchPlaces(event.target.value)}
              placeholder="Search name, category, city, or owner"
            />
            <button
              type="button"
              onClick={() => setPlacesOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              All
              <span className={`inline-block transition-transform duration-300 ${placesOpen ? 'rotate-180' : ''}`}>v</span>
            </button>
          </div>
        </div>

        {selectedCity ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[28px] bg-slate-50 px-5 py-4">
            <p className="text-sm font-medium text-slate-700">Filtered to {selectedCity.cityName}</p>
            <button
              type="button"
              onClick={clearCityPlaces}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Show all places
            </button>
          </div>
        ) : null}

        <div className={`overflow-hidden transition-all duration-300 ${placesOpen ? 'mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          {filteredPlaces.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredPlaces.map((attraction) => (
                <AdminAttractionCard
                  key={attraction._id}
                  attraction={attraction}
                  onDelete={deletePlace}
                  deleting={deletingPlaceId === attraction._id}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No places match your search.</p>
          )}
        </div>
      </section>
      ) : null}

      {showUsers ? (
      <section className="rounded-[40px] bg-white p-8 shadow-xl" id="users">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
            <p className="text-slate-600">Edit roles or delete accounts from the user directory.</p>
          </div>
          <input
            className="w-full max-w-md rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
            value={searchUsers}
            onChange={(event) => setSearchUsers(event.target.value)}
            placeholder="Search name, email, role, or provider"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">User</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Role</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Provider</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Verified</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Contributions</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Joined</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((entry) => {
                  const rowId = entry._id || entry.id;
                  const isCurrentAdmin = rowId === currentUserId;

                  return (
                    <tr key={rowId}>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="grid gap-1">
                          <strong className="text-slate-900">{entry.name}</strong>
                          <span className="text-sm text-slate-500">{entry.email}</span>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <select
                          className="w-32 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
                          value={entry.role || 'user'}
                          disabled={isCurrentAdmin || updatingRoleId === rowId}
                          onChange={(event) => updateRole(rowId, event.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          {entry.authProvider || 'local'}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${entry.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {entry.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="grid gap-1 text-sm text-slate-600">
                          <span>{entry.cityCount || 0} cities</span>
                          <span>{entry.attractionCount || 0} places</span>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <button
                          type="button"
                          className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          disabled={isCurrentAdmin || deletingUserId === rowId}
                          onClick={() => deleteUser(rowId)}
                        >
                          {deletingUserId === rowId ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-slate-500">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}
    </div>
  );
};

export default Dashboard;