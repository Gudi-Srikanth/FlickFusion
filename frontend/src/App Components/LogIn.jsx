import React, { useEffect, useState } from "react";
import axios from "axios";
import './LogIn.css';
import Footer from "./Footer";
import { useAuth } from './AuthContext';
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import Error from './Error';
import { GoEye,GoEyeClosed } from "react-icons/go";


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LogIn() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        if(user){
            navigate('/home');
         }
    }, [user, navigate]);
     
    
    async function handleSubmit(event) {
        event.preventDefault();

        if (!username || !password) {
            setError("All fields are required.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { username, password }, {
                withCredentials: true
            });
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
                    <div className="formGroupLogin">
                        <label className="loginLabels" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            autoFocus 
                            disabled={loading} 
                        />
                    </div>
                    <div className="formGroupLogin">
                        <label className="loginLabels" htmlFor="password">Password</label>
                        <input
                            type={passwordVisible? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                        <button 
                            type="button" 
                            className="passwordVisibilityToggleButton" 
                            onClick={()=> setPasswordVisible(prev => !prev)}>
                            {passwordVisible?<GoEye/>:<GoEyeClosed/>}
                        </button>
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
