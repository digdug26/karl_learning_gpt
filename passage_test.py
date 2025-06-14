# tools/validate_passages.py
import json, textwrap, pathlib
data = json.load(open("passages.json"))
for p in data:
    words = len(p["text"].split())
    assert 40 <= words <= 60, f"{p['id']} is {words} words."
print("✅ All passages within 40-60 words.")