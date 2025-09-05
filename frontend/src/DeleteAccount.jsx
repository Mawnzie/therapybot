import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");

  const handleDelete = async () => {
    if (!username || !token) {
      setMessage("User not logged in");
      return;
    }

    try {
      // Delete auth user
      const response1 = await axios.delete(
        `http://localhost:8000/auth/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password },
        }
      );

      // Delete chat history
      const response2 = await axios.delete(
        `http://localhost:8000/chat/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password },
        }
      );

      // Remove session BEFORE setting message or navigating
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");

      // Combine messages safely
      const msg1 = response1.data?.detail || "Account deleted.";
      const msg2 = response2.data?.detail || "Chat history deleted.";
      setMessage(`${msg1} ${msg2}`);

      // Redirect to root
      navigate("/");

    } catch (err) {
      const serverMessage = err.response?.data?.detail || err.message;
      setMessage(`Error deleting account: ${serverMessage}`);
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
import { useNavigate } from "react-router-dom";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username"); // get username from session
  const token = sessionStorage.getItem("token");       // get token from session

  const handleDelete = async () => {
    try {
      const response1 = await axios.delete(
        `http://localhost:8000/auth/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }, // send password in request body
        }
      );
      setMessage(response1.data.detail);

      const response2 = await axios.delete(
        `http://localhost:8000/chat/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }, // send password in request body
        }
      );
      setMessage(response2.data.detail);



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

*/