import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', { name, username, email, password });
            console.log(response.data);
            if (response.data && response.data.userResponse && response.data.userResponse.token) {
                // Save the token in local storage (or cookie)
                localStorage.setItem('token', response.data.userResponse.token);
                // Redirect to the home page or dashboard
            } else {
                // Handle error: show a message to the user
            }
        } catch (error) {
            // Handle error: show a message to the user
        }
    };

    return (
        <div className="login-wrapper">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} id='login-form'>
                <input type="name" value={name} onChange={e => setName(e.target.value)} placeholder='name' />
                <input type="username" value={username} onChange={e => setUsername(e.target.value)} placeholder='username' />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder='email' />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='password' />
                <input type="submit" value="Submit" />
                <p>Already have an account? <a href="/login">Sign in here</a></p>
            </form>
        </div>
    );
}

export default Register;