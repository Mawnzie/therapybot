import json
import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv

print(f'\ncwd: {os.getcwd()}\n')
# Load env vars
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

path = os.getcwd() + "/db/chroma_db"
# Create Chroma client
chroma_client = chromadb.PersistentClient(path=path)

# Set up OpenAI embeddings
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="clarifying_questions_dataset",
    embedding_function=openai_ef
)

# Load JSONL file
file_path = os.getcwd() + "/db/clarifying_questions.json"
ids = []
documents = []
metadatas = []

print("file path:", file_path)
print(f"\n cwd: {os.getcwd()}\n")


with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)  # loads the whole list at once

ids, documents, metadatas = [], [], []

for idx, record in enumerate(data):
    question_text = record["Context"]
    response_text = record["Response"]

    ids.append(f"doc_{idx}")
    documents.append(question_text)
    metadatas.append({"response": response_text})

collection.add(ids=ids,documents=documents,metadatas=metadatas)


print(f'\nCollections in the db: {chroma_client.list_collections()}\n')
