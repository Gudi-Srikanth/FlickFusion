import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Main from './App Components/Main';
import LogIn from './App Components/LogIn';
import SignUp from './App Components/SignUp';
import { useAuth } from './App Components/AuthContext';

function App() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={user ? <Main /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
