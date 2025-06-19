import json
import random
import uuid
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
JOURNAL_FILE = DATA_DIR / "journal_entries.json"
BADGES_FILE = DATA_DIR / "journal_badges.json"

REFLECTION_QUESTIONS = [
    "What part of today made you feel proud?",
    "What is something new you learned today?",
    "Describe a challenge you faced today and how you handled it.",
    "What made you smile today?",
    "If you could change one thing about today, what would it be?",
]


def _load_entries():
    if JOURNAL_FILE.exists():
        with open(JOURNAL_FILE) as f:
            return json.load(f)
    return []


def _save_entries(entries):
    with open(JOURNAL_FILE, "w") as f:
        json.dump(entries, f, indent=2)


def _load_badges():
    if BADGES_FILE.exists():
        with open(BADGES_FILE) as f:
            return json.load(f)
    return {}


def _save_badges(badges):
    with open(BADGES_FILE, "w") as f:
        json.dump(badges, f, indent=2)


def create_entry(user_id: str, entry: str):
    """Save a journal entry and return the entry and reflection question."""
    entries = _load_entries()
    entry_id = str(uuid.uuid4())
    rec = {
        "id": entry_id,
        "user_id": user_id,
        "date": datetime.utcnow().isoformat(),
        "entry": entry,
        "reflection": "",
    }
    entries.append(rec)
    _save_entries(entries)

    # Calculate badge progress
    user_entries = [e for e in entries if e["user_id"] == user_id]
    count = len(user_entries)
    badges = _load_badges()
    user_badges = badges.get(user_id, [])
    new_badge = None
    if count % 5 == 0:
        new_badge = {
            "type": "journal_streak",
            "streak": count,
            "unlocked_at": datetime.utcnow().isoformat(),
        }
        user_badges.append(new_badge)
    badges[user_id] = user_badges
    _save_badges(badges)

    question = random.choice(REFLECTION_QUESTIONS)
    return rec, question, new_badge


def add_reflection(entry_id: str, reflection: str):
    """Add an optional reflection answer to an existing entry."""
    entries = _load_entries()
    for entry in entries:
        if entry["id"] == entry_id:
            entry["reflection"] = reflection
            _save_entries(entries)
            return entry
    raise ValueError("entry not found")
