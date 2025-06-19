import json
import random
import uuid
from datetime import datetime
from pathlib import Path
import shutil

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
STORIES_FILE = DATA_DIR / "stories.json"
IMAGES_DIR = DATA_DIR / "images"
BADGES_DIR = DATA_DIR / "badges" / "story_illustrations"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
BADGES_DIR.mkdir(parents=True, exist_ok=True)

# Simple prompt list for demonstration
PROMPTS = [
    "A penguin discovers a glowing compass in an ice cave...",
    "A robot finds an ancient map under the desert sands...",
    "An explorer stumbles upon a talking tree in the jungle...",
]


def _load_stories():
    if STORIES_FILE.exists():
        with open(STORIES_FILE) as f:
            return json.load(f)
    return []


def _save_stories(stories):
    with open(STORIES_FILE, "w") as f:
        json.dump(stories, f, indent=2)


def get_random_prompt() -> str:
    """Return a random story prompt."""
    return random.choice(PROMPTS)


def save_story(user_id: str, prompt: str, story_text: str) -> dict:
    """Persist a new story entry and return it."""
    stories = _load_stories()
    story_id = str(uuid.uuid4())
    story = {
        "id": story_id,
        "user_id": user_id,
        "date": datetime.utcnow().isoformat(),
        "prompt": prompt,
        "story_text": story_text,
    }
    stories.append(story)
    _save_stories(stories)
    return story


def generate_image(prompt: str, story_text: str, story_id: str) -> str:
    """Stubbed image generation that copies a placeholder svg."""
    placeholder = Path(__file__).resolve().parents[2] / "frontend" / "src" / "assets" / "react.svg"
    dest = IMAGES_DIR / f"{story_id}.svg"
    shutil.copy(placeholder, dest)
    return str(dest)


def add_story_badge(profile, story_id: str, img_url: str) -> dict:
    """Add a badge entry and copy the image under badges directory."""
    dest = BADGES_DIR / Path(img_url).name
    shutil.copy(img_url, dest)
    badge = {"type": "story_illustration", "story_id": story_id, "img_url": str(dest)}
    history = getattr(profile, "history", None)
    if history is not None:
        if not hasattr(history, "story_badges"):
            history.story_badges = []
        history.story_badges.append(badge)
    return badge
