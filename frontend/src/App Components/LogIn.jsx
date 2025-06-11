import React, { useState } from "react";
import axios from "axios";
import './LogIn.css';
import Footer from "./Footer";
import { useAuth } from './AuthContext';
import Header from "./Header";

function LogIn() {
    const { setUser } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const userData = { username, password };
            console.log(userData);
            const response = await axios.post("http://localhost:5000/login", userData);
            setUser(response.data.user); 
            console.log(response.data);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    return (
        <div className="logInContainer">
            <Header />

            <div className="logInCard">
                <h2 className="logInTitle">Welcome to FlickFusion</h2>
                <form className="logInForm" onSubmit={handleSubmit}>
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
                    <button type="submit" className="logInButton">Log In</button>
                    <div className="signUpPrompt">
                        <div className="divider">
                            <span>New to FlickFusion?</span>
                        </div>
                        <button
                            type="button"
                            className="logInButton"
                            onClick={() => window.location.href = "/signup"}
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
