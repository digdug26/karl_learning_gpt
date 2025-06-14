from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class ModalityWeights(BaseModel):
    visual: int = 40
    audio: int = 35
    kinesthetic: int = 25

class LearnerSnapshot(BaseModel):
    timestamp: datetime
    wpm: int | None = None
    mood_score: float | None = None  # −1 = very frustrated, +1 = elated
    activity_id: str

class LearnerProfile(BaseModel):
    name: str = "Karl"
    grade: str = "3"
    location: str = "Phoenix, AZ"
    reading_band: str = "550–600 Lexile"  # inferred from 3rd-grade SRA work :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
    math_targets: List[str] = Field(
        default_factory=lambda: ["retain multiplication facts", "elapsed-time problems"]
    )
    adhd: bool = True  # 504 accommodations noted by teacher :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
    modality: ModalityWeights = ModalityWeights()
    motivation_token: str = "new_comic_issue"
    snapshots: List[LearnerSnapshot] = []
