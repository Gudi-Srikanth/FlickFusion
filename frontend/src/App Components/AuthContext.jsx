import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch current user session
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/checkAuth', { withCredentials: true });
      if (res.data.authenticated) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  // Call once on load
  useEffect(() => {
    fetchUser();
  }, []);

  // Add logout handler here for global access
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
