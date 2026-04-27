import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAdminAuth } from '../components/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/auth/login', form);
      login(response.data.user, response.data.token);
      toast.success('Admin login successful');
      navigate(location.state?.from || '/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <section className="rounded-[40px] bg-white p-8 shadow-xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">CityExplorer Admin</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Separate portal for user governance</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Sign in to manage users, roles, cities, malls, restaurants, attractions, and place listings from one
          admin-only workspace.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[28px] bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Role control</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Promote or demote accounts and remove users when needed.</p>
          </article>
          <article className="rounded-[28px] bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Content moderation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Edit every city and place, including user-added items.</p>
          </article>
        </div>
      </section>

      <section className="rounded-[40px] bg-white p-8 shadow-xl sm:p-10">
        <h2 className="text-3xl font-semibold text-slate-900">Admin sign in</h2>
        <p className="mt-2 text-slate-600">Use the admin account created for this portal.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email or Profile Name</span>
            <input
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              placeholder="admin@example.com or profile name"
              className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Open admin portal'}
          </button>
        </form>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">Not an admin? Continue to the normal user portal.</p>
          <Link
            to="/"
            className="mt-3 inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Open user portal
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Login;