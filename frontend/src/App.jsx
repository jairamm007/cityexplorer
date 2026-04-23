import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/UserNavbar';
import Footer from './components/Footer';
import Home from './pages/UserHome';
import Login from './pages/UserLogin';
import Register from './pages/UserRegister';
import Dashboard from './pages/UserDashboard';
import CreateCity from './pages/UserCreateCity';
import CreatePlace from './pages/UserCreatePlace';
import UserSettings from './pages/UserSettings';
import Support from './pages/UserSupport';
import Explore from './pages/UserExplore';
import CityDetail from './pages/UserCityDetail';
import PlaceDetail from './pages/UserPlaceDetail';
import NotFound from './pages/UserNotFound';
import Favorites from './pages/UserFavorites';
import ProtectedRoute from './components/UserProtectedRoute';
import { useAuth } from './components/UserAuthContext';
import { AdminAuthProvider } from './admin/components/AuthContext';
import AdminApp from './admin/App';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8efe2] text-slate-900">
      {!isAdminRoute ? <Navbar /> : null}
      <main className={`w-full ${isAdminRoute ? 'px-0 py-0' : `px-4 sm:px-6 lg:px-8 ${user ? 'py-8' : 'py-4'}`}`}>
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
          <Route path="/admin/*" element={<AdminAuthProvider><AdminApp /></AdminAuthProvider>} />
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
      </main>
      {!isAdminRoute ? <Footer /> : null}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;

