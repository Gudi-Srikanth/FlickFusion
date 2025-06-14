import React, { useState } from "react";
import axios from "axios";
import './LogIn.css';
import Footer from "./Footer";
import { useAuth } from './AuthContext';
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import Error from './Error';

function LogIn() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!username || !password) {
            setError("All fields are required.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const userData = { username, password };
            console.log(userData);
            const response = await axios.post("http://localhost:5000/login", userData);
            setUser(response.data.user);
            navigate('/home');
        } catch (error) {
            console.error('Error logging in:', error);
            if (error.response?.status === 401) {
                setError("Invalid Username or Password.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="logInContainer">
            <Header />
            <div className="logInCard">
                <h2 className="logInTitle">Welcome to FlickFusion</h2>
                <form className="logInForm" onSubmit={handleSubmit}>
                    {error && <Error message={error} />}
                    {loading && <div className="loading-spinner">Logging in...</div>}
                    <div className="formGroup">
                        <label className="loginLabels" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="formGroup">
                        <label className="loginLabels" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="logInButton" disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    <div className="signUpPrompt">
                        <div className="divider">
                            <span>New to FlickFusion?</span>
                        </div>
                        <button
                            type="button"
                            className="logInButton"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default LogIn;
