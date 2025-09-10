import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from '../components/Navbar';
import Layout from '../components/Layout/Layout';

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
    <Layout> 
      <NavBar items={[["/chat","Back to Chat"]]} />
        <h1>Delete Account for {username}</h1>
          <div className="button-row">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            
            />
            <button onClick={handleDelete}> Delete </button>
            {message && <p>{message}</p>}
          </div>
    </Layout>
  );
}

export default DeleteAccount;
