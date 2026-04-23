import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/userApi';
import { useAuth } from './UserAuthContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ label = 'Continue with Google' }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let attempts = 0;
    let timeoutId;
    let isActive = true;

    const renderGoogleButton = () => {
      if (!isActive) {
        return;
      }

      if (!window.google?.accounts?.id || !buttonRef.current) {
        attempts += 1;
        if (attempts < 20) {
          timeoutId = window.setTimeout(renderGoogleButton, 250);
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            const result = await api.post('/auth/google', { credential: response.credential });
            login(result.data.user, result.data.token);
            toast.success('Signed in with Google');
            navigate('/dashboard');
          } catch (error) {
            console.error('Google sign-in request failed:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            toast.error(error.response?.data?.message || error.message || 'Google sign-in failed');
          }
        },
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: buttonRef.current.offsetWidth || 320,
      });
    };

    renderGoogleButton();

    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [login, navigate]);

  if (!googleClientId) {
    return (
      <p className="text-center text-sm text-amber-600">
        Add `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to enable Google sign-in.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={buttonRef} className="flex min-h-[44px] justify-center" aria-label={label} />
      <p className="text-center text-xs text-slate-500">Use your Google account for faster sign-in and auto-verified email.</p>
    </div>
  );
};

export default GoogleSignInButton;
