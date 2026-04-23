import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AdminAuthContext = createContext();

const getStoredAdminUser = () => {
  const saved = localStorage.getItem('cityexplorer_admin_user');
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem('cityexplorer_admin_user');
    return null;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredAdminUser);
  const [token, setToken] = useState(() => localStorage.getItem('cityexplorer_admin_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('cityexplorer_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cityexplorer_admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cityexplorer_admin_token', token);
    } else {
      localStorage.removeItem('cityexplorer_admin_token');
    }
  }, [token]);

  const login = useCallback((currentUser, authToken) => {
    setUser(currentUser);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);