import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/userApi';
import AuthShell from '../components/UserAuthShell';
import { useAuth } from '../components/UserAuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email: normalizedEmail, password });
      login(response.data.user, response.data.token);
      toast.success(response.data.message || 'Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      toast.error(validationMessage || error.response?.data?.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New Account"
      title="Create your access to CityExplorer"
      description="Registration unlocks the full site immediately after sign-in. Save attractions, manage your profile, and start exploring right away."
      asideTitle="Why create an account?"
      asideText="Accounts let you explore protected content, keep favorites, and sign in instantly with email."
    >
      <h2 className="text-3xl font-semibold">Register</h2>
      <p className="mt-2 text-slate-600">Create your account and start saving attractions.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="yourname@example.com"
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
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-amber-600">
        Register with any valid email address. No email verification is required.
      </p>
    </AuthShell>
  );
};

export default Register;
