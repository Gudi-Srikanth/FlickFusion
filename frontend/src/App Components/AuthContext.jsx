import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Clean user data by removing sensitive fields
  const cleanUserData = (user) => {
    if (!user) return null;
    const { password_hash, ...safeUserData } = user;
    return safeUserData;
  };

  // Fetch current user session
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/checkAuth', { 
        withCredentials: true 
      });
      
      if (res.data.authenticated) {
        setUser(cleanUserData(res.data.user));
        // Store minimal user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          user_id: res.data.user.user_id,
          username: res.data.user.username,
          display_name: res.data.user.display_name,
          profile_pic_url: res.data.user.profile_pic_url
        }));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setAuthChecked(true);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // First check localStorage for quick UI render
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Then verify with server
    fetchUser();
    
    // Set up interval to check auth periodically
    const intervalId = setInterval(fetchUser, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { 
        withCredentials: true 
      });
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = {
    user,
    setUser: (userData) => setUser(cleanUserData(userData)),
    authChecked,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!authChecked ? (
        <div className="loading-screen">Loading authentication...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};