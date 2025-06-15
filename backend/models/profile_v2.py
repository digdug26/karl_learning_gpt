from pydantic import BaseModel, Field
from typing import List, Optional


class Demographics(BaseModel):
    age: int
    grade: int
    school_type: str


class Preferences(BaseModel):
    modalities: List[str]
    themes: List[str]
    team_style: str
    reward_mode: str


class Attention(BaseModel):
    focus_minutes: int
    session_max_minutes: int
    reset_strategy: str


class Reading(BaseModel):
    current_level: str
    avg_wpm: Optional[int] = None
    vocab_mastered: int
    comprehension_score: int


class Math(BaseModel):
    problem_solving_score: int
    fact_memorization_opt_out: bool = True


class Typing(BaseModel):
    keys_mastered_pct: int
    current_wpm: int


class History(BaseModel):
    sessions_completed: int
    badges: List[str]


class LearnerProfile(BaseModel):
    learner_id: str = Field(..., pattern=r"^[a-z0-9_]+$")
    demographics: Demographics
    preferences: Preferences
    attention: Attention
    reading: Reading
    math: Math
    typing: Typing
    history: History
