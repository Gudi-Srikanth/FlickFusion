import React, { useState } from "react";
import axios from "axios"; // Import axios
import './SignUp.css';

function SignUp(){
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
            const response = await axios.post('http://localhost:5000/signup', userData);
            console.log('Response:', response);
            if (response.data) {
                console.log('Sign-up successful:', response.data);
            } else {
                console.error('Response data is undefined:', response);
            }
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };
    return (
        <div className="signUpContainer">
            <h2 className="signInTitle">CREATE ACCOUNT</h2>
            <form className="signUpForm" onSubmit={handleSubmit}>
                <div className="formGroup">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                </div>
                <div className="formGroup">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                </div>
                <button type="submit" className="signUpButton">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;
