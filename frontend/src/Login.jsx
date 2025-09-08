import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout/Layout.css'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password){
            setError("Username and password are required!");
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = new URLSearchParams();
        formDetails.append('username', username);
        formDetails.append('password', password);

        try {
            const response = await fetch('http://localhost:8000/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                },
                body: formDetails,
            });

            setLoading(false);

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('token', data.access_token);
                sessionStorage.setItem('username', username);
                navigate('/chat');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Authentication failed!');
            }

        } catch (error) {
            setLoading(false);
            setError('An error occurred. Please try again later.');
        }
    };

    return(
        <div
            style={{
            display: "flex",
            justifyContent: "center", // horizontal centering
            alignItems: "center",     // vertical centering
            height: "100vh",          // full viewport height
            padding: "20px",
            }}
        >
            <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "20px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #28a745, #20c997)",
                color: "white",
                boxShadow: "0 4px 6px rgba(32, 105, 70, 0.5)",
                minWidth: "300px",
                maxWidth: "400px",
                width: "100%",
            }}
            >
                <div>
                    <label> Username:</label>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px" }}

                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px" }}

                    />
                </div>
                <button type="submit" disabled={loading}
                style={{
                    padding: "8px 15px",
                    marginLeft: "5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    background: "linear-gradient(90deg, #28a745, #20c997)", // same gradient
                    color: "white",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(32, 105, 70, 0.5)" // darker green shadow
                    }}
                >
                    {loading ? 'Loggin in...' : 'Login'}
                </button>
                {error && <p style={{ color: 'red'}}> {error}</p>}
            </form>
        </div>
    );
}

export default Login;