from fastapi import FastAPI
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import uuid
import time

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not set")

print(f'\ncwd: {os.getcwd()}\n')
# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path="db/chroma_db")

# Embedding function for semantic search
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)

# Collections
advice_collection = chroma_client.get_or_create_collection(
    name="advice_dataset",
    embedding_function=openai_ef
)

conversation_collection = chroma_client.get_or_create_collection(
    name="conversation_memory",
    embedding_function=openai_ef
)

# OpenAI client
client = OpenAI()

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class QueryRequest(BaseModel):
    question: str
    user_id: str  # required: must come from login




def get_conversation_history(user_id, top_k=20):
    print(f'\nuser_id: {user_id}\n')
    results = conversation_collection.get(where={"user_id": user_id})

    # Flatten results (Chroma returns [[...]])
    documents = results.get("documents", [[]])
    metadatas = results.get("metadatas", [[]])

   
        # Pair up documents and metadata
    entries = list(zip(documents, metadatas))

    # Sort by timestamp
    entries = sorted(entries, key=lambda x: x[1].get("timestamp", 0))

    # Take last top_k
    entries = entries[-top_k:]

    # Build conversation string
    conversation_text = ""
    for doc, meta in entries:
        conversation_text += f"Q: {doc}\nA: {meta.get('answer','')}\n"

    return conversation_text



# Endpoint for asking a question
@app.post("/query")
async def query_db(request: QueryRequest):
    user_id = request.user_id

    # Retrieve past conversation for this user
    conversation_text = get_conversation_history(user_id)

    # Retrieve top 3 relevant advice documents from dataset
    results = advice_collection.query(query_texts=[request.question], n_results=3)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    # Format retrieved advice documents
    context_pairs = []
    for doc, meta in zip(documents, metadatas):
        context_pairs.append(f"Context: {doc}\nResponse: {meta.get('response','')}")
    context_block = "\n\n".join(context_pairs)

    # Construct prompt including conversation history
    prompt = (
        f"Here are some relevant past context/response pairs:\n"
        f"{context_block}\n\n"
        f"Previous conversation for this user:\n{conversation_text}\n"
        f"Now, answer the following question using the style and knowledge from above:\n"
        f"{request.question}"
    )

    # Call OpenAI to generate answer
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers based on provided documents."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7,
    )

    answer_text = response.choices[0].message.content

    # Save this turn in conversation memory with timestamp
    conversation_collection.add(
        ids=[f"{user_id}_{uuid.uuid4()}"],
        documents=[request.question],
        metadatas=[{
            "answer": answer_text,
            "user_id": user_id,
            "timestamp": time.time()
        }]
    )

    return {"answer": answer_text}


from typing import List, Dict

@app.get("/history/{user_id}", response_model=List[Dict])
async def get_user_history(user_id: str, top_k: int = 50):
    """
    Retrieve stored questions and answers for a given user_id.
    Optional: limit number of turns returned with top_k.
    """
    results = conversation_collection.query(
        query_texts=[f"user:{user_id}"],
        n_results=top_k
    )
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    # Sort by timestamp
    entries = sorted(
        zip(documents, metadatas),
        key=lambda x: x[1].get("timestamp", 0)
    )

    # Format for output
    history = [
        {"question": doc, "answer": meta.get("answer", ""), "timestamp": meta.get("timestamp", 0)}
        for doc, meta in entries
    ]

    return history



#if __name__ == "__main__":
#    import uvicorn
#    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
