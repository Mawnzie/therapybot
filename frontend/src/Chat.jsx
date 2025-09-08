import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import NavBar from'./Navbar';
import { lighten, modularScale } from 'polished'
import './Chat.css';

function Chat() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // full conversation
  const [answerLoading, setAnswerLoading] = useState(false);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();  


  const goToDeleteAccount = () => {
    navigate("/deleteaccount"); // navigate to your DeleteAccount page
  };

  const goToHistory= () => {
    navigate("/history"); // navigate to your DeleteAccount page
  };

  const logout = () => {
    // Remove stored auth data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');

    setUserName(null);
    
    // Redirect to login page
    navigate('/');
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

  // Ask a new question
  const askQuestion = async () => {
    if (!question.trim()) return;
    setAnswerLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/chat/query", {
        question,
        user_id: userName,
      });
      console.log("userid:",userName);
      const newTurn = { question, answer: response.data.answer };
      setChatHistory((prev) => [...prev, newTurn]);
      setQuestion("");
    } catch (err) {
      console.error(err);
    } finally {
      setAnswerLoading(false);
    }
  };

  return (
    <div style={{ padding: "80px 20px 20px", maxWidth: "600px", margin: "auto" }}>
      <NavBar items={[["/deleteaccount", "Delete Account"],["/history","Manage Chat History"]]} />
      <div>
      <h1>Counsel Chat</h1>
      <div className="chat-window" >
        {chatHistory.length === 0 && <p>No conversation yet.</p>}
        {chatHistory
          .filter(turn => turn.question || turn.answer) // only render non-empty turns
          .map((turn, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              {turn.question && <p><strong>You:</strong> {turn.question}</p>}
              {turn.answer && <p><strong>Assistant:</strong> {turn.answer}</p>}
            </div>
        ))}
      </div>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
        style={{ width: "80%", padding: "8px", borderRadius: "5px" }}
        onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        disabled={answerLoading}
      />
      <button
        onClick={askQuestion}
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
        disabled={answerLoading}
      >
        {answerLoading ? "Loading..." : "Ask"}
      </button>
    </div>
    </div>

  );
}

export default Chat;
