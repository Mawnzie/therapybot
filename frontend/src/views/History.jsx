import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import NavBar from '../components/Navbar'
import Layout from '../components/Layout/Layout';

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
    <Layout>
    <div className="chat-wrapper">
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
        onClick={deleteHistory}>
        Delete history
      </button>
    </div>
    </Layout>
  );
}

export default History;

