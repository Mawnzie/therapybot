from fastapi import APIRouter, Depends, HTTPException
from app.db.schemas import QueryRequest, ConversationItem
from app.db.chroma_client import advice_collection
from app.db.chroma_client import conversation_collection
from app.core.open_ai_client import client
import time
import uuid


router = APIRouter()

from fastapi import APIRouter
from typing import List, Dict
from app.services.chat_services import handle_query, get_conversation_history
from app.api.auth import get_current_user, authenticate_user, get_db, Session
from app.db.schemas import HistoryRequest

router = APIRouter()


@router.post("/query")
def query_db(request: QueryRequest):
    answer_text = handle_query(request.user_id, request.question)
    return {"answer": answer_text}


@router.get("/history/{user_id}")
def fetch_history(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["username"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this history")
    
    result = get_conversation_history(user_id)
    return result

@router.post("/history_with_password")
def fetch_history_with_password(req: HistoryRequest, db: Session = Depends(get_db)):
    # Authenticate the user with username and password
    user = authenticate_user(req.user_id, req.password, db)
    if not user:
        raise HTTPException(status_code=403, detail="Incorrect username or password")

    # Fetch conversation history
    result = get_conversation_history(req.user_id)
    return result



@router.get("/users")
def fetch_users():
    # Get all metadata (you may want to limit the number of documents if large)
    all_metadatas = conversation_collection.get(include=["metadatas"])["metadatas"]
    users = []
    for entry in all_metadatas:
        users.append(entry['user_id'])


    return set(users)

@router.delete("/users/{user_id_to_delete}")
def delete_user_history(user_id_to_delete: str):
    # Fetch all metadata along with document IDs
    results = conversation_collection.get(include=["metadatas"])
    all_metadatas = results["metadatas"]
    all_ids = results["ids"]   # still available, even if not in include

    # Collect IDs of documents that belong to the user
    ids_to_delete = [
        doc_id 
        for doc_id, meta in zip(all_ids, all_metadatas)
        if meta.get("user_id") == user_id_to_delete
    ]

    if ids_to_delete:
        # Delete documents by ID
        conversation_collection.delete(ids=ids_to_delete)
        print(f"Deleted {len(ids_to_delete)} documents for user {user_id_to_delete}.")
    else:
        print(f"No documents found for user {user_id_to_delete}.")
