import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { 
        withCredentials: true 
      });
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/checkAuth`, { 
          withCredentials: true,
          timeout: 5000
        });
        
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setAuthChecked(true);
      }
    };

    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (parseError) {
        console.error("Error parsing stored user:", parseError);
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    fetchUser();
    
    const intervalId = setInterval(fetchUser, 5 * 60 * 1000); //5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  const value = {
    user,
    setUser,
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