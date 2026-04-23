import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAdminAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminShell from './components/AdminShell';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CreateCity from './pages/CreateCity';
import CreatePlace from './pages/CreatePlace';
import AdminProfile from './pages/AdminProfile';
import CityDetail from './pages/CityDetail';
import PlaceDetail from './pages/PlaceDetail';

const App = () => {
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f8efe2] text-slate-900">
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
          <Route path="city/:id" element={<CityDetail />} />
          <Route path="places/new" element={<CreatePlace />} />
          <Route path="places/edit/:id" element={<CreatePlace />} />
          <Route path="place/:id" element={<PlaceDetail />} />
        </Route>
        <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/admin/login'} replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;