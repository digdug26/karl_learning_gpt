import os
from pinecone import Pinecone, ServerlessSpec

# Load from .env if not already loaded
from dotenv import load_dotenv
load_dotenv()

# Connect to Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create index if it doesn't exist
if "karl-profile" not in pc.list_indexes().names():
    pc.create_index(
        name="karl-profile",
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",  # or 'gcp' depending on what you chose
            region=os.getenv("PINECONE_ENVIRONMENT")  # e.g., "us-east-1"
        )
    )

# Connect to the index
index = pc.Index("karl-profile")

# Dummy test vector
index.upsert([
    ("test-id", [0.01] + [0.0] * 1023)
])

print(index.describe_index_stats())

