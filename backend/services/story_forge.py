import json
import random
import uuid
from datetime import datetime
import os
from pathlib import Path
import shutil
from io import BytesIO

from urllib.request import urlopen
from PIL import Image
from openai import OpenAI

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
STORIES_FILE = DATA_DIR / "stories.json"
IMAGES_DIR = DATA_DIR / "images"
BADGES_DIR = DATA_DIR / "badges" / "story_illustrations"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
BADGES_DIR.mkdir(parents=True, exist_ok=True)

# Initialize OpenAI client if key is available
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

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
    """Create an illustration using OpenAI. Falls back to a blank image."""
    dest = IMAGES_DIR / f"{story_id}.jpeg"
    try:
        full_prompt = f"Illustration for this story: {story_text}"
        if client:
            resp = client.images.generate(model="dall-e-3", prompt=full_prompt, n=1, size="1024x1024")
            url = resp.data[0].url
            img_bytes = urlopen(url).read()
            img = Image.open(BytesIO(img_bytes))
            img.convert("RGB").save(dest, format="JPEG")
        else:
            raise RuntimeError("openai api_key missing")
    except Exception:
        # Offline or API failure - create simple placeholder
        Image.new("RGB", (512, 512), color="white").save(dest, format="JPEG")
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
