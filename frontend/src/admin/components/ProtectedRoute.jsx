import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAdminAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname + location.search,
          message: 'Admin sign-in required to access this portal.',
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;