import { Link } from 'react-router-dom';
import { useAuth } from './UserAuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="mt-16 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className={`grid gap-8 ${user ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <div>
            <h3 className="text-lg font-semibold">CityExplorer</h3>
            <p className="mt-2 text-slate-300">
              {user
                ? 'Discover amazing cities and attractions around the world. Plan your next adventure with us.'
                : 'Sign in to unlock cities, attractions, planning tools, and your personalized profile.'}
            </p>
          </div>

          {user && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-amber-400 transition">
                    Explore Cities
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-amber-400 transition">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide">{user ? 'Support' : 'Access'}</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {user ? (
                <>
                  <p>Need help? Reach out to us:</p>
                  <a
                    href="mailto:cityexplorer.contactsupport@gmail.com"
                    className="block text-amber-400 hover:text-amber-300 transition font-semibold"
                  >
                    cityexplorer.contactsupport@gmail.com
                  </a>
                  <p className="text-xs">We'll get back to you within 24 hours.</p>
                </>
              ) : (
                <>
                  <p>Create an account or sign in to access the full website interface.</p>
                  <Link to="/login" className="inline-flex text-amber-400 transition hover:text-amber-300 font-semibold">
                    Go to sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2026 CityExplorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
