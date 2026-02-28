import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

print(f"URL: {url}")
print(f"Key starts with: {key[:10]}...")

try:
    supabase: Client = create_client(url, key)
    # Try to fetch something small
    res = supabase.table("simulations").select("*").limit(1).execute()
    print("Successfully connected to Supabase!")
    print(f"Data count: {len(res.data)}")
except Exception as e:
    print(f"Failed to connect to Supabase: {e}")
