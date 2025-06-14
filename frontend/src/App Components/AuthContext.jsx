import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/checkAuth', { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
        setAuthChecked(true);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setAuthChecked(true);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
