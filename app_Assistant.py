import os
import json
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form
from dotenv import load_dotenv

import openai

from learner_profile import LearnerProfile, LearnerSnapshot
from utils import readaloud, mood

# Load environment variables
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# In-memory learner profile
profile = LearnerProfile()

# Load the prompt template and inject only the {profile} token
from pathlib import Path
PROMPT_PATH = Path(__file__).with_name("prompts.py")
raw_prompts = PROMPT_PATH.read_text(encoding="utf-8")
filled_prompts = raw_prompts.replace(
    "{profile}",
    json.dumps(profile.model_dump())
)

assistant_id = client.beta.assistants.create(
    name="Karl-Learning-GPT",
    model="gpt-4o-mini",
    tools=[{"type": "code_interpreter"}],
    instructions=filled_prompts
).id


@app.post("/start_session")
async def start_session():
    # The ``threads.create`` method only creates a new thread and doesn't
    # accept an ``assistant_id`` parameter. The assistant is associated when
    # running the thread, so we simply call the method without arguments.
    thread = client.beta.threads.create()
    return {"thread_id": thread.id}

@app.post("/submit_audio")
async def submit_audio(
    thread_id: str = Form(...),
    audio: UploadFile = File(...)
):
    # Score the read-aloud
    metrics = readaloud.score(audio, passage_id="p1")
    wpm = metrics["words_per_minute"]
    errors = metrics["words_total"] - metrics["words_correct"]

    # Record snapshot
    profile.snapshots.append(
        LearnerSnapshot(
            timestamp=datetime.utcnow(),
            wpm=wpm,
            activity_id="read_snippet"
        )
    )

    # Send result into the GPT thread
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=f"Here is Karl's read-aloud result: {wpm} WPM, {errors} mistakes."
    )

    return {"status": "ok", **metrics}

@app.post("/submit_mood")
async def submit_mood(
    thread_id: str = Form(...),
    image: UploadFile = File(...)
):
    # Assess mood (stub returns a float score)
    mood_score = mood.assess_image(image)

    # Record snapshot
    profile.snapshots.append(
        LearnerSnapshot(
            timestamp=datetime.utcnow(),
            mood_score=mood_score,
            activity_id="face_snapshot"
        )
    )

    return {"mood_score": mood_score}

@app.get("/next_activity")
async def next_activity(thread_id: str):
    # Drive the Assistant forward
    client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=assistant_id
    )

    # Grab the latest message
    messages = client.beta.threads.messages.list(thread_id=thread_id).data
    reply = messages[-1].content

    return {"activity": reply}
