import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './UserAuthContext';
import { resolveImageUrl } from '../utils/userImageHelpers';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileImage = resolveImageUrl(user?.profileImage || '');
  const isAdminUser = user?.role === 'admin';

  const adminPortalUrl = '/admin';

  const isCitiesActive = location.pathname === '/explore' && (new URLSearchParams(location.search).get('view') || 'cities') === 'cities';
  const isPlacesActive = location.pathname === '/explore' && new URLSearchParams(location.search).get('view') === 'attractions';
  const isCityMenuActive = isCitiesActive || location.pathname.startsWith('/city') || location.pathname.startsWith('/dashboard/add-city');
  const isPlaceMenuActive = isPlacesActive || location.pathname.startsWith('/attraction') || location.pathname.startsWith('/dashboard/add-place');

  return (
    <header className="bg-white shadow-sm">
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <Link to={user ? '/' : '/login'} className="inline-flex items-center gap-2 text-xl font-semibold text-amber-700">
          <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-100">
            <img src="/favicon.svg" alt="CityExplorer logo" className="h-full w-full object-cover" />
          </span>
          CityExplorer
        </Link>
        <nav className="flex w-full flex-wrap items-center gap-2 text-sm font-medium text-slate-700 sm:w-auto sm:justify-end sm:gap-3">
          {user && (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `ui-nav-ghost ${isActive ? 'ui-nav-ghost-active' : ''}`}
              >
                Home
              </NavLink>
              <details className="relative">
                <summary className={`ui-nav-ghost list-none cursor-pointer [&::-webkit-details-marker]:hidden ${isCityMenuActive ? 'ui-nav-ghost-active' : ''}`}>
                  Cities v
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link to="/explore?view=cities" className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    Explore cities
                  </Link>
                  <Link to="/dashboard/add-city" className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    Add city
                  </Link>
                </div>
              </details>
              <details className="relative">
                <summary className={`ui-nav-ghost list-none cursor-pointer [&::-webkit-details-marker]:hidden ${isPlaceMenuActive ? 'ui-nav-ghost-active' : ''}`}>
                  Places v
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link to="/explore?view=attractions" className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    Explore places
                  </Link>
                  <Link to="/dashboard/add-place" className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                    Add place
                  </Link>
                </div>
              </details>
              <NavLink to="/support" className="ui-nav-muted">
                Support
              </NavLink>
              <NavLink to="/dashboard" className="ui-nav-muted">
                Dashboard
              </NavLink>
              <NavLink to="/favorites" className="ui-nav-muted">
                Planner
              </NavLink>
              {isAdminUser && (
                <Link
                  to={adminPortalUrl}
                  className="ui-nav-muted"
                  title="Open admin portal"
                >
                  Admin Portal
                </Link>
              )}
              <NavLink
                to="/settings"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:border-slate-300"
                title="Open profile settings"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                  {profileImage ? (
                    <img src={profileImage} alt={user?.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    (user?.name || 'U').trim().charAt(0).toUpperCase()
                  )}
                </span>
                <span className="max-w-28 truncate text-sm text-slate-700">{user?.name || 'Profile'}</span>
              </NavLink>
            </>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="ui-nav-logout"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden text-slate-500 sm:inline">Sign in to enter CityExplorer</span>
              <Link className="ui-nav-muted" to="/login">
                Sign In
              </Link>
              <Link className="ui-nav-pill px-5" to="/register">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
