import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import NavBar from'../components/Navbar';
import { lighten, modularScale } from 'polished'
import Layout from '../components/Layout/Layout';

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

  useEffect(() => {
    const storedHistory = sessionStorage.getItem("chatHistory");
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
      sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }, [chatHistory]);


  // Ask a new question
  const askQuestion = async () => {
    if (!question.trim()) return;
    setAnswerLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/chat/query", {
        question,
        user_id: userName,
      });

      const newTurn = { Context: question, Response: response.data.answer };

      setChatHistory((prev) => [ newTurn, ...prev]);
      setQuestion("");
    } catch (err) {
      console.error(err);
    } finally {
      setAnswerLoading(false);
    }
  };

  return (
    <Layout>
    <div className="chat-wrapper">
      <NavBar items={[["/deleteaccount", "Delete Account"],["/history","Manage Chat History"]]} />
      <h1>Counsel Chat</h1>
      <div className="chat-window" >
        {chatHistory.length === 0 && <p>No conversation yet.</p>}
        {chatHistory
          .filter(turn => turn.Context || turn.Response) // only render non-empty turns
          .map((turn, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              {turn.Context && <p><strong>You:</strong> {turn.Context}</p>}
              {turn.Response && <p><strong>Assistant:</strong> {turn.Response}</p>}
            </div>
        ))}
      </div>
      <div className="button-row">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
        onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        disabled={answerLoading}
      />
      <button
        onClick={askQuestion}
        disabled={answerLoading}
      >
        {answerLoading ? "Loading..." : "Ask"}
      </button>
    </div>
    </div>
    </Layout>
  );
}

export default Chat;

