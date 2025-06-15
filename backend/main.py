from fastapi import FastAPI, HTTPException
from pydantic import ValidationError
from pathlib import Path

from models.profile_v2 import LearnerProfile

app = FastAPI()

PROFILE_PATH = Path("data/profile.json")

@app.post("/next-session")
async def next_session():
    """Return the next learning session based on the v2 learner profile."""
    try:
        profile = LearnerProfile.parse_file(PROFILE_PATH)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile file not found")
    except ValidationError:
        raise HTTPException(
            status_code=400,
            detail="Legacy profile no longer supported—run migration."
        )
    # For now simply echo the learner id; real logic omitted
    return {"learner_id": profile.learner_id}
