import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto max-w-xl rounded-3xl bg-white p-14 text-center shadow-lg">
    <h1 className="text-5xl font-semibold">404</h1>
    <p className="mt-4 text-slate-600">The page you are looking for cannot be found.</p>
    <Link to="/" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-700">
      Return home
    </Link>
  </div>
);

export default NotFound;
