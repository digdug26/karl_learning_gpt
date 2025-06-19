from fastapi import FastAPI
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
