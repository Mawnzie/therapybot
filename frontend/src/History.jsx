import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './Chat.css';
import NavBar from './Navbar'

function History() {
  const [chatHistory, setChatHistory] = useState([]); // full conversation
  const [userName, setUserName] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  


  const logout = () => {
    // Remove stored auth data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');

    setUserName(null);
    
    // Redirect to login page
    navigate('/');
  };

  const goToChat = () => {
    navigate("/chat"); // navigate to your DeleteAccount page
  };

  // On component mount, check localStorage for userId
  useEffect(() => {
    let storedUserName = sessionStorage.getItem("username");
    
    setUserName(storedUserName);
    const token = sessionStorage.getItem("token"); // get token

    // Optionally, fetch past conversation for this user
    fetchHistory(storedUserName,token);
  }, []);

  // Fetch past conversation from backend
  const fetchHistory = async (userName,token) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/chat/history/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}` // ✅ send token
      }
    });
      setChatHistory(response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const deleteHistory = async () => {
    try {
      const storedUserName = sessionStorage.getItem("username");
      const token = sessionStorage.getItem("token");

      // Delete chat history
      const response = await axios.delete(
        `http://localhost:8000/chat/users/${storedUserName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChatHistory([]);
      const msg = response.data?.detail || "Chat history deleted.";
      setMessage(`${msg}`);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };



  return (
    <div style={{ padding: "80px 20px 20px", maxWidth: "600px", margin: "auto" }}>
    <NavBar items={[["/deleteaccount", "Delete Account"],["/chat","Back to Chat"]]} />

      <h1>Chat History</h1>
      <div className="chat-window"
      >
        {chatHistory.length === 0 && <p>No history to show.</p>}
        {chatHistory
          .filter(turn => turn.Context || turn.Response) // only render non-empty turns
          .map((turn, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              {turn.Context && <p><strong>You:</strong> {turn.Context}</p>}
              {turn.Response && <p><strong>Assistant:</strong> {turn.Response}</p>}
            </div>
        ))}
      </div>
       <button
        onClick={deleteHistory}
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
        Delete history
      </button>
    </div>

  );
}

export default History;
