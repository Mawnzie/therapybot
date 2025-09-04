import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedPage({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setIsChecking(false);
        setIsValid(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Invalid token");

        setIsValid(true);
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    verify();
  }, []);

  if (isChecking) {
    return <p>Checking authentication...</p>;
  }

  return isValid ? children : <Navigate to="/" replace />;
}

export default ProtectedPage;

/*
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedPage({ children }) {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/auth/verify-token", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Invalid token');

        setIsVerified(true); // token is valid
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    verifyToken();
  }, [navigate]);

  return isVerified ? children : <p>Checking login...</p>;
}

export default ProtectedPage;
*/