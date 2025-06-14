import os
from dotenv import load_dotenv
from pinecone import Pinecone
from utils.embed_profile import embed_text

load_dotenv()
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("karl-profile")

# Karl's profile text
karl_profile_text = """
Name: Karl
Age: 8 (entering 3rd grade)
Location: Phoenix, AZ
Reading Level: 550–600 Lexile (based on SRA 3rd grade work)
Favorite Books: Calvin and Hobbes, Dog Man, Investigators, Captain Underpants
Creative Output: Draws 10–15 comics a week, often based on what he reads or life events
Learning Style: Strong preference for visual and auditory content, loves listening to stories
Challenges: ADHD, quick to self-criticize, needs movement breaks and encouragement
Motivators: New comic books, personal humor, creativity
Environment: Montessori school with consistent teacher for 3 years
Current Goals: Improve reading aloud fluency, retain math facts, develop multi-paragraph writing
"""

embedding = embed_text(karl_profile_text)

index.upsert([
    ("karl-profile-main", embedding, {"text": karl_profile_text})
])

print("✅ Profile stored in Pinecone.")
