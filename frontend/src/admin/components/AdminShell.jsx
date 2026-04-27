import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';

const AdminShell = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8efe2] text-slate-900">
      <header className="bg-white shadow-sm overflow-visible">
        <div className="relative flex w-full flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 overflow-visible">
          <Link to="/admin" className="inline-flex items-center gap-2 text-xl font-semibold text-amber-700">
            <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-100">
              <img src="/favicon.svg" alt="CityExplorer logo" className="h-full w-full object-cover" />
            </span>
            CityExplorer Admin
          </Link>
          <nav className="flex w-full flex-wrap items-center gap-2 text-sm font-medium text-slate-700 sm:w-auto sm:justify-end sm:gap-3">
            <NavLink to="/admin" className="ui-nav-ghost" end>
              Home
            </NavLink>
            <NavLink to="/admin/users" className="ui-nav-ghost">
              Users
            </NavLink>
            <NavLink to="/admin/profile" className="ui-nav-ghost">
              Profile
            </NavLink>
            <details className="relative overflow-visible">
              <summary className="ui-nav-ghost list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                Cities v
              </summary>
              <div className="absolute top-full right-0 z-50 mt-2 min-w-[13rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl overflow-visible">
                <Link to="/admin/cities" className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                  View cities
                </Link>
                <Link to="/admin/cities/new" className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                  Add city
                </Link>
              </div>
            </details>
            <details className="relative overflow-visible">
              <summary className="ui-nav-ghost list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                Places v
              </summary>
              <div className="absolute top-full right-0 z-50 mt-2 min-w-[13rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl overflow-visible">
                <Link to="/admin/places" className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                  View places
                </Link>
                <Link to="/admin/places/new" className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
                  Add place
                </Link>
              </div>
            </details>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="ui-nav-logout"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminShell;