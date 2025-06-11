import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './App Components/Header';
import Main from './App Components/Main';
import SignIn from './App Components/SignIn';
import SignUp from './App Components/SignUp';
import Review from './App Components/Main components/Left Components/Review';

function App() {
    return (
        <Router>
                <Routes>
                    <Route path="/" element={<div><Header /><Main /></div>} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/review" element={<Review />} />
                </Routes>
        </Router>
    );
}

export default App;
