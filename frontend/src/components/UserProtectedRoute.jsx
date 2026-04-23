import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './UserAuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
          message: 'Please sign in first to access this section.',
        }}
      />
    );
  }
  return children;
};

export default ProtectedRoute;
