import os
import json
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form

from openai import OpenAI
load_dotenv()
client = OpenAI()

from learner_profile import LearnerProfile, LearnerSnapshot
from utils import readaloud, mood, comic

# Load environment variables
app = FastAPI()

# In-memory learner profile
profile = LearnerProfile()

# Load the prompt template and inject only the {profile} token
raw_prompts = open("prompts.py", "r", encoding="utf-8").read()
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
    thread = client.beta.threads.create()
    return {"thread_id": thread.id}

@app.post("/submit_audio")
async def submit_audio(
    thread_id: str = Form(...),
    passage: str = Form(...),  
    audio: UploadFile = File(...)
):
    # Score the read-aloud
    metrics = readaloud.score(audio, passage_text=passage)
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
    # Kick off a Run, telling it *which* assistant to use
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    # Fetch the latest message
    messages = client.beta.threads.messages.list(thread_id=thread_id).data
    raw_text = messages[-1].content[0].text.value
    print("RAW_TEXT ===>", raw_text)   # just before return {"activity": raw_text}
    clean = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return {"activity": clean}


