# Therapy Chatbot

A therapy-focused chatbot powered by **Retrieval-Augmented Generation (RAG)**, designed to provide supportive and context-aware conversations.

---

## 🚀 Features
- Retrieval-Augmented Generation for more accurate and relevant responses  
- Contextual memory using vector databases  
- Modern web frontend with a clean, interactive interface  

---

## 🖥️ Backend
The backend is built with:
- **Python** – Core application logic  
- **ChromaDB** – Vector database for storing and retrieving embeddings  
- **OpenAI API** – For embeddings and text generation  
- **FastAPI** –  API framework  

---

## 🌐 Frontend
The frontend is developed with:
- **React** – Modern UI framework for building interactive web applications  

---

## 📌 Project Structure
- `backend/` → API, database integration, and chatbot logic  
- `frontend/` → React app for user interaction  

---

## ⚡ Getting Started
### Prerequisites
- Python 3.12+  
- Node.js & npm  

### Setup
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-repo/therapy-chatbot.git
   cd therapy-chatbot

2. Set up the backend:
    ```cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload

3. Set up the frontend:
    ```cd frontend
    npm install
    npm start