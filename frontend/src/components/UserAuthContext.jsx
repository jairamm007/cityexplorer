import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const getStoredUser = () => {
  const saved = localStorage.getItem('cityexplorer_user');
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem('cityexplorer_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('cityexplorer_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('cityexplorer_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cityexplorer_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cityexplorer_token', token);
    } else {
      localStorage.removeItem('cityexplorer_token');
    }
  }, [token]);

  const login = useCallback((currentUser, authToken) => {
    setUser(currentUser);
    setToken(authToken);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
