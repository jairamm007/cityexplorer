import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/userApi';
import { useAuth } from '../components/UserAuthContext';
import { useEffect } from 'react';
import AuthShell from '../components/UserAuthShell';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const adminPortalUrl = '/admin';

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      toast.success('Login successful');
      navigate(location.state?.from || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Private Access"
      title="Sign in to open CityExplorer"
      description="The full website interface stays locked until you sign in. Once inside, you can explore cities, attractions, planner tools, and profile settings."
      asideTitle="Welcome back"
      asideText="Use your account to unlock the complete CityExplorer experience."
    >
      <h2 className="text-3xl font-semibold">Login</h2>
      <p className="mt-2 text-slate-600">Access your CityExplorer dashboard and manage travel picks.</p>
      <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">User sign-in</p>
          <p className="mt-1 text-sm text-slate-600">Continue here for normal user access.</p>
        </div>
        <a
          href={adminPortalUrl}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Admin? Open admin login
        </a>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        New to CityExplorer?{' '}
        <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
