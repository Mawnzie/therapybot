import chromadb
from chromadb.utils import embedding_functions
from app.core.config import OPENAI_API_KEY
import os


chroma_client = chromadb.PersistentClient(path="app/db/chroma_db")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-small"
)

advice_collection = chroma_client.get_or_create_collection(
    name="advice_dataset", embedding_function=openai_ef
)

conversation_collection = chroma_client.get_or_create_collection(
    name="conversation_memory", embedding_function=openai_ef
)

question_collection = chroma_client.get_or_create_collection(
    name="conversation_memory", embedding_function=openai_ef
)