import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const SettingsPage = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Assuming you have a way to get the current user's ID (e.g., from the token or another API call)
                const userId = getCurrentUserId(); // You need to implement this function
                const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data);
                const response1 = await axios.get('http://localhost:3001/api/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUsers(response1.data);
            } catch (error) {
                console.error("Error fetching user information:", error);
            }
        };

        fetchUserInfo();
    }, []);

    function decodeTokenAndGetUserId(token) {
        const decoded = jwtDecode(token);
        return decoded.id;
    }

    // Function to extract user ID from the token (you need to implement this based on your token structure)
    function getCurrentUserId() {
        const token = localStorage.getItem('token');
        return decodeTokenAndGetUserId(token); // Implement this function based on your token's structure
    }

    return (
        <div>
            <ul>
                {users.map(user => (
                    <li key={user._id}>{user.name} - {user.email}</li>
                ))}
            </ul>
            <h2>User Information</h2>
            {user ? (
                <ul>
                    <li>{user.name} - {user.email}</li>
                </ul>
            ) : (
                <p>Loading user information...</p>
            )}
        </div>

    );
};

export default SettingsPage;