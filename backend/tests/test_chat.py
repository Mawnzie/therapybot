from fastapi.testclient import TestClient
import chromadb
import uuid
import time
import pytest
import sys, os


sys.path.append(os.path.dirname(os.path.dirname(__file__)))  # add backend/

from app.main import app
from app.db.database import Base, engine, SessionLocal
from app.db.chroma_client import conversation_collection


from app.db.database import Base, engine


"""
Tests registering and authenticating a user in the conversation collection, and checking that 
the retrieved userhistory is the last two Context-Response pairs that were added.
"""

def test_login_and_fetch_history():
    client = TestClient(app)

    username = "testuser"
    password = "testpassword"
    conversation_collection.delete(where={"user_id": username })


    # 1️⃣ Register user
    response = client.post("/auth/register", json={"username": username, "password": password})
    assert response.status_code in (200, 201), response.text

    # 2️⃣ Log in
    response = client.post("/auth/token", data={"username": username, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]

    # 3️⃣ Insert fake data into *patched* test_collection
    test_data = [("q1", "a1"), ("q2", "a2"), ("q3", "a3")]
    for q, a in test_data:
        conversation_collection.add(
            ids=[f"{username}_{uuid.uuid4()}"],
            documents=[q],
            metadatas=[{
                "answer": a,
                "user_id": username,
                "timestamp": time.time()
            }]
        )

    results = conversation_collection.get(where={"user_id": username})
    print(f"\nChroma results: {results}\n")
    # 4️⃣ Fetch history
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/chat/history/{username}", headers=headers)
    assert response.status_code == 200, response.text
    history = response.json()
    

    # 5️⃣ Assert last 2 entries
    assert len(history) >= 2
    latest_two = history[:2]


    assert latest_two[0]["Response"] == "a3"
    assert latest_two[1]["Response"] == "a2"

    conversation_collection.delete(where={"user_id": username })



