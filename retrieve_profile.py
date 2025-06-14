import os
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

# Load keys
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("karl-profile")
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Optional: Define a prompt (used as a "query vector" for similarity)
query_text = "Karl's updated learning goals and interests"

# Embed the query using OpenAI
embedding_response = openai.embeddings.create(
    model=os.getenv("EMBEDDING_MODEL"),
    input=query_text
)
query_vector = embedding_response.data[0].embedding

# Query Pinecone
results = index.query(
    vector=query_vector,
    top_k=1,
    include_metadata=False,
    include_values=False
)

match = results.matches[0]
print(f"✅ Most relevant profile vector ID: {match.id}")
