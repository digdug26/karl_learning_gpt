from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class ModalityWeights(BaseModel):
    visual: int = 40
    audio: int = 35
    kinesthetic: int = 25

class LearnerSnapshot(BaseModel):
    timestamp: datetime
    wpm: Optional[int] = None
    mood_score: Optional[float] = None
    activity_id: str
    topic: Optional[str] = None
    reading_level: Optional[str] = "2nd_grade"

class Badge(BaseModel):
    id: str
    name: str
    description: str
    svg_data: str
    earned_date: datetime
    topic: str

class HackathonMetrics(BaseModel):
    completion_time: int = 0
    creativity_score: float = 0.0
    clarity_score: float = 0.0
    feasibility_score: float = 0.0
    iteration_count: int = 0
    topic: str = ""
    badge_awarded: str = ""
    one_pager_text: str = ""
    challenge_story: str = ""
    pitch_transcription: str = ""

class HackathonSession(BaseModel):
    session_id: str
    current_phase: int = 0
    topic: str = ""
    avatar: str = ""
    challenge_story: str = ""
    selected_challenge: str = ""
    brainstorm_notes: str = ""
    concept_data: Dict[str, str] = {}
    sketch_data: Dict = {}
    one_pager_text: str = ""
    pitch_audio_url: str = ""
    start_time: datetime
    metrics: HackathonMetrics = HackathonMetrics()
    completed: bool = False

class LearnerProfile(BaseModel):
    name: str = "Karl"
    grade: str = "3"
    location: str = "Phoenix, AZ"
    reading_band: str = "2nd Grade Proficient"
    current_wpm: int = 80
    math_targets: List[str] = Field(default_factory=lambda: [
        "retain multiplication facts",
        "elapsed-time problems"
    ])
    adhd: bool = True
    modality: ModalityWeights = ModalityWeights()
    motivation_token: str = "new_comic_issue"
    snapshots: List[LearnerSnapshot] = []
    preferred_topics: List[str] = []
    badges: List[Badge] = []
    hackathon_sessions: List[HackathonSession] = []
