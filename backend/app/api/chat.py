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
from app.api.auth import get_current_user

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


