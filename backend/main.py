from fastapi import FastAPI
from pydantic import BaseModel

from models.profile_v2 import LearnerProfile
from services.session_builder import build_session

app = FastAPI()


class SessionPayload(BaseModel):
    """Payload for requesting the next session."""
    profile: LearnerProfile


@app.post("/next-session")
async def next_session(payload: SessionPayload):
    """Return the next learning session based on the v2 learner profile."""
    return build_session(payload.profile)
