from fastapi import FastAPI, UploadFile, File, Form
from uuid import uuid4

from utils import readaloud, mood
from pathlib import Path
import random

# Load fun facts data from the backend/data directory
DATA_DIR = Path(__file__).resolve().parent / "data"


def _random_line(path: Path) -> str:
    with open(path) as f:
        lines = [ln.strip() for ln in f if ln.strip()]
    return random.choice(lines) if lines else ""
from pydantic import BaseModel

from typing import Dict

from .models.profile_v2 import LearnerProfile
from .services.session_builder import build_session
from .services.badges import evaluate_badges
from .services.story_forge import (
    get_random_prompt,
    save_story,
    generate_image,
    add_story_badge,
)
from .services.journal import create_entry, add_reflection

app = FastAPI()


class SessionPayload(BaseModel):
    """Payload for requesting the next session."""
    profile: LearnerProfile


class EndPayload(BaseModel):
    """Payload for ending a session and reporting metrics."""
    profile: LearnerProfile
    session_metrics: Dict[str, int]


class StoryPayload(BaseModel):
    user_id: str
    prompt: str
    story_text: str


class FactsSummaryPayload(BaseModel):
    topic: str
    count: int


class BadgePayload(BaseModel):
    profile: LearnerProfile
    story_id: str
    img_url: str


class JournalEntryPayload(BaseModel):
    user_id: str
    entry: str


class ReflectionPayload(BaseModel):
    entry_id: str
    reflection: str


@app.post("/next-session")
async def next_session(payload: SessionPayload):
    """Return the next learning session based on the v2 learner profile."""
    return build_session(payload.profile)


@app.post("/api/end-session")
async def end_session(payload: EndPayload):
    """Finalize a session and evaluate badges earned."""
    earned = evaluate_badges(payload.profile, payload.session_metrics)
    return {"earned_badges": earned, "profile": payload.profile}


@app.get("/story-prompt")
async def story_prompt():
    """Return a random story prompt."""
    return {"prompt": get_random_prompt()}


@app.post("/submit-story")
async def submit_story(payload: StoryPayload):
    """Save a story and generate an illustration."""
    story = save_story(payload.user_id, payload.prompt, payload.story_text)
    img_url = generate_image(payload.prompt, payload.story_text, story["id"])
    return {"story_id": story["id"], "img_url": img_url}


@app.post("/add-story-badge")
async def add_story_badge_endpoint(payload: BadgePayload):
    """Copy image to badge collection and update profile."""
    badge = add_story_badge(payload.profile, payload.story_id, payload.img_url)
    return {"badge": badge, "profile": payload.profile}


@app.post("/journal-entry")
async def journal_entry(payload: JournalEntryPayload):
    """Create a new journal entry and return a reflection question."""
    entry, question, badge = create_entry(payload.user_id, payload.entry)
    resp = {"entry_id": entry["id"], "question": question}
    if badge:
        resp["badge"] = badge
    return resp


@app.post("/journal-reflection")
async def journal_reflection(payload: ReflectionPayload):
    """Attach a reflection answer to an entry."""
    entry = add_reflection(payload.entry_id, payload.reflection)
    return {"entry": entry}


# ---------------------------------------------------------------------------
# Fun Facts Endpoints
# ---------------------------------------------------------------------------

@app.get("/fun_facts_options")
async def fun_facts_options():
    """Return one random topic from each list."""
    options = {
        "history": _random_line(DATA_DIR / "HistoricalPeople.txt"),
        "science": _random_line(DATA_DIR / "HistoricalScience.txt"),
        "space": _random_line(DATA_DIR / "SpaceTopics.txt"),
        "animals": _random_line(DATA_DIR / "AnimalTopics.txt"),
    }
    return {"options": options}


@app.post("/fun_facts_summary")
async def fun_facts_summary(payload: FactsSummaryPayload):
    """Return a simple child-friendly summary for a topic."""
    summary = (
        f"You are an inspiring educator teaching a 9 year old all about {payload.topic}. "
        f"This is the {payload.count} time this topic has been introduced to the student so cater your "
        f"response and level of detail/depth to this. Provide a detailed summary about this topic that is both educational and interesting."
    )
    return {"summary": summary}


# ---------------------------------------------------------------------------
# Basic session management and scoring endpoints used by the front-end
# ---------------------------------------------------------------------------

@app.post("/start_session")
async def start_session():
    """Return a new session/thread identifier."""
    return {"thread_id": str(uuid4())}


@app.post("/submit_audio")
async def submit_audio(
    thread_id: str = Form(...),
    passage: str = Form(None),
    audio: UploadFile = File(...),
):
    """Score a read-aloud audio clip and return fluency metrics."""
    metrics = readaloud.score(audio, passage_id="p1")
    return {"status": "ok", **metrics}


@app.post("/submit_mood")
async def submit_mood(
    thread_id: str = Form(...),
    image: UploadFile = File(...),
):
    """Assess mood from an uploaded image and return the score."""
    mood_score = mood.assess_image(image)
    return {"mood_score": mood_score}


@app.get("/next_activity")
async def next_activity(thread_id: str):
    """Placeholder next activity endpoint."""
    return {"activity": "{}"}
