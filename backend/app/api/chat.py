from fastapi import APIRouter
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

router = APIRouter()




@router.post("/query")
async def query_db(request: QueryRequest):
    answer_text = handle_query(request.user_id, request.question)
    return {"answer": answer_text}



@router.get("/history/{user_id}")
async def fetch_history(user_id: str):
    #results = conversation_collection.get(where={"user_id": user_id})

    result = get_conversation_history(user_id)
    #print("RETURNING:", result)  # 👈 log it
    return result


