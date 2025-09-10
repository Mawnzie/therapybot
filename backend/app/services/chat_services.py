import time
import uuid
from app.db.chroma_client import advice_collection, conversation_collection, question_collection
from app.core.open_ai_client import client
from typing import List, Dict
import numpy as np
from app.db.schemas import ConversationItem


def handle_query(user_id: str, question: str, top_k: int = 10) -> str:
    # Get conversation history (k latest context-response pairs)
    history = get_conversation_history(user_id)[:top_k]
    conversation_text = ""

    for x in history:
        conversation_text += f"\nContext: {x.get("Context")}\nResponse: {x.get("Response")}\n"

    # Retrieve relevant advice documents
    results = advice_collection.query(query_texts=[question], n_results=3)

    #Find the distance of the best match among the results
    min_distance = min(results['distances'][0])

    #If there is at least one match which is a "pretty good" match (<0.9) use the results to answer the questions
    if min_distance <0.9: 
        print(f"\nmin distance:{min_distance}\n")

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
                {"role": "system", "content": "You are a therapy counselor that interacts with the user based on provided documents."},
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
    #otherwise ask clarifying questions
    else:
        print(f"\nmin distance: {min_distance}\n")

        results = question_collection.query(query_texts=[question], n_results=3)

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
            f"Here are some relevant follow-up questions (context/response pairs) to ask the user:\n"
            f"{context_block}\n\n"
            f"Previous conversation for this user:\n{conversation_text}\n"
            f"Now, ask the user to clarify the question given the context and knowledge from above:\n"
            f"{question}"
        )

        # Call OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a therapy counselor that interacts with the user based on provided documents."},
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


    return conversation_text


# import time
# import uuid
# from app.db.chroma_client import advice_collection, conversation_collection
# from app.core.open_ai_client import client
# from typing import List, Dict
# import numpy as np
# from app.db.schemas import ConversationItem


# def handle_query(user_id: str, question: str, top_k: int = 2) -> str:
#     # Get conversation history (k latest context-response pairs)
#     history = get_conversation_history(user_id)[:top_k]
#     conversation_text = ""

#     for x in history:
#         conversation_text += f"\nContext: {x.get("Context")}\nResponse: {x.get("Response")}\n"

#     # Retrieve relevant advice documents
#     results = advice_collection.query(query_texts=[question], n_results=3)
#     documents = results.get("documents", [[]])[0]
#     metadatas = results.get("metadatas", [[]])[0]

#     # Format retrieved advice
#     context_pairs = [
#         f"Context: {doc}\nResponse: {meta.get('response','')}"
#         for doc, meta in zip(documents, metadatas)
#     ]
#     context_block = "\n\n".join(context_pairs)

#     # Construct prompt
#     prompt = (
#         f"Here are some relevant past context/response pairs:\n"
#         f"{context_block}\n\n"
#         f"Previous conversation for this user:\n{conversation_text}\n"
#         f"Now, answer the following question using the style and knowledge from above:\n"
#         f"{question}"
#     )

#     # Call OpenAI
#     response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[
#             {"role": "system", "content": "You are a helpful assistant that answers based on provided documents."},
#             {"role": "user", "content": prompt}
#         ],
#         max_tokens=300,
#         temperature=0.7,
#     )
#     answer_text = response.choices[0].message.content

#     # Save this turn
#     conversation_collection.add(
#         ids=[f"{user_id}_{uuid.uuid4()}"],
#         documents=[question],
#         metadatas=[{
#             "answer": answer_text,
#             "user_id": user_id,
#             "timestamp": time.time()
#         }]
#     )

#     return answer_text



# def get_conversation_history(user_id: str) ->List[Dict[str, str]]:
#     results = conversation_collection.get(where={"user_id": user_id})
    

#     # Flatten results (Chroma returns [[...]])
#     documents = results.get("documents", [[]])
#     metadatas = results.get("metadatas", [[]])
#     if not documents or not metadatas:
#         return []  # <-- empty list if nothing found

#     # Pair up documents and metadata
#     entries = list(zip(documents, metadatas))

#     # Sort by timestamp
#     entries = sorted(entries, key=lambda x: x[1].get("timestamp", 0), reverse=True)

    
#     # Build conversation string
#     conversation_text = []
#     for doc, meta in entries:
#         conversation_text.append({"Context": doc, "Response": meta.get('answer','')})    


#     return conversation_text
