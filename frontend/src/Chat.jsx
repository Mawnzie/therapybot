import { useState, useEffect } from "react";
import axios from "axios";

function Chat() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // full conversation
  const [answerLoading, setAnswerLoading] = useState(false);
  const [userName, setUserName] = useState('');

  // On component mount, check localStorage for userId
  useEffect(() => {
    let storedUserName = localStorage.getItem("username");
    
    setUserName(storedUserName);

    // Optionally, fetch past conversation for this user
    fetchHistory(storedUserName);
  }, []);

  // Fetch past conversation from backend
  const fetchHistory = async (uid) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/chat/history/${uid}`);
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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Chat with Advice Assistant</h1>

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
        }}
        disabled={answerLoading}
      >
        {answerLoading ? "Loading..." : "Ask"}
      </button>
    </div>
  );
}

export default Chat;
