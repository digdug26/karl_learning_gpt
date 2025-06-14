from pinecone import Pinecone, ServerlessSpec
pc = Pinecone(api_key="pcsk_5jA1sz_L7yS6AAcmeiEpAYCtRumXoj3o3PuoWZ5AnnuQQjo2pbzBuNi3RTYTabKaCEgx1t")

index_name = "quickstart"

pc.create_index(
    name=karl-profile,
    dimension=1536, # Replace with your model dimensions
    metric="cosine", # Replace with your model metric
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    ) 
)