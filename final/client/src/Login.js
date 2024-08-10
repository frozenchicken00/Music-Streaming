import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async event => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
            console.log(response.data);
            if (response.data && response.data.token) {
                // Save the token in local storage (or cookie)
                localStorage.setItem('token', response.data.token);
                // Redirect to the home page or dashboard
                navigate('/');
            } else {
                // Handle error: show a message to the user
            }
        } catch (error) {
            // Handle error: show a message to the user
        }
    };

    return (
        <div className="login-wrapper">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} id='login-form'>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='email' />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='password' />
                <input type="submit" value="Submit" />
                <p>Don't have an account? <a href="/register">Register here</a></p>
            </form>
        </div>
    );
}

export default Login;