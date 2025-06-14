# utils/readaloud.py

import os
import json
import difflib
import shutil
from datetime import datetime
from tempfile import NamedTemporaryFile

from openai import OpenAI
from dotenv import load_dotenv

# 1. Load your .env and set OpenAI key
load_dotenv()
client = OpenAI()        # will read OPENAI_API_KEY from env

# 2. Load the passage bank
with open("passages.json", "r", encoding="utf-8") as f:
    target = passage_text

def score(uploaded_file, passage_text: str):
    """
    :param uploaded_file: FastAPI UploadFile for the recorded audio
    :param passage_id:   The ID of the passage to score against
    :returns: dict with transcription, WPM, and accuracy metrics
    """
    # --- Save to a temp file ---
    tmp = NamedTemporaryFile(delete=False, suffix=".webm")
    try:
        uploaded_file.file.seek(0)
        shutil.copyfileobj(uploaded_file.file, tmp)
        tmp.flush()
        # --- Transcribe & time it via the v1 API ---
        start = datetime.utcnow()
        with open(tmp.name, "rb") as audio_fp:
            resp = client.audio.transcriptions.create(
                file=audio_fp,
                model="whisper-1"
            )
        transcription = resp.text.strip()

        duration = (datetime.utcnow() - start).total_seconds()  # seconds

        # --- Compute words-per-minute ---
        words = transcription.split()
        wpm = int((len(words) / duration) * 60) if duration > 0 else 0

        # --- Compare to target passage ---
        target = passage_text
        target_words = target.split()
        # Count exact matches in position
        correct = sum(
            1 for t, s in zip(target_words, words)
            if t.lower() == s.lower()
        )
        total = len(target_words)
        accuracy = round(correct / total, 2) if total > 0 else 0.0

        return {
            "transcription": transcription,
            "words_per_minute": wpm,
            "words_correct": correct,
            "words_total": total,
            "accuracy": accuracy
        }

    finally:
        tmp.close()
        os.unlink(tmp.name)
