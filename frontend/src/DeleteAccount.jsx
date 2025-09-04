import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username"); // get username from session
  const token = sessionStorage.getItem("token");       // get token from session

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/auth/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }, // send password in request body
        }
      );
      setMessage(response.data.detail);

      // clear session and redirect after deletion
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      navigate("/"); 
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error deleting account");
    }
  };

  return (
    <div>
      <h2>Delete Account for {username}</h2>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleDelete}>Delete Account</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DeleteAccount;


/*
import { useState } from "react";
import axios from "axios";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username"); // get username from session
  const token = sessionStorage.getItem("token");       // get token from session




  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/auth/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }, // send password in request body
        }
      );
      setMessage(response.data.detail);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error deleting account");
    }
  };

  return (
    <div>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleDelete}>Delete Account</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DeleteAccount;
*/