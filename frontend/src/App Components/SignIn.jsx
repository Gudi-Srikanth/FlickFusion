import React, { useState } from "react";
import axios from "axios";
import './SignIn.css';

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const userData = {
                username: username,
                password: password
            };
            console.log(userData);
            const response = await axios.post("http://localhost:5000/signin", userData);
            console.log(response.data);
        } catch (error) {
            console.error('Error signing in:', error);
        }
    }

    return (
        <div className="signInContainer">
            <h2 className="signInTitle">Sign In</h2>
            <form className="signInForm" onSubmit={handleSubmit}>
                <div className="formGroup">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                </div>
                <div className="formGroup">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                </div>
                <button type="submit" className="signInButton">Sign In</button>
            </form>
        </div>
    );
}

export default SignIn;
