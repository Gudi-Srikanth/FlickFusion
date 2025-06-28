import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Main from './App Components/Main';
import LogIn from './App Components/LogIn';
import SignUp from './App Components/SignUp';
import SearchResults from './App Components/SearchResults';
import EditProfile from './App Components/EditProfile';
import Movie from './App Components/Movie';
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
        <Route path="/search" element={<SearchResults />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
        <Route path="movie/:id" element={<Movie />}/>
      </Routes>
    </Router>
  );
}

export default App;
