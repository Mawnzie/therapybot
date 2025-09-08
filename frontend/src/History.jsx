import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Chat History</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "300px",
          maxHeight: "500px",
          overflowY: "auto",
          marginBottom: "10px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
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

     
      <div>
        <button onClick={logout}> Log out </button>
        <button onClick={deleteHistory}> Delete history </button>
         {message && <p>{message}</p>}
        <button onClick={goToChat}> Back to chat </button>

    </div>
    </div>

  );
}

export default History;
