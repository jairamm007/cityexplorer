import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/UserNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/UserProtectedRoute';
import { useAuth } from './components/UserAuthContext';
import { toastContainerProps } from './components/ToastCloseButton';
import { AdminAuthProvider } from './admin/components/AuthContext';

const Home = lazy(() => import('./pages/UserHome'));
const Login = lazy(() => import('./pages/UserLogin'));
const Register = lazy(() => import('./pages/UserRegister'));
const Dashboard = lazy(() => import('./pages/UserDashboard'));
const CreateCity = lazy(() => import('./pages/UserCreateCity'));
const CreatePlace = lazy(() => import('./pages/UserCreatePlace'));
const UserSettings = lazy(() => import('./pages/UserSettings'));
const Support = lazy(() => import('./pages/UserSupport'));
const Explore = lazy(() => import('./pages/UserExplore'));
const CityDetail = lazy(() => import('./pages/UserCityDetail'));
const PlaceDetail = lazy(() => import('./pages/UserPlaceDetail'));
const NotFound = lazy(() => import('./pages/UserNotFound'));
const Favorites = lazy(() => import('./pages/UserFavorites'));
const AdminShellApp = lazy(() => import('./admin/App'));

const RouteLoader = () => (
  <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center rounded-[32px] bg-white/80 p-8 text-slate-600 shadow-sm">
    Loading...
  </div>
);

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8efe2] text-slate-900">
      {!isAdminRoute ? <Navbar /> : null}
      <main className={`w-full ${isAdminRoute ? 'px-0 py-0' : `px-4 sm:px-6 lg:px-8 ${user ? 'py-8' : 'py-4'}`}`}>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<AdminAuthProvider><AdminShellApp /></AdminAuthProvider>} />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/city/:id"
              element={
                <ProtectedRoute>
                  <CityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attraction/:id"
              element={
                <ProtectedRoute>
                  <PlaceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/place/:id"
              element={
                <ProtectedRoute>
                  <PlaceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/add-city"
              element={
                <ProtectedRoute>
                  <CreateCity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/add-place"
              element={
                <ProtectedRoute>
                  <CreatePlace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/planner" element={<Navigate to="/favorites" replace />} />
            <Route path="/admin-portal" element={<Navigate to="/admin" replace />} />
            <Route path="/adminportal" element={<Navigate to="/admin" replace />} />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute ? <Footer /> : null}
      <ToastContainer {...toastContainerProps} />
    </div>
  );
}

export default App;
