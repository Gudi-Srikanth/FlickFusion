import React, { useState } from 'react';
import axios from "axios";
import './SignUp.css';
import Footer from "./Footer";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Error from './Error';

function SignUp() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!displayName || !username || !password) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {

            await axios.post("http://localhost:5000/signup", {
                display_name: displayName,
                username,
                password
                }, {
                    withCredentials: true
                });
            const response = await axios.get("http://localhost:5000/checkAuth", {
                withCredentials: true
            });
            setUser(response.data.user);
            navigate('/home');

        } catch (error) {
         console.error('Error signing up:', error);

        if (error.response?.status === 400) {
            setError("Username already exists.");
          } else {
            setError("Something went wrong. Please try again.");
         }

        } finally {
         setLoading(false);
        }
    }

    return (
        <div className="signUpContainer">
            <Header />

            <div className="signUpCard">
                <h2 className="signUpTitle">Create Your FlickFusion Account</h2>
                
                <form className="signUpForm" onSubmit={handleSubmit}>
                    {error && <Error message={error} />}
                    
                    <div className="formGroup">
                        <label className="signUpLabels" htmlFor="displayname">Name</label>
                        <input
                            type="text"
                            id="displayname"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="formGroup">
                        <label className="signUpLabels" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="formGroup">
                        <label className="signUpLabels" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="signUpButton" disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}

export default SignUp;
