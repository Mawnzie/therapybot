import time
import uuid
from app.db.chroma_client import advice_collection, conversation_collection
from app.core.open_ai_client import client
from typing import List, Dict

from app.db.schemas import ConversationItem


def handle_query(user_id: str, question: str, top_k: int = 2) -> str:
    # Get conversation history (k latest context-response pairs)
    history = get_conversation_history(user_id)[:top_k]
    conversation_text = ""

    for x in history:
        conversation_text += f"\nContext: {x.get("Context")}\nResponse: {x.get("Response")}\n"


    # Retrieve relevant advice documents
    results = advice_collection.query(query_texts=[question], n_results=3)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    # Format retrieved advice
    context_pairs = [
        f"Context: {doc}\nResponse: {meta.get('response','')}"
        for doc, meta in zip(documents, metadatas)
    ]
    context_block = "\n\n".join(context_pairs)

    # Construct prompt
    prompt = (
        f"Here are some relevant past context/response pairs:\n"
        f"{context_block}\n\n"
        f"Previous conversation for this user:\n{conversation_text}\n"
        f"Now, answer the following question using the style and knowledge from above:\n"
        f"{question}"
    )

    # Call OpenAI
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

    # Save this turn
    conversation_collection.add(
        ids=[f"{user_id}_{uuid.uuid4()}"],
        documents=[question],
        metadatas=[{
            "answer": answer_text,
            "user_id": user_id,
            "timestamp": time.time()
        }]
    )

    return answer_text



def get_conversation_history(user_id: str) ->List[Dict[str, str]]:
    results = conversation_collection.get(where={"user_id": user_id})
    

    # Flatten results (Chroma returns [[...]])
    documents = results.get("documents", [[]])
    metadatas = results.get("metadatas", [[]])
    if not documents or not metadatas:
        return []  # <-- empty list if nothing found

    # Pair up documents and metadata
    entries = list(zip(documents, metadatas))

    # Sort by timestamp
    entries = sorted(entries, key=lambda x: x[1].get("timestamp", 0), reverse=True)

    
    # Build conversation string
    conversation_text = []
    for doc, meta in entries:
        conversation_text.append({"Context": doc, "Response": meta.get('answer','')})
    
    """
    conversation_text: List[ConversationItem] = []
    for doc, meta in entries:
        
        conversation_text.append(
            ConversationItem(
                Context=str(doc),  # ensure it's a string
                Response=str(meta.get("answer", ""))  # ensure it's a string
            )
        )
    """
        


    return conversation_text
