import os
from dotenv import load_dotenv
from pinecone import Pinecone

# Load API key from .env
load_dotenv()
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Delete index if it exists
if "karl-profile" in pc.list_indexes().names():
    pc.delete_index("karl-profile")
    print("✅ Index 'karl-profile' deleted.")
else:
    print("⚠️ Index 'karl-profile' does not exist.")
