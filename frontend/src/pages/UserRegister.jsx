import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/userApi';
import AuthShell from '../components/UserAuthShell';
import { useAuth } from '../components/UserAuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [nameStatus, setNameStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameStatus('idle');
      setNameSuggestions([]);
      return undefined;
    }

    setNameStatus('checking');
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get('/auth/profile-name-status', {
          params: { name: trimmedName },
        });
        setNameStatus(response.data.available ? 'available' : 'taken');
        setNameSuggestions(Array.isArray(response.data.suggestions) ? response.data.suggestions : []);
      } catch (error) {
        setNameStatus('idle');
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [name]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email: normalizedEmail, password });
      setNameSuggestions([]);
      login(response.data.user, response.data.token);
      toast.success(response.data.message || 'Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      const suggestions = error.response?.data?.suggestions;
      if (Array.isArray(suggestions) && suggestions.length) {
        setNameSuggestions(suggestions);
      }
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
            onChange={(e) => {
              setName(e.target.value);
              if (nameSuggestions.length) {
                setNameSuggestions([]);
              }
            }}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900"
          />
          {name.trim() && nameStatus === 'checking' ? (
            <p className="mt-2 text-xs text-slate-500">Checking profile name...</p>
          ) : null}
          {name.trim() && nameStatus === 'available' ? (
            <p className="mt-2 text-xs text-emerald-600">Profile name is available.</p>
          ) : null}
          {nameSuggestions.length ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                {nameStatus === 'taken' ? 'That profile name is taken. Try one of these' : 'Suggested profile names'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {nameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setName(suggestion);
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
          disabled={loading || nameStatus === 'checking' || nameStatus === 'taken'}
          className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating account...' : nameStatus === 'checking' ? 'Checking name...' : 'Register'}
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
