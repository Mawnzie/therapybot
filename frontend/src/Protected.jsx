
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';

function ProtectedPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            console.log("Stored token:", token);

            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/auth/verify-token", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,  // ✅ send token in header
                    },
                });

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }

                const data = await response.json();
                console.log("Token verified:", data);

            } catch (error) {
                console.error(error);
                localStorage.removeItem('token');
                navigate('/');
            }
        };
        
        verifyToken();
    }, [navigate]);

    return <Chat/>
}

export default ProtectedPage;

