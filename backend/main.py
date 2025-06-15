from fastapi import FastAPI
from pydantic import BaseModel

from typing import Dict

from .models.profile_v2 import LearnerProfile
from .services.session_builder import build_session
from .services.badges import evaluate_badges

app = FastAPI()


class SessionPayload(BaseModel):
    """Payload for requesting the next session."""
    profile: LearnerProfile


class EndPayload(BaseModel):
    """Payload for ending a session and reporting metrics."""
    profile: LearnerProfile
    session_metrics: Dict[str, int]


@app.post("/next-session")
async def next_session(payload: SessionPayload):
    """Return the next learning session based on the v2 learner profile."""
    return build_session(payload.profile)


@app.post("/api/end-session")
async def end_session(payload: EndPayload):
    """Finalize a session and evaluate badges earned."""
    earned = evaluate_badges(payload.profile, payload.session_metrics)
    return {"earned_badges": earned, "profile": payload.profile}
