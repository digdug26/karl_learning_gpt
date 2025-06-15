from typing import Dict
from fastapi import UploadFile


def score(audio: UploadFile, passage_id: str = "p1") -> Dict:
    """Placeholder read-aloud scorer used during tests.

    This simple implementation does not perform real transcription. It
    returns zeroed metrics so the rest of the application can run without
    the optional OpenAI dependency.
    """
    return {
        "transcription": "",
        "words_per_minute": 0,
        "words_correct": 0,
        "words_total": 0,
        "accuracy": 0.0,
        "similarity_score": 0.0,
        "reading_duration": 0.0,
    }
