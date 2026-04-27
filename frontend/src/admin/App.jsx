import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAdminAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminShell from './components/AdminShell';
import { toastContainerProps } from '../components/ToastCloseButton';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const CreateCity = lazy(() => import('./pages/CreateCity'));
const CreatePlace = lazy(() => import('./pages/CreatePlace'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const CityDetail = lazy(() => import('./pages/CityDetail'));
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'));

const RouteLoader = () => (
  <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center rounded-[32px] bg-white/80 p-8 text-slate-600 shadow-sm">
    Loading...
  </div>
);

const App = () => {
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8efe2] text-slate-900">
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Dashboard />} />
            <Route path="cities" element={<Dashboard />} />
            <Route path="places" element={<Dashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="cities/new" element={<CreateCity />} />
            <Route path="cities/edit/:id" element={<CreateCity />} />
            <Route path="places/new" element={<CreatePlace />} />
            <Route path="places/edit/:id" element={<CreatePlace />} />
            <Route path="city/:id" element={<CityDetail />} />
            <Route path="place/:id" element={<PlaceDetail />} />
            <Route path="create-city" element={<CreateCity />} />
            <Route path="create-place" element={<CreatePlace />} />
          </Route>
          <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/admin/login'} replace />} />
        </Routes>
      </Suspense>
      <ToastContainer {...toastContainerProps} />
    </div>
  );
};

export default App;
