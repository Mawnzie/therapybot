import json
import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv

print(f'\ncwd: {os.getcwd()}\n')
# Load env vars
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

path = os.getcwd() + "/backend/db/chroma_db"
# Create Chroma client
chroma_client = chromadb.PersistentClient(path=path)

# Set up OpenAI embeddings
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="advice_dataset",
    embedding_function=openai_ef
)

# Load JSONL file
file_path = os.getcwd() + "/backend/db/combined_dataset.json"
ids = []
documents = []
metadatas = []



with open(file_path, "r", encoding="utf-8") as f:
    for idx,line in enumerate(f):
        if not line.strip():
            continue
        
        record = json.loads(line)

        question_text = record["Context"] #Context is the name for the question in the dictionary.
        response_text = record["Response"]

        ids.append(f"doc_{idx}")
        documents.append(question_text)
        metadatas.append({"response": response_text})




"""
The number of entries in documnets is too large to be added to the collection in one go.
(At least with "text-embedding-3-small" as embedding model.). 
"""
batch_size = 200
for i in range(0, len(documents), batch_size):
    _ = collection.add(
        ids=ids[i:i+batch_size],
        documents=documents[i:i+batch_size],
        metadatas=metadatas[i:i+batch_size]
    )
    print(f'Added batch {i} to collection')

print(f'\nAdded {len(documents)} entries to collection')