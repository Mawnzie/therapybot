import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setIsValid(false);
      setChecking(false);
      return;
    }

    // optional: verify with backend
    const verify = async () => {
      try {
        const res = await fetch("http://localhost:8000/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setIsValid(true);
        } else {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("username");
          setIsValid(false);
        }
      } catch (err) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        setIsValid(false);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) {
    return <p>Checking authentication...</p>;
  }

  return isValid ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;




/*import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  console.log("Inside proteced route");
  console.log("token", token);


  // If no token, block access and redirect immediately
  if (!token) {
    console.log("No token → redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Otherwise render the protected page
  return children;
}

export default ProtectedRoute;
*/