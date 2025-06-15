from datetime import datetime, timezone
from ..models.profile_v2 import LearnerProfile
from typing import Dict


def build_session(profile: LearnerProfile) -> Dict:
    """Return the next learning session plan for a learner profile."""
    # 1 Intro (3 min)
    intro = f"\U0001F30C Hey {profile.demographics.age}-year-old Space Penguin Cadet! ..."

    # 2 Reading (10 min)
    reading_text = "Paragraph at current_level \u00B1 1 ..."
    reading_questions = [
        {"q": "What does 'astronomical' mean?", "options": ["huge", "tiny", "old"], "answer": 0},
        {"q": "Who is the main character?", "options": ["the penguin", "the robot", "the whale"], "answer": 0},
        {"q": "Where does the story take place?", "options": ["space", "jungle", "desert"], "answer": 0},
        {"q": "What is the penguin looking for?", "options": ["ice", "fish", "stars"], "answer": 2},
        {"q": "Why is teamwork important?", "options": ["to be fast", "to share ideas", "to sleep"], "answer": 1},
    ]

    # 3 Math Quest (10 min)
    math_quest = {
        "story": "A polar-bear trap has 3 switches...",
        "steps": ["draw model", "solve multi-step equation"],
        "check": 42,
    }

    # 4 Typing (5 min)
    typing_text = "A quick brown penguin jumps..."

    # 5 Comic wrap (5 min)
    comic_prompt = "Draw the next scene where the penguin..."

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "intro": intro,
        "reading_text": reading_text,
        "reading_questions": reading_questions,
        "math_quest": math_quest,
        "typing_text": typing_text,
        "comic_prompt": comic_prompt,
    }
