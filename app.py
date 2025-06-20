#!/usr/bin/env python3
"""
Karl-Learning-GPT Consolidated Script - Seamless User Interface with Mini Hackathon
Provides a clean, automatic learning experience with no visible session management.
"""

import os
import json
import difflib
import shutil
import base64
import random
import uuid
from datetime import datetime, timezone
from tempfile import NamedTemporaryFile
from typing import List, Optional, Dict, Any


# Third-party imports
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from openai import OpenAI
from pinecone import Pinecone
import uvicorn
from utils import readaloud, mood

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Environment variables with defaults
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "tts-1")
OPENAI_STT_MODEL = os.getenv("OPENAI_STT_MODEL", "whisper-1")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east1")

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

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

class HackathonMetrics(BaseModel):
    completion_time: int = 0  # minutes
    creativity_score: float = 0.0
    clarity_score: float = 0.0
    feasibility_score: float = 0.0
    iteration_count: int = 0
    topic: str = ""
    badge_awarded: str = ""
    one_pager_text: str = ""
    challenge_story: str = ""
    pitch_transcription: str = ""

class Badge(BaseModel):
    id: str
    name: str
    description: str
    svg_data: str
    earned_date: datetime
    topic: str

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
    reading_band: str = "2nd Grade Proficient"  # Dynamic based on performance
    current_wpm: int = 80  # Average for 2nd grade
    math_targets: List[str] = Field(
        default_factory=lambda: ["retain multiplication facts", "elapsed-time problems"]
    )
    adhd: bool = True
    modality: ModalityWeights = ModalityWeights()
    motivation_token: str = "new_comic_issue"
    snapshots: List[LearnerSnapshot] = []
    preferred_topics: List[str] = []
    badges: List[Badge] = []
    hackathon_sessions: List[HackathonSession] = []

class SessionData(BaseModel):
    session_id: str
    thread_id: str
    start_time: datetime
    current_topic: str
    last_mood_check: datetime
    mood_check_count: int = 0
    reading_level: str = "2nd_grade"
    stories_completed: int = 0
    current_wpm: int = 80

# =============================================================================
# GLOBAL STATE
# =============================================================================

# Global session storage and user profile
active_sessions: Dict[str, SessionData] = {}
current_session_id: Optional[str] = None  # Track the active session
current_hackathon_session: Optional[str] = None  # Track active hackathon
hackathon_sessions: Dict[str, HackathonSession] = {}
profile = LearnerProfile()

# Learning topics pool
LEARNING_TOPICS = [
    "Space Exploration and Astronauts", "Ancient Rome and Gladiators", "Ocean Animals and Deep Sea",
    "Dinosaurs and Fossils", "Magic and Wizards", "Pirates and Treasure", "Robots and Future Tech",
    "Animals of the Amazon", "Egyptian Pyramids and Mummies", "Volcanoes and Earthquakes",
    "Knights and Castles", "Superheroes and Powers", "Train Adventures", "Weather and Storms",
    "Insects and Bugs", "Cooking and Food Science", "Sports and Athletics", "Art and Famous Artists",
    "Music and Instruments", "Plants and Gardens", "Cars and Racing", "Mountains and Hiking",
    "Nothing, my parents are making me do this", "Surprise me with something cool"
]

# Challenge cards for hackathon
CHALLENGE_CARDS = [
    {"title": "Food Waste Detective", "icon": "🍎", "description": "Help reduce food waste in schools and homes"},
    {"title": "Ocean Protector", "icon": "🌊", "description": "Clean up plastic pollution in our oceans"},
    {"title": "Energy Saver", "icon": "⚡", "description": "Help people use less electricity and save money"},
    {"title": "Wildlife Guardian", "icon": "🦋", "description": "Protect endangered animals and their homes"},
    {"title": "Air Quality Monitor", "icon": "🌬️", "description": "Track and improve the air we breathe"},
    {"title": "Water Conservation", "icon": "💧", "description": "Help communities save and protect clean water"},
    {"title": "Recycling Helper", "icon": "♻️", "description": "Make recycling easier and more fun"},
    {"title": "Community Garden", "icon": "🌱", "description": "Help people grow their own healthy food"},
]

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def embed_text(text: str) -> List[float]:
    """Create text embeddings using OpenAI's embedding model."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embedding

def get_random_topics() -> List[str]:
    """Get 4 random learning topics for user selection."""
    return random.sample(LEARNING_TOPICS, 4)

def assess_reading_level(wpm: int, accuracy: float) -> str:
    """Determine appropriate reading level based on performance."""
    if wpm >= 120 and accuracy >= 0.95:
        return "4th_grade"
    elif wpm >= 100 and accuracy >= 0.90:
        return "3rd_grade"
    elif wpm >= 80 and accuracy >= 0.85:
        return "2nd_grade"
    else:
        return "1st_grade"

def generate_challenge_story(topic: str, challenge: str) -> str:
    """Generate a challenge story using the template."""
    stakeholders = {
        "Food Waste Detective": "families and schools",
        "Ocean Protector": "marine life and coastal communities", 
        "Energy Saver": "families trying to save money",
        "Wildlife Guardian": "endangered animals",
        "Air Quality Monitor": "people with breathing problems",
        "Water Conservation": "communities facing drought",
        "Recycling Helper": "neighborhoods with too much trash",
        "Community Garden": "people wanting fresh, healthy food"
    }
    
    ai_powers = {
        "Food Waste Detective": "predict when food will expire and suggest recipes",
        "Ocean Protector": "identify plastic pollution and guide cleanup robots",
        "Energy Saver": "learn your habits and automatically save energy",
        "Wildlife Guardian": "track animal movements and protect their homes",
        "Air Quality Monitor": "detect pollution sources and warn people",
        "Water Conservation": "detect leaks and optimize water usage",
        "Recycling Helper": "identify what can be recycled and how",
        "Community Garden": "predict the best plants and growing conditions"
    }
    
    stakeholder = stakeholders.get(challenge, "people in our community")
    ai_power = ai_powers.get(challenge, "solve complex problems")
    
    prompt = f"""Create an engaging 2-sentence challenge story for kids using this template:

"While [something related to {topic}] happens in the world of {topic.lower()}, {stakeholder} struggle with [related problem].
Could an AI that can {ai_power} solve it?"

Make it exciting and age-appropriate for 9-10 year olds. Focus on how {topic} connects to the {challenge} challenge."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return f"While exploring {topic.lower()}, {stakeholder} struggle with important challenges. Could an AI that can {ai_power} help solve it?"

def generate_story_for_topic(topic: str, reading_level: str, current_wpm: int) -> dict:
    """Generate a custom story based on topic and reading level."""
    
    # Define reading level parameters 
    level_params = {
        "1st_grade": {"words": "30-40", "sentences": "3-4", "complexity": "very simple"},
        "2nd_grade": {"words": "40-60", "sentences": "4-6", "complexity": "simple"},
        "3rd_grade": {"words": "60-80", "sentences": "5-7", "complexity": "moderate"},
        "4th_grade": {"words": "80-100", "sentences": "6-8", "complexity": "challenging"}
    }
    
    params = level_params.get(reading_level, level_params["2nd_grade"])
    
    prompt = f"""Create a fun, engaging short story about {topic} for a {reading_level.replace('_', ' ')} reader.

Requirements:
- {params['words']} words total
- {params['sentences']} sentences
- Use {params['complexity']} vocabulary
- Make it exciting and age-appropriate
- Include action or adventure elements
- End with something interesting to discuss

Return ONLY the story text, no title or extra formatting."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        story_text = response.choices[0].message.content.strip()
        
        return {
            "id": f"story_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
            "title": f"{topic} Adventure",
            "topic": topic,
            "reading_level": reading_level,
            "text": story_text,
            "target_wpm": current_wpm + 5  # Slight challenge increase
        }
    except Exception:
        # Fallback story
        return {
            "id": "fallback_story",
            "title": "Adventure Story",
            "topic": topic,
            "reading_level": reading_level,
            "text": "There once was a brave explorer who discovered amazing things. They faced challenges with courage and learned something new every day. The adventure taught them that learning can be the greatest treasure of all.",
            "target_wpm": current_wpm
        }

def generate_badge_svg(challenge: str, topic: str) -> str:
    """Generate an SVG badge using GPT-4o."""
    prompt = f"""Create a simple, colorful SVG badge for a kid who completed the "{challenge}" mini-hackathon about {topic}.

Requirements:
- Round badge, 200x200 pixels
- Bright, kid-friendly colors
- Include relevant emoji or simple icon
- Badge name in readable font
- Clean, professional look suitable for kids

Return ONLY the SVG code, no explanations."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        svg_code = response.choices[0].message.content.strip()
        
        # Clean up the response to extract just the SVG
        if '<svg' in svg_code and '</svg>' in svg_code:
            start = svg_code.find('<svg')
            end = svg_code.find('</svg>') + 6
            return svg_code[start:end]
        else:
            # Fallback SVG
            return f'''<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" fill="#4CAF50" stroke="#333" stroke-width="3"/>
                <text x="100" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">{challenge}</text>
                <text x="100" y="130" text-anchor="middle" fill="white" font-family="Arial" font-size="24">🏆</text>
            </svg>'''
    except Exception:
        # Fallback SVG
        return f'''<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" fill="#4CAF50" stroke="#333" stroke-width="3"/>
            <text x="100" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">{challenge}</text>
            <text x="100" y="130" text-anchor="middle" fill="white" font-family="Arial" font-size="24">🏆</text>
        </svg>'''




#part 2
def score_reading(uploaded_file, passage_text: str) -> dict:
    """Score read-aloud performance using Whisper transcription."""
    target = passage_text.strip()
    
    tmp = NamedTemporaryFile(delete=False, suffix=".webm")
    try:
        uploaded_file.file.seek(0)
        shutil.copyfileobj(uploaded_file.file, tmp)
        tmp.flush()
        
        # Get audio file duration for accurate WPM calculation
        with open(tmp.name, "rb") as audio_fp:
            # Record start time for processing duration (not reading duration)
            process_start = datetime.now(timezone.utc)
            
            resp = client.audio.transcriptions.create(
                file=audio_fp,
                model=OPENAI_STT_MODEL,
                language="en",  # Specify English for better accuracy
                temperature=0.0  # More deterministic transcription
            )
            transcription = resp.text.strip()
            
            process_duration = (datetime.now(timezone.utc) - process_start).total_seconds()
            print(f"🕒 Processing took {process_duration:.2f}s")
        
        print(f"🎤 Transcription: '{transcription}'")
        print(f"🎯 Target text: '{target}'")
        
        # Calculate reading duration based on typical speaking pace
        # Average speaking pace is 125-150 WPM, we'll estimate based on word count
        target_words = target.split()
        transcribed_words = transcription.split()
        
        # Estimate reading duration (assume normal speaking pace of 120-140 WPM)
        estimated_duration = len(target_words) / 130 * 60  # 130 WPM average, convert to seconds
        
        # Use a minimum duration to prevent artificially high WPM
        min_duration = max(len(target_words) * 0.3, 5.0)  # At least 0.3 seconds per word, minimum 5 seconds
        reading_duration = max(estimated_duration, min_duration)
        
        print(f"📊 Estimated reading duration: {reading_duration:.1f} seconds")
        
        # Calculate WPM based on actual words read (transcribed words)
        wpm = int((len(transcribed_words) / reading_duration) * 60) if reading_duration > 0 else 0
        
        # Improved accuracy calculation using sequence matching
        target_words_lower = [word.lower().strip('.,!?;:"()') for word in target_words]
        transcribed_words_lower = [word.lower().strip('.,!?;:"()') for word in transcribed_words]
        
        # Use difflib for better word matching
        matcher = difflib.SequenceMatcher(None, target_words_lower, transcribed_words_lower)
        similarity = matcher.ratio()
        
        # Alternative accuracy: count exact word matches
        correct_words = 0
        min_length = min(len(target_words_lower), len(transcribed_words_lower))
        
        for i in range(min_length):
            if i < len(target_words_lower) and i < len(transcribed_words_lower):
                if target_words_lower[i] == transcribed_words_lower[i]:
                    correct_words += 1
        
        # Use the higher of the two accuracy measures
        position_accuracy = correct_words / len(target_words_lower) if target_words_lower else 0
        accuracy = max(similarity, position_accuracy)
        
        # Cap WPM at reasonable maximum (200 WPM is very fast reading aloud)
        wpm = min(wpm, 200)
        
        print(f"📈 Final metrics: {wpm} WPM, {accuracy:.1%} accuracy")
        
        return {
            "transcription": transcription,
            "words_per_minute": wpm,
            "words_correct": correct_words,
            "words_total": len(target_words),
            "accuracy": round(accuracy, 3),
            "similarity_score": round(similarity, 3),
            "reading_duration": round(reading_duration, 1)
        }
    
    finally:
        tmp.close()
        os.unlink(tmp.name)

def assess_mood_from_image(image_file) -> float:
    """Analyze facial expression using OpenAI Vision API."""
    try:
        image_file.file.seek(0)
        image_data = image_file.file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this child's facial expression for learning engagement. 
                            Return only a number between -1.0 and 1.0 where:
                            -1.0 = very frustrated/upset
                            -0.5 = bored/disengaged  
                            0.0 = neutral/calm
                            0.5 = interested/focused
                            1.0 = excited/happy
                            
                            Only return the number, no other text."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=10
        )
        
        mood_text = response.choices[0].message.content.strip()
        try:
            mood_score = float(mood_text)
            return max(-1.0, min(1.0, mood_score))
        except ValueError:
            return 0.0
            
    except Exception as e:
        print(f"Mood assessment error: {e}")
        return 0.0

def score_pitch_audio(audio_file, challenge: str) -> Dict[str, Any]:
    """Score pitch audio and return metrics."""
    try:
        # Transcribe audio
        tmp = NamedTemporaryFile(delete=False, suffix=".webm")
        audio_file.file.seek(0)
        shutil.copyfileobj(audio_file.file, tmp)
        tmp.flush()
        
        with open(tmp.name, "rb") as audio_fp:
            resp = client.audio.transcriptions.create(
                file=audio_fp,
                model=OPENAI_STT_MODEL,
                language="en"
            )
            transcription = resp.text.strip()
        
        os.unlink(tmp.name)
        
        # Score the pitch
        prompt = f"""Score this kid's pitch for their "{challenge}" AI project. The transcription is: "{transcription}"

Rate from 0-10 on:
1. Clarity: How clear and understandable was the explanation?
2. Creativity: How original and innovative is the idea?
3. Feasibility: How realistic is this solution?

Return a JSON response with scores and brief kid-friendly feedback:
{{
  "clarity_score": 8.5,
  "creativity_score": 7.0,
  "feasibility_score": 6.5,
  "feedback": "Great job explaining your idea! Your solution is very creative..."
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        
        try:
            scores = json.loads(response.choices[0].message.content)
            scores["transcription"] = transcription
            return scores
        except json.JSONDecodeError:
            return {
                "clarity_score": 7.0,
                "creativity_score": 7.0,
                "feasibility_score": 7.0,
                "feedback": "Great pitch! Keep working on your presentation skills.",
                "transcription": transcription
            }
            
    except Exception as e:
        print(f"Pitch scoring error: {e}")
        return {
            "clarity_score": 7.0,
            "creativity_score": 7.0,
            "feasibility_score": 7.0,
            "feedback": "We had trouble processing your pitch, but great job presenting!",
            "transcription": "Could not transcribe audio"
        }

def store_snapshot_in_pinecone(snapshot: LearnerSnapshot, profile_name: str = "Karl") -> bool:
    """Store learning snapshot in Pinecone."""
    try:
        index = pc.Index("karl-profile")
        
        snapshot_text = f"""
        Learner: {profile_name}
        Activity: {snapshot.activity_id}
        Topic: {snapshot.topic or 'General'}
        Timestamp: {snapshot.timestamp.isoformat()}
        WPM: {snapshot.wpm if snapshot.wpm else 'N/A'}
        Mood Score: {snapshot.mood_score if snapshot.mood_score else 'N/A'}
        Reading Level: {snapshot.reading_level}
        """
        
        embedding = embed_text(snapshot_text)
        
        index.upsert([
            (f"karl-snapshot-{snapshot.timestamp.isoformat()}", embedding, {
                "text": snapshot_text,
                "learner": profile_name,
                "activity_id": snapshot.activity_id,
                "topic": snapshot.topic,
                "wpm": snapshot.wpm,
                "mood_score": snapshot.mood_score,
                "timestamp": snapshot.timestamp.isoformat()
            })
        ])
        
        return True
    except Exception as e:
        print(f"Error storing snapshot: {e}")
        return False

# =============================================================================
# FASTAPI APPLICATION
# =============================================================================

app = FastAPI(title="Karl Learning GPT - with Mini Hackathon", version="2.1.0")

# =============================================================================
# MAIN INTERFACE ENDPOINTS
# =============================================================================

@app.get("/", response_class=HTMLResponse)
async def home():
    """Main landing page with session options."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Karl's Learning Adventure</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                text-align: center; 
                padding: 50px;
                margin: 0;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            h1 { 
                font-size: 3em; 
                margin-bottom: 30px; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            .btn { 
                display: inline-block;
                padding: 20px 40px; 
                margin: 15px; 
                font-size: 1.5em; 
                background: #ff6b6b; 
                color: white; 
                text-decoration: none; 
                border-radius: 50px; 
                transition: all 0.3s;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .btn:hover { 
                background: #ff5252; 
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            .emoji { font-size: 2em; margin-right: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Karl's Learning Adventure!</h1>
            <p style="font-size: 1.3em; margin-bottom: 40px;">Ready to explore and learn something awesome?</p>
            
            <div>
                <button class="btn" onclick="startNewSession()">
                    <span class="emoji">🌟</span>Start New Adventure!
                </button>
                <br>
                <button class="btn" onclick="reviewSessions()">
                    <span class="emoji">📚</span>Review Previous Adventures
                </button>
                <br>
                <button class="btn" onclick="viewBadges()">
                    <span class="emoji">🏆</span>View Badges Collected
                </button>
            </div>
        </div>

        <script>
            function startNewSession() {
                window.location.href = '/choose-topic';
            }
            
            function reviewSessions() {
                window.location.href = '/review-sessions';
            }
            
            function viewBadges() {
                window.location.href = '/badges';
            }
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/choose-topic", response_class=HTMLResponse)
async def choose_topic():
    """Topic selection page."""
    topics = get_random_topics()
    
    topic_buttons = ""
    for i, topic in enumerate(topics):
        emoji = ["🚀", "🏛️", "🌊", "🦕"][i] if i < 4 else "✨"
        topic_buttons += f"""
            <button class="topic-btn" onclick="selectTopic('{topic}')">
                <span class="emoji">{emoji}</span>{topic}
            </button>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Choose Your Adventure Topic</title>
        <style>
            body {{ 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white; 
                text-align: center; 
                padding: 50px;
                margin: 0;
            }}
            .container {{ 
                max-width: 800px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.15);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }}
            h1 {{ 
                font-size: 2.5em; 
                margin-bottom: 30px; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }}
            .topic-btn {{ 
                display: block;
                width: 80%;
                max-width: 400px;
                margin: 20px auto;
                padding: 20px; 
                font-size: 1.3em; 
                background: rgba(255,255,255,0.2); 
                color: white; 
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 15px; 
                cursor: pointer;
                transition: all 0.3s;
            }}
            .topic-btn:hover {{ 
                background: rgba(255,255,255,0.3);
                transform: scale(1.05);
                border-color: rgba(255,255,255,0.6);
            }}
            .emoji {{ font-size: 1.5em; margin-right: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 What are you interested in learning about today?</h1>
            <p style="font-size: 1.2em; margin-bottom: 40px;">Pick a topic that sounds exciting to you!</p>
            
            {topic_buttons}
        </div>

        <script>
            function selectTopic(topic) {{
                // Store selected topic and go to activity selection
                sessionStorage.setItem('selectedTopic', topic);
                window.location.href = '/choose-activity';
            }}
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/choose-activity", response_class=HTMLResponse)
async def choose_activity():
    """Activity selection page - Reading Adventure or Mini Hackathon."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Choose Your Activity</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                color: #333; 
                text-align: center; 
                padding: 50px;
                margin: 0;
            }
            .container { 
                max-width: 900px; 
                margin: 0 auto; 
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 { 
                font-size: 2.5em; 
                margin-bottom: 30px; 
                color: #333;
            }
            .activity-card {
                display: inline-block;
                width: 400px;
                margin: 20px;
                padding: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
                vertical-align: top;
            }
            .activity-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            }
            .activity-icon {
                font-size: 4em;
                margin-bottom: 20px;
            }
            .activity-title {
                font-size: 2em;
                margin-bottom: 15px;
                font-weight: bold;
            }
            .activity-description {
                font-size: 1.2em;
                line-height: 1.4;
            }
            .hackathon-card {
                background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 id="topic-title">🎯 Choose Your Adventure Type!</h1>
            <p style="font-size: 1.3em; margin-bottom: 40px;">What kind of learning experience do you want?</p>
            
            <div class="activity-card" onclick="startReadingAdventure()">
                <div class="activity-icon">📚</div>
                <div class="activity-title">Reading Adventure</div>
                <div class="activity-description">
                    Read exciting stories, practice your reading speed, and explore your favorite topics!
                    <br><br>
                    ⏱️ 15-20 minutes
                </div>
            </div>
            
            <div class="activity-card hackathon-card" onclick="startMiniHackathon()">
                <div class="activity-icon">💡</div>
                <div class="activity-title">Mini Hackathon</div>
                <div class="activity-description">
                    Create an AI solution for real-world problems! Design, prototype, and pitch your ideas.
                    <br><br>
                    ⏱️ 45-60 minutes
                </div>
            </div>
        </div>

        <script>
            window.onload = function() {
                const topic = sessionStorage.getItem('selectedTopic') || 'Your Topic';
                document.getElementById('topic-title').textContent = `🎯 ${topic} - Choose Your Adventure!`;
            };

            function startReadingAdventure() {
                const topic = sessionStorage.getItem('selectedTopic');
                if (!topic) {
                    alert('Please select a topic first');
                    window.location.href = '/choose-topic';
                    return;
                }
                
                fetch('/api/start-adventure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topic })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/learning-session';
                    } else {
                        alert('Error starting adventure: ' + data.message);
                    }
                });
            }

            function startMiniHackathon() {
                const topic = sessionStorage.getItem('selectedTopic');
                if (!topic) {
                    alert('Please select a topic first');
                    window.location.href = '/choose-topic';
                    return;
                }
                
                fetch('/api/start-hackathon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topic })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/hackathon';
                    } else {
                        alert('Error starting hackathon: ' + data.message);
                    }
                });
            }
        </script>
    </body>
    </html>
    """
    return html_content



#part three
@app.get("/hackathon", response_class=HTMLResponse)
async def hackathon():
    """Main Mini Hackathon interface."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mini Hackathon</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .phase-header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
            }
            .phase-title {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            .phase-subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .progress-bar {
                width: 100%;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin: 20px 0;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                border-radius: 10px;
                transition: width 0.5s ease;
            }
            .content-area {
                min-height: 400px;
                padding: 20px;
                background: #f8f9ff;
                border-radius: 15px;
                margin: 20px 0;
            }
            .btn {
                padding: 15px 30px;
                margin: 10px;
                font-size: 1.3em;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: 'Comic Sans MS', cursive;
            }
            .btn-primary { background: #667eea; color: white; }
            .btn-success { background: #51cf66; color: white; }
            .btn-danger { background: #ff6b6b; color: white; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .challenge-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .challenge-card {
                padding: 20px;
                background: white;
                border: 3px solid #e0e0e0;
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            .challenge-card:hover, .challenge-card.selected {
                border-color: #667eea;
                background: #f0f2ff;
                transform: scale(1.05);
            }
            .challenge-icon {
                font-size: 3em;
                margin-bottom: 10px;
            }
            .canvas-container {
                position: relative;
                border: 2px solid #ddd;
                border-radius: 10px;
                margin: 20px 0;
                background: white;
            }
            #drawing-canvas {
                border-radius: 10px;
                cursor: crosshair;
            }
            .canvas-tools {
                display: flex;
                gap: 10px;
                margin: 10px 0;
                flex-wrap: wrap;
            }
            .tool-btn {
                padding: 10px 15px;
                border: 2px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .tool-btn.active {
                border-color: #667eea;
                background: #f0f2ff;
            }
            .concept-form {
                display: grid;
                gap: 20px;
                margin: 20px 0;
            }
            .concept-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .concept-field label {
                font-weight: bold;
                color: #333;
            }
            .concept-field input, .concept-field textarea {
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-family: 'Comic Sans MS', cursive;
                font-size: 1.1em;
            }
            .concept-field input:focus, .concept-field textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .avatar-selector {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .avatar-option {
                width: 80px;
                height: 80px;
                border: 3px solid #ddd;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5em;
                cursor: pointer;
                transition: all 0.3s;
            }
            .avatar-option:hover, .avatar-option.selected {
                border-color: #667eea;
                background: #f0f2ff;
                transform: scale(1.1);
            }
            .text-editor {
                width: 100%;
                min-height: 200px;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-family: 'Comic Sans MS', cursive;
                font-size: 1.1em;
                resize: vertical;
            }
            .text-editor:focus {
                outline: none;
                border-color: #667eea;
            }
            .status-message {
                padding: 15px;
                margin: 15px 0;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
            }
            .status-info { background: #e3f2fd; color: #1565c0; }
            .status-success { background: #e8f5e8; color: #2e7d32; }
            .status-warning { background: #fff3e0; color: #ef6c00; }
            .hidden { display: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Phase Header -->
            <div class="phase-header">
                <div class="phase-title" id="phase-title">🚀 Welcome to Mini Hackathon!</div>
                <div class="phase-subtitle" id="phase-subtitle">Let's create something amazing together!</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
            </div>

            <!-- Status Messages -->
            <div id="status-message" class="status-message status-info hidden">
                Ready to start your hackathon adventure!
            </div>

            <!-- Content Area - Different content for each phase -->
            <div class="content-area" id="content-area">
                <div id="loading-screen">
                    <div style="text-align: center; padding: 50px;">
                        <div style="font-size: 3em; margin-bottom: 20px;">⏳</div>
                        <h2>Setting up your Mini Hackathon...</h2>
                        <p>Preparing your personalized challenge!</p>
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div style="text-align: center; margin-top: 30px;">
                <button id="main-action-btn" class="btn btn-primary hidden" onclick="nextPhase()">
                    Get Started! 🚀
                </button>
                <button id="back-btn" class="btn" onclick="previousPhase()" style="background: #95a5a6; color: white; display: none;">
                    ← Back
                </button>
            </div>
        </div>

        <script>
            let currentPhase = 0;
            let hackathonData = {
                sessionId: '',
                topic: '',
                avatar: '',
                challengeStory: '',
                selectedChallenge: '',
                brainstormNotes: '',
                conceptData: {},
                sketchData: {},
                onePagerText: '',
                pitchAudio: null,
                startTime: new Date()
            };

            const phases = [
                { title: "🎭 Choose Your Avatar", subtitle: "Pick your hackathon persona!", progress: 5 },
                { title: "📋 Explore Challenges", subtitle: "Pick a problem to solve with AI!", progress: 15 },
                { title: "💭 Brainstorm Ideas", subtitle: "What causes this problem? How can AI help?", progress: 30 },
                { title: "🏗️ Build Your Concept", subtitle: "Design your AI solution!", progress: 45 },
                { title: "✏️ Sketch Your Prototype", subtitle: "Draw how your solution works!", progress: 60 },
                { title: "📄 Create Your Pitch", subtitle: "Write a compelling one-pager!", progress: 75 },
                { title: "🎤 Record Your Pitch", subtitle: "Present your idea in 90 seconds!", progress: 85 },
                { title: "🤖 Shark Bot Q&A", subtitle: "Answer questions from AI investors!", progress: 95 },
                { title: "🏆 Reflection & Badge", subtitle: "Celebrate your achievement!", progress: 100 }
            ];

            window.onload = function() {
                initializeHackathon();
            };

            async function initializeHackathon() {
                try {
                    const response = await fetch('/api/get-hackathon-session');
                    if (response.ok) {
                        const data = await response.json();
                        hackathonData.sessionId = data.session_id;
                        hackathonData.topic = data.topic;
                        hackathonData.challengeStory = data.challenge_story;
                        currentPhase = data.current_phase;
                        
                        showStatus('Hackathon loaded! Ready to continue.', 'success');
                        renderCurrentPhase();
                    } else {
                        showStatus('Error loading hackathon. Please refresh the page.', 'warning');
                    }
                } catch (error) {
                    showStatus('Connection error. Please check your internet.', 'warning');
                }
            }

            function renderCurrentPhase() {
                const phase = phases[currentPhase];
                document.getElementById('phase-title').textContent = phase.title;
                document.getElementById('phase-subtitle').textContent = phase.subtitle;
                document.getElementById('progress-fill').style.width = phase.progress + '%';
                
                const contentArea = document.getElementById('content-area');
                const actionBtn = document.getElementById('main-action-btn');
                const backBtn = document.getElementById('back-btn');
                
                // Show/hide back button
                backBtn.style.display = currentPhase > 0 ? 'inline-block' : 'none';
                
                switch(currentPhase) {
                    case 0:
                        renderAvatarSelection();
                        break;
                    case 1:
                        renderChallengeSelection();
                        break;
                    case 2:
                        renderBrainstorm();
                        break;
                    case 3:
                        renderConceptBuilder();
                        break;
                    case 4:
                        renderSketchPad();
                        break;
                    case 5:
                        renderOnePagerMaker();
                        break;
                    case 6:
                        renderPitchRecorder();
                        break;
                    case 7:
                        renderSharkBotQA();
                        break;
                    case 8:
                        renderReflectionAndBadge();
                        break;
                    default:
                        contentArea.innerHTML = '<h2>Unknown phase</h2>';
                }
                
                actionBtn.classList.remove('hidden');
            }

            function renderAvatarSelection() {
                const avatars = ['🦸', '👩‍💻', '🧑‍🔬', '👨‍🚀', '🧙‍♀️', '🦄', '🤖', '🦁'];
                let html = `
                    <h2>Choose Your Hackathon Avatar!</h2>
                    <p>Pick the character that represents you best in this challenge!</p>
                    <div class="avatar-selector">
                `;
                
                avatars.forEach(avatar => {
                    html += `
                        <div class="avatar-option" onclick="selectAvatar('${avatar}', this)">
                            ${avatar}
                        </div>
                    `;
                });
                
                html += '</div>';
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Continue with Avatar 🎭';
            }

            function selectAvatar(avatar, el) {
                hackathonData.avatar = avatar;
                document.querySelectorAll('.avatar-option').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                showStatus(`Great choice! Your avatar is ${avatar}`, 'success');
            }

            function renderChallengeSelection() {
                let html = `
                    <h2>🌍 Challenge Story</h2>
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #4CAF50;">
                        <p style="font-size: 1.2em; line-height: 1.5;">${hackathonData.challengeStory}</p>
                    </div>
                    <h2>Pick Your Challenge Focus!</h2>
                    <div class="challenge-cards">
                        <div class="challenge-card" onclick="selectChallenge('Food Waste Detective', 0)">
                            <div class="challenge-icon">🍎</div>
                            <h3>Food Waste Detective</h3>
                            <p>Help reduce food waste in schools and homes</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Ocean Protector', 1)">
                            <div class="challenge-icon">🌊</div>
                            <h3>Ocean Protector</h3>
                            <p>Clean up plastic pollution in our oceans</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Energy Saver', 2)">
                            <div class="challenge-icon">⚡</div>
                            <h3>Energy Saver</h3>
                            <p>Help people use less electricity and save money</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Wildlife Guardian', 3)">
                            <div class="challenge-icon">🦋</div>
                            <h3>Wildlife Guardian</h3>
                            <p>Protect endangered animals and their homes</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Air Quality Monitor', 4)">
                            <div class="challenge-icon">🌬️</div>
                            <h3>Air Quality Monitor</h3>
                            <p>Track and improve the air we breathe</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Water Conservation', 5)">
                            <div class="challenge-icon">💧</div>
                            <h3>Water Conservation</h3>
                            <p>Help communities save and protect clean water</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Recycling Helper', 6)">
                            <div class="challenge-icon">♻️</div>
                            <h3>Recycling Helper</h3>
                            <p>Make recycling easier and more fun</p>
                        </div>
                        <div class="challenge-card" onclick="selectChallenge('Community Garden', 7)">
                            <div class="challenge-icon">🌱</div>
                            <h3>Community Garden</h3>
                            <p>Help people grow their own healthy food</p>
                        </div>
                    </div>
                `;
                
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Start Brainstorming! 💭';
            }

            function selectChallenge(challenge, index) {
                hackathonData.selectedChallenge = challenge;
                document.querySelectorAll('.challenge-card').forEach(el => el.classList.remove('selected'));
                document.querySelectorAll('.challenge-card')[index].classList.add('selected');
                showStatus(`Challenge selected: ${challenge}`, 'success');
            }

            function renderBrainstorm() {
                const html = `
                    <h2>💭 Brainstorm Time!</h2>
                    <p>Challenge: <strong>${hackathonData.selectedChallenge}</strong></p>
                    <p>Think about:</p>
                    <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
                        <li>What causes this problem?</li>
                        <li>Who is affected by it?</li>
                        <li>How could AI help solve it?</li>
                        <li>What data would the AI need?</li>
                    </ul>
                    <textarea id="brainstorm-notes" class="text-editor" placeholder="Write your ideas here... What causes this problem? How can AI help? Be creative!"></textarea>
                    <div style="margin: 20px 0; text-align: center;">
                        <button class="btn btn-success" onclick="getIdeaSpark()">💡 Get Idea Spark</button>
                    </div>
                    <div id="idea-sparks" style="background: #fff3e0; padding: 15px; border-radius: 10px; margin: 20px 0; display: none;">
                        <h4>💡 AI IdeaSpark Coach Says:</h4>
                        <div id="spark-content"></div>
                    </div>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Build My Concept! 🏗️';
            }

            async function getIdeaSpark() {
                const notes = document.getElementById('brainstorm-notes').value;
                if (!notes.trim()) {
                    showStatus('Write some ideas first, then ask for a spark!', 'warning');
                    return;
                }
                
                try {
                    const response = await fetch('/api/get-idea-spark', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            challenge: hackathonData.selectedChallenge,
                            notes: notes,
                            topic: hackathonData.topic
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('spark-content').innerHTML = data.spark;
                        document.getElementById('idea-sparks').style.display = 'block';
                    }
                } catch (error) {
                    showStatus('Could not get idea spark. Keep brainstorming!', 'warning');
                }
            }

            function renderConceptBuilder() {
                const html = `
                    <h2>🏗️ Build Your AI Concept</h2>
                    <p>Challenge: <strong>${hackathonData.selectedChallenge}</strong></p>
                    <div class="concept-form">
                        <div class="concept-field">
                            <label>🎯 What Problem Does Your AI Solve?</label>
                            <textarea id="concept-problem" placeholder="Describe the specific problem your AI will tackle..." rows="3"></textarea>
                        </div>
                        <div class="concept-field">
                            <label>👥 Who Will Use Your AI?</label>
                            <input type="text" id="concept-user" placeholder="Kids, families, schools, communities..." />
                        </div>
                        <div class="concept-field">
                            <label>🤖 What's Your AI's Special Trick?</label>
                            <textarea id="concept-trick" placeholder="What unique thing can your AI do that humans can't?" rows="3"></textarea>
                        </div>
                        <div class="concept-field">
                            <label>✨ What Benefits Will People Get?</label>
                            <textarea id="concept-benefits" placeholder="How will this make people's lives better?" rows="3"></textarea>
                        </div>
                        <div class="concept-field">
                            <label>🏷️ What's Your AI's Cool Name?</label>
                            <input type="text" id="concept-name" placeholder="Give your AI a memorable name!" />
                        </div>
                        <div class="concept-field">
                            <label>🌟 What's Your Wow Factor?</label>
                            <input type="text" id="concept-wow" placeholder="What will make people say 'WOW!'?" />
                        </div>
                    </div>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Start Sketching! ✏️';
            }

            function showStatus(message, type = 'info') {
                const statusEl = document.getElementById('status-message');
                statusEl.textContent = message;
                statusEl.className = `status-message status-${type}`;
                statusEl.classList.remove('hidden');
            }

            function renderSketchPad() {
                const html = `
                    <h2>✏️ Sketch Your Prototype</h2>
                    <p>Draw how your AI solution works! Include screens, buttons, or whatever shows your idea.</p>
                    
                    <div class="canvas-tools">
                        <div class="tool-btn active" onclick="selectTool('pen')">✏️ Pen</div>
                        <div class="tool-btn" onclick="selectTool('eraser')">🧽 Eraser</div>
                        <div class="tool-btn" onclick="selectTool('text')">📝 Text</div>
                        <div class="tool-btn" onclick="clearCanvas()">🗑️ Clear</div>
                        <div class="tool-btn" onclick="aiRender()">🎨 AI Render</div>
                    </div>
                    
                    <div class="canvas-container">
                        <canvas id="drawing-canvas" width="800" height="500"></canvas>
                    </div>
                    
                    <div id="ai-render-result" style="margin: 20px 0; text-align: center; display: none;">
                        <h3>🎨 AI-Rendered Diagram</h3>
                        <div id="rendered-image"></div>
                    </div>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Create One-Pager! 📄';
                
                initializeCanvas();
            }

            let canvas, ctx, currentTool = 'pen', isDrawing = false;
            let textLabels = [];

            function initializeCanvas() {
                canvas = document.getElementById('drawing-canvas');
                ctx = canvas.getContext('2d');
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#333';
                
                canvas.addEventListener('mousedown', startDrawing);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', stopDrawing);
                canvas.addEventListener('mouseout', stopDrawing);
            }

            function selectTool(tool) {
                currentTool = tool;
                document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                if (tool === 'text') {
                    canvas.style.cursor = 'text';
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            }

            function startDrawing(e) {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (currentTool === 'text') {
                    const text = prompt('Enter text:');
                    if (text) {
                        ctx.font = '16px Comic Sans MS';
                        ctx.fillStyle = '#333';
                        ctx.fillText(text, x, y);
                        textLabels.push({ text, x, y });
                    }
                    return;
                }
                
                ctx.beginPath();
                ctx.moveTo(x, y);
            }

            function draw(e) {
                if (!isDrawing || currentTool === 'text') return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (currentTool === 'pen') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (currentTool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.lineWidth = 20;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }

            function stopDrawing() {
                isDrawing = false;
                ctx.beginPath();
            }

            function clearCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                textLabels = [];
            }

            async function aiRender() {
                try {
                    showStatus('🎨 AI is creating a polished version of your sketch...', 'info');
                    
                    const canvasData = canvas.toDataURL();
                    const response = await fetch('/api/ai-render-sketch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sketch_data: canvasData,
                            text_labels: textLabels,
                            concept: hackathonData.selectedChallenge
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('rendered-image').innerHTML = `<img src="${data.image_url}" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" />`;
                        document.getElementById('ai-render-result').style.display = 'block';
                        showStatus('✨ AI has created your polished diagram!', 'success');
                    } else {
                        showStatus('AI rendering temporarily unavailable. Your sketch looks great as is!', 'warning');
                    }
                } catch (error) {
                    showStatus('AI rendering temporarily unavailable. Your sketch looks great as is!', 'warning');
                }
            }

            // Add the missing remaining functions for the other phases...
            function renderOnePagerMaker() {
                const html = `
                    <h2>📄 Create Your One-Pager Pitch</h2>
                    <p>Write a compelling 150-word pitch for your AI solution!</p>
                    <textarea id="pitch-text" class="text-editor" placeholder="Write your pitch here..."></textarea>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Record My Pitch! 🎤';
            }

            function renderPitchRecorder() {
                const html = `<h2>🎤 Record Your Pitch</h2><p>Record your 90-second pitch!</p>`;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Face the Shark Bots! 🦈';
            }

            function renderSharkBotQA() {
                const html = `<h2>🦈 Shark Bot Q&A</h2><p>Answer questions from AI investors!</p>`;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Get My Badge! 🏆';
            }

            function renderReflectionAndBadge() {
                const html = `<h2>🏆 Congratulations!</h2><p>You've completed your Mini Hackathon!</p>`;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Finish & Export! 📄';
            }

            // The main navigation functions
            async function nextPhase() {
                // Save current phase data
                const saved = await savePhaseData();
                if (!saved) return;
                
                if (currentPhase < phases.length - 1) {
                    currentPhase++;
                    renderCurrentPhase();
                } else {
                    // Hackathon complete
                    await completeHackathon();
                    window.location.href = '/badges';
                }
            }

            function previousPhase() {
                if (currentPhase > 0) {
                    currentPhase--;
                    renderCurrentPhase();
                }
            }

            async function savePhaseData() {
                try {
                    let phaseData = {};
                    
                    switch(currentPhase) {
                        case 0:
                            if (!hackathonData.avatar) {
                                showStatus('Please select an avatar first!', 'warning');
                                return false;
                            }
                            break;
                        case 1:
                            if (!hackathonData.selectedChallenge) {
                                showStatus('Please select a challenge first!', 'warning');
                                return false;
                            }
                            break;
                        case 2:
                            hackathonData.brainstormNotes = document.getElementById('brainstorm-notes')?.value || '';
                            break;
                        case 3:
                            hackathonData.conceptData = {
                                problem: document.getElementById('concept-problem')?.value || '',
                                user: document.getElementById('concept-user')?.value || '',
                                trick: document.getElementById('concept-trick')?.value || '',
                                benefits: document.getElementById('concept-benefits')?.value || '',
                                name: document.getElementById('concept-name')?.value || '',
                                wow: document.getElementById('concept-wow')?.value || ''
                            };
                            break;
                        case 4:
                            if (canvas) {
                                hackathonData.sketchData = {
                                    canvas: canvas.toDataURL(),
                                    labels: textLabels
                                };
                            }
                            break;
                        case 5:
                            hackathonData.onePagerText = document.getElementById('pitch-text')?.value || '';
                            break;
                    }
                    
                    await fetch('/api/save-hackathon-progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            session_id: hackathonData.sessionId,
                            phase: currentPhase,
                            data: hackathonData
                        })
                    });
                    
                    return true;
                } catch (error) {
                    console.log('Save failed, but continuing...');
                    return true;
                }
            }

            async function completeHackathon() {
                try {
                    await fetch('/api/complete-hackathon', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            session_id: hackathonData.sessionId,
                            reflection: {
                                challenge: document.getElementById('reflection-challenge')?.value || '',
                                proud: document.getElementById('reflection-proud')?.value || '',
                                improve: document.getElementById('reflection-improve')?.value || ''
                            }
                        })
                    });
                } catch (error) {
                    console.log('Completion save failed, but hackathon finished!');
                }
            }
        </script>

            function renderSharkBotQA() {
                const html = `
                    <h2>🦈 Shark Bot Investors</h2>
                    <p>Three AI investors want to ask you questions about your solution!</p>
                    
                    <div id="shark-questions" style="margin: 20px 0;">
                        <div class="status-message status-info">
                            Loading questions from the Shark Bots...
                        </div>
                    </div>
                    
                    <div id="qa-interface" style="display: none;">
                        <div id="current-question" style="background: #f0f2ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #667eea;">
                        </div>
                        
                        <textarea id="answer-text" class="text-editor" placeholder="Type your answer here..." style="height: 120px;"></textarea>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <button class="btn btn-primary" onclick="submitAnswer()">Submit Answer 📝</button>
                        </div>
                    </div>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Get My Badge! 🏆';
                
                loadSharkQuestions();
            }

            let currentQuestionIndex = 0;
            let sharkQuestions = [];

            async function loadSharkQuestions() {
                try {
                    const response = await fetch('/api/get-shark-questions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            challenge: hackathonData.selectedChallenge,
                            pitch: hackathonData.onePagerText || 'AI solution pitch'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        sharkQuestions = data.questions;
                        showCurrentQuestion();
                    } else {
                        document.getElementById('shark-questions').innerHTML = '<p>Shark Bots are impressed! No questions needed - you did great!</p>';
                        document.getElementById('main-action-btn').style.display = 'inline-block';
                    }
                } catch (error) {
                    document.getElementById('shark-questions').innerHTML = '<p>Shark Bots are taking a break. Great job on your pitch!</p>';
                    document.getElementById('main-action-btn').style.display = 'inline-block';
                }
            }

            function showCurrentQuestion() {
                if (currentQuestionIndex >= sharkQuestions.length) {
                    document.getElementById('shark-questions').innerHTML = '<div class="status-message status-success">🎉 Great job answering all the Shark Bot questions!</div>';
                    document.getElementById('qa-interface').style.display = 'none';
                    document.getElementById('main-action-btn').style.display = 'inline-block';
                    return;
                }
                
                const question = sharkQuestions[currentQuestionIndex];
                document.getElementById('current-question').innerHTML = `
                    <h4>🦈 ${question.investor} asks:</h4>
                    <p style="font-size: 1.2em;">${question.question}</p>
                `;
                document.getElementById('qa-interface').style.display = 'block';
                document.getElementById('shark-questions').innerHTML = '';
                document.getElementById('answer-text').value = '';
            }

            function submitAnswer() {
                const answer = document.getElementById('answer-text').value.trim();
                if (!answer) {
                    showStatus('Please provide an answer first!', 'warning');
                    return;
                }
                
                // Store the answer
                sharkQuestions[currentQuestionIndex].answer = answer;
                currentQuestionIndex++;
                
                showStatus('Answer submitted! Next question coming up...', 'success');
                setTimeout(showCurrentQuestion, 1500);
            }

            function renderReflectionAndBadge() {
                const html = `
                    <div style="text-align: center;">
                        <h2>🎉 Congratulations!</h2>
                        <p style="font-size: 1.3em;">You've completed your Mini Hackathon!</p>
                        
                        <div id="badge-container" style="margin: 30px 0;">
                            <div style="font-size: 1.5em; margin-bottom: 20px;">🏆 You Earned:</div>
                            <div id="earned-badge" style="margin: 20px 0;">
                                <div style="font-size: 3em;">⏳</div>
                                <p>Creating your badge...</p>
                            </div>
                        </div>
                        
                        <div style="background: #f8f9ff; padding: 20px; border-radius: 15px; margin: 20px 0; text-align: left;">
                            <h3>📝 Reflection Questions:</h3>
                            <div style="margin: 15px 0;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">What was the most challenging part?</label>
                                <textarea id="reflection-challenge" style="width: 100%; padding: 10px; border-radius: 5px; border: 2px solid #ddd;" rows="3"></textarea>
                            </div>
                            <div style="margin: 15px 0;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">What are you most proud of?</label>
                                <textarea id="reflection-proud" style="width: 100%; padding: 10px; border-radius: 5px; border: 2px solid #ddd;" rows="3"></textarea>
                            </div>
                            <div style="margin: 15px 0;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">What would you improve next time?</label>
                                <textarea id="reflection-improve" style="width: 100%; padding: 10px; border-radius: 5px; border: 2px solid #ddd;" rows="3"></textarea>
                            </div>
                        </div>
                        
                        <div id="final-scores" style="background: #e8f5e8; padding: 20px; border-radius: 15px; margin: 20px 0;">
                            <h3>📊 Your Hackathon Scores</h3>
                            <div id="score-details">Loading your final scores...</div>
                        </div>
                    </div>
                `;
                document.getElementById('content-area').innerHTML = html;
                document.getElementById('main-action-btn').textContent = 'Finish & Export! 📄';
                
                generateBadge();
                loadFinalScores();
            }

            async function generateBadge() {
                try {
                    const response = await fetch('/api/generate-badge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            challenge: hackathonData.selectedChallenge,
                            topic: hackathonData.topic
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('earned-badge').innerHTML = `
                            <div style="margin: 20px 0;">${data.svg}</div>
                            <h3 style="color: #4CAF50;">${data.name}</h3>
                            <p>${data.description}</p>
                        `;
                    } else {
                        document.getElementById('earned-badge').innerHTML = `
                            <div style="font-size: 4em; margin: 20px 0;">🏆</div>
                            <h3 style="color: #4CAF50;">${hackathonData.selectedChallenge} Champion</h3>
                            <p>Congratulations on completing your hackathon!</p>
                        `;
                    }
                } catch (error) {
                    document.getElementById('earned-badge').innerHTML = `
                        <div style="font-size: 4em; margin: 20px 0;">🏆</div>
                        <h3 style="color: #4CAF50;">${hackathonData.selectedChallenge} Champion</h3>
                        <p>Congratulations on completing your hackathon!</p>
                    `;
                }
            }

            async function loadFinalScores() {
                try {
                    const response = await fetch('/api/get-final-scores');
                    if (response.ok) {
                        const scores = await response.json();
                        document.getElementById('score-details').innerHTML = `
                            <div style="display: flex; align-items: center; gap: 15px; margin: 15px 0;">
                                <strong>Clarity:</strong>
                                <div style="flex: 1; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                                    <div style="height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); border-radius: 10px; transition: width 0.5s ease; width: ${scores.clarity_score * 10}%"></div>
                                </div>
                                <span>${scores.clarity_score}/10</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px; margin: 15px 0;">
                                <strong>Creativity:</strong>
                                <div style="flex: 1; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                                    <div style="height: 100%; background: linear-gradient(90deg, #FF9800, #F57C00); border-radius: 10px; transition: width 0.5s ease; width: ${scores.creativity_score * 10}%"></div>
                                </div>
                                <span>${scores.creativity_score}/10</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px; margin: 15px 0;">
                                <strong>Feasibility:</strong>
                                <div style="flex: 1; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                                    <div style="height: 100%; background: linear-gradient(90deg, #2196F3, #1976D2); border-radius: 10px; transition: width 0.5s ease; width: ${scores.feasibility_score * 10}%"></div>
                                </div>
                                <span>${scores.feasibility_score}/10</span>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 10px;">
                                <strong>Feedback:</strong> ${scores.feedback}
                            </div>
                        `;
                    }
                } catch (error) {
                    document.getElementById('score-details').innerHTML = '<p>Scores will be available shortly!</p>';
                }
            }
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/learning-session", response_class=HTMLResponse)
async def learning_session():
    """Main learning interface with automatic features."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Karl's Learning Session</title>
        <style>
            body {
                font-family: 'Comic Sans MS', cursive;
                background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                color: #333;
            }
            .story-section {
                background: #f8f9ff;
                padding: 25px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 5px solid #667eea;
            }
            .controls {
                text-align: center;
                margin: 20px 0;
            }
            .btn {
                padding: 15px 30px;
                margin: 10px;
                font-size: 1.2em;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .btn-primary { background: #667eea; color: white; }
            .btn-success { background: #51cf66; color: white; }
            .btn-danger { background: #ff6b6b; color: white; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .status { 
                padding: 15px; 
                margin: 15px 0; 
                border-radius: 10px; 
                text-align: center;
                font-weight: bold;
            }
            .status.info { background: #e3f2fd; color: #1565c0; }
            .status.success { background: #e8f5e8; color: #2e7d32; }
            .status.warning { background: #fff3e0; color: #ef6c00; }
            #webcam { 
                width: 200px; 
                height: 150px; 
                border-radius: 10px; 
                position: fixed; 
                top: 20px; 
                right: 20px;
                border: 3px solid #667eea;
                background: #f0f0f0;
            }
            .mood-indicator {
                position: fixed;
                top: 180px;
                right: 20px;
                padding: 10px;
                background: rgba(255,255,255,0.9);
                border-radius: 10px;
                text-align: center;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 id="session-title">🌟 Loading Your Adventure...</h1>
                <p id="session-subtitle">Getting everything ready for you!</p>
            </div>

            <div id="story-section" class="story-section" style="display: none;">
                <h2 id="story-title">Story Title</h2>
                <div id="story-text">Story content will appear here...</div>
            </div>

            <div class="controls">
                <button id="start-reading" class="btn btn-primary" onclick="startReading()" style="display: none;">
                    🎤 Start Reading Aloud
                </button>
                <button id="stop-reading" class="btn btn-danger" onclick="stopReading()" style="display: none;">
                    ⏹️ Stop Reading
                </button>
                <button id="next-story" class="btn btn-success" onclick="getNextStory()" style="display: none;">
                    ➡️ Next Adventure
                </button>
            </div>

            <div id="status" class="status info">
                Welcome! Setting up your personalized learning session...
            </div>

            <div id="results" style="display: none;">
                <h3>📊 Your Reading Results</h3>
                <div id="results-content"></div>
            </div>
        </div>

        <!-- Webcam for automatic mood monitoring -->
        <video id="webcam" autoplay muted></video>
        <div class="mood-indicator">
            <div>📷 Mood Monitor</div>
            <div id="mood-status">Starting...</div>
        </div>

        <script>
            let mediaRecorder;
            let audioChunks = [];
            let currentStory = null;
            let webcamStream = null;
            let moodCheckInterval = null;

            // Initialize the session
            window.onload = function() {
                initializeWebcam();
                loadCurrentStory();
                startMoodMonitoring();
            };

            async function initializeWebcam() {
                try {
                    console.log('🎤 Requesting microphone and camera access...');
                    
                    webcamStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            width: { ideal: 640 },
                            height: { ideal: 480 }
                        },
                        audio: { 
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: { ideal: 44100 },
                            channelCount: { ideal: 1 }
                        }
                    });
                    
                    const videoTracks = webcamStream.getVideoTracks();
                    const audioTracks = webcamStream.getAudioTracks();
                    
                    console.log(`📹 Video tracks: ${videoTracks.length}`);
                    console.log(`🎤 Audio tracks: ${audioTracks.length}`);
                    
                    if (audioTracks.length === 0) {
                        updateStatus('⚠️ Microphone not available - audio recording disabled', 'warning');
                    } else {
                        console.log(`🎤 Audio track settings:`, audioTracks[0].getSettings());
                    }
                    
                    document.getElementById('webcam').srcObject = webcamStream;
                    updateStatus('✅ Camera and microphone connected successfully! 📷🎤', 'success');
                    
                } catch (error) {
                    console.error('Media access error:', error);
                    
                    let errorMessage = 'Media access denied. ';
                    if (error.name === 'NotAllowedError') {
                        errorMessage += 'Please allow camera and microphone access and refresh the page.';
                    } else if (error.name === 'NotFoundError') {
                        errorMessage += 'No camera or microphone found on this device.';
                    } else if (error.name === 'NotReadableError') {
                        errorMessage += 'Camera or microphone is being used by another application.';
                    } else {
                        errorMessage += `Error: ${error.message}`;
                    }
                    
                    updateStatus(errorMessage, 'warning');
                    
                    try {
                        console.log('🎤 Trying audio-only fallback...');
                        webcamStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        updateStatus('🎤 Microphone connected (camera disabled)', 'info');
                    } catch (audioError) {
                        console.error('Audio-only fallback failed:', audioError);
                        updateStatus('❌ Cannot access microphone. Audio features will be disabled.', 'warning');
                    }
                }
            }

            async function loadCurrentStory() {
                try {
                    const response = await fetch('/api/get-current-story');
                    if (response.ok) {
                        currentStory = await response.json();
                        displayStory(currentStory);
                    } else {
                        updateStatus('Error loading story. Please refresh the page.', 'warning');
                    }
                } catch (error) {
                    updateStatus('Connection error. Please check your internet.', 'warning');
                }
            }

            function displayStory(story) {
                document.getElementById('session-title').textContent = `📖 ${story.title}`;
                document.getElementById('session-subtitle').textContent = `Reading Level: ${story.reading_level.replace('_', ' ')} • Topic: ${story.topic}`;
                document.getElementById('story-title').textContent = story.title;
                document.getElementById('story-text').textContent = story.text;
                document.getElementById('story-section').style.display = 'block';
                document.getElementById('start-reading').style.display = 'inline-block';
                updateStatus('Story loaded! Click "Start Reading Aloud" when ready 🎤', 'info');
            }

            function updateStatus(message, type = 'info') {
                const statusEl = document.getElementById('status');
                statusEl.textContent = message;
                statusEl.className = `status ${type}`;
            }

            function updateMoodStatus(status) {
                document.getElementById('mood-status').textContent = status;
            }

            function startMoodMonitoring() {
                // Run automatic mood checks every 10 minutes
                moodCheckInterval = setInterval(checkMoodAutomatically, 600000);
                updateMoodStatus('Active 😊');
            }

            function getMoodEmoji(score) {
                if (score > 0.5) return 'Happy 😊';
                if (score > 0) return 'Good 🙂';
                if (score > -0.3) return 'Neutral 😐';
                if (score > -0.6) return 'Bored 😑';
                return 'Frustrated 😤';
            }

            // Cleanup on page unload
            window.onbeforeunload = function() {
                if (moodCheckInterval) {
                    clearInterval(moodCheckInterval);
                }
                if (webcamStream) {
                    webcamStream.getTracks().forEach(track => track.stop());
                }
            };
        </script>
    </body>
    </html>

            async function startReading() {
                if (!webcamStream) {
                    updateStatus('Need webcam and microphone access for full experience', 'warning');
                    return;
                }

                try {
                    if (!window.MediaRecorder) {
                        updateStatus('Audio recording not supported in this browser. Try Chrome or Firefox.', 'warning');
                        return;
                    }

                    let options = {};
                    const preferredTypes = [
                        'audio/webm;codecs=opus',
                        'audio/webm',
                        'audio/mp4',
                        'audio/ogg',
                        ''
                    ];

                    for (let mimeType of preferredTypes) {
                        if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
                            if (mimeType !== '') {
                                options.mimeType = mimeType;
                            }
                            console.log(`🎤 Using audio format: ${mimeType || 'default'}`);
                            break;
                        }
                    }

                    const audioStream = new MediaStream();
                    const audioTracks = webcamStream.getAudioTracks();
                    
                    if (audioTracks.length === 0) {
                        updateStatus('No microphone found. Please allow microphone access and refresh.', 'warning');
                        return;
                    }

                    audioTracks.forEach(track => audioStream.addTrack(track));
                    
                    mediaRecorder = new MediaRecorder(audioStream, options);
                    audioChunks = [];
                    
                    const recordingStart = Date.now();

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        const recordingDuration = (Date.now() - recordingStart) / 1000;
                        console.log(`🕐 Recording duration: ${recordingDuration.toFixed(1)} seconds`);
                        
                        if (audioChunks.length === 0) {
                            updateStatus('No audio data recorded. Please try again.', 'warning');
                            document.getElementById('start-reading').style.display = 'inline-block';
                            return;
                        }

                        const audioBlob = new Blob(audioChunks, { 
                            type: options.mimeType || 'audio/webm' 
                        });
                        
                        console.log(`📊 Audio blob: ${(audioBlob.size / 1024).toFixed(1)} KB`);
                        
                        if (audioBlob.size < 1000) {
                            updateStatus('Recording seems too short or empty. Please try again.', 'warning');
                            document.getElementById('start-reading').style.display = 'inline-block';
                            return;
                        }
                        
                        await submitAudioForScoring(audioBlob, recordingDuration);
                    };

                    mediaRecorder.onerror = (event) => {
                        console.error('MediaRecorder error:', event.error);
                        updateStatus(`Recording error: ${event.error.name}. Please try again.`, 'warning');
                        document.getElementById('start-reading').style.display = 'inline-block';
                        document.getElementById('stop-reading').style.display = 'none';
                    };

                    mediaRecorder.start(1000);
                    
                    document.getElementById('start-reading').style.display = 'none';
                    document.getElementById('stop-reading').style.display = 'inline-block';
                    updateStatus('🎤 Recording... Read the story aloud clearly! Speak at normal pace.', 'info');

                } catch (error) {
                    console.error('Recording setup error:', error);
                    updateStatus(`Recording setup failed: ${error.message}. Please refresh and try again.`, 'warning');
                    
                    document.getElementById('start-reading').style.display = 'inline-block';
                    document.getElementById('stop-reading').style.display = 'none';
                }
            }

            function stopReading() {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    document.getElementById('stop-reading').style.display = 'none';
                    updateStatus('🔄 Processing your reading...', 'info');
                } else {
                    updateStatus('No active recording to stop.', 'warning');
                    document.getElementById('start-reading').style.display = 'inline-block';
                    document.getElementById('stop-reading').style.display = 'none';
                }
            }

            async function submitAudioForScoring(audioBlob, actualDuration) {
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('passage', currentStory.text);
                formData.append('actual_duration', actualDuration.toString());

                try {
                    const response = await fetch('/api/score-reading', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const results = await response.json();
                        displayResults(results);
                    } else {
                        const errorData = await response.json();
                        updateStatus(`Error processing audio: ${errorData.detail}`, 'warning');
                        document.getElementById('start-reading').style.display = 'inline-block';
                    }
                } catch (error) {
                    console.error('Network error:', error);
                    updateStatus('Network error. Please check connection and try again.', 'warning');
                    document.getElementById('start-reading').style.display = 'inline-block';
                }
            }

            function displayResults(results) {
                const resultsHTML = `
                    <p><strong>Words per minute:</strong> ${results.words_per_minute} WPM</p>
                    <p><strong>Accuracy:</strong> ${(results.accuracy * 100).toFixed(1)}%</p>
                    <p><strong>Words correct:</strong> ${results.words_correct} out of ${results.words_total}</p>
                    <p><strong>What you said:</strong> "${results.transcription}"</p>
                    <p><strong>Reading duration:</strong> ${results.reading_duration} seconds</p>
                `;
                
                document.getElementById('results-content').innerHTML = resultsHTML;
                document.getElementById('results').style.display = 'block';
                document.getElementById('next-story').style.display = 'inline-block';

                let message;
                const wpm = results.words_per_minute;
                const accuracy = results.accuracy * 100;

                if (accuracy < 70) {
                    message = `Good effort! Try reading a bit slower and more clearly. Accuracy: ${accuracy.toFixed(1)}%`;
                } else if (wpm < 80) {
                    message = `Great reading! Try to read a little faster next time. ${wpm} WPM is a good pace.`;
                } else if (wpm > 150) {
                    message = `Excellent speed! Make sure you're pronouncing each word clearly. ${wpm} WPM is very fast!`;
                } else {
                    message = `Perfect! ${wpm} WPM with ${accuracy.toFixed(1)}% accuracy is excellent reading! 🎉`;
                }

                updateStatus(message, accuracy > 70 ? 'success' : 'info');
            }

            async function getNextStory() {
                updateStatus('🔄 Generating your next adventure...', 'info');
                document.getElementById('next-story').style.display = 'none';
                document.getElementById('results').style.display = 'none';
                
                await loadCurrentStory();
            }

            async function checkMoodAutomatically() {
                if (!webcamStream) return;

                try {
                    const canvas = document.createElement('canvas');
                    const video = document.getElementById('webcam');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    
                    canvas.toBlob(async (blob) => {
                        const formData = new FormData();
                        formData.append('image', blob);
                        
                        const response = await fetch('/api/auto-mood-check', {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            updateMoodStatus(getMoodEmoji(result.mood_score));
                        }
                    }, 'image/jpeg', 0.8);
                    
                } catch (error) {
                    console.log('Mood check skipped:', error);
                }
            }
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/badges", response_class=HTMLResponse)
async def badges():
    """View collected badges page."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Your Badge Collection</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
                color: #333; 
                padding: 30px;
                margin: 0;
            }
            .container { 
                max-width: 1000px; 
                margin: 0 auto; 
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 {
                text-align: center;
                color: #333;
                font-size: 2.5em;
                margin-bottom: 30px;
            }
            .badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 30px;
                margin: 30px 0;
            }
            .badge-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                text-align: center;
                transition: all 0.3s;
            }
            .badge-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            }
            .badge-svg {
                margin: 15px 0;
            }
            .badge-name {
                font-size: 1.4em;
                font-weight: bold;
                margin: 15px 0;
            }
            .badge-date {
                font-size: 0.9em;
                opacity: 0.8;
            }
            .no-badges {
                text-align: center;
                padding: 60px 20px;
                background: #f8f9ff;
                border-radius: 15px;
                margin: 30px 0;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s;
                font-family: 'Comic Sans MS', cursive;
                border: none;
                cursor: pointer;
                font-size: 1.2em;
            }
            .btn:hover { 
                background: #5a67d8; 
                transform: translateY(-2px); 
            }
            .stats-banner {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin-bottom: 30px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏆 Your Badge Collection</h1>
            
            <div class="stats-banner">
                <h2 id="badge-count">🔄 Loading your achievements...</h2>
                <p id="latest-badge">Checking your latest accomplishments!</p>
            </div>
            
            <div id="badges-container">
                <div class="no-badges">
                    <div style="font-size: 3em; margin-bottom: 20px;">⏳</div>
                    <p>Loading your badges...</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="btn">🏠 Back to Home</a>
                <a href="/choose-topic" class="btn">🌟 Earn More Badges</a>
            </div>
        </div>

        <script>
            window.onload = function() {
                loadBadges();
            };

            async function loadBadges() {
                try {
                    const response = await fetch('/api/get-badges');
                    if (response.ok) {
                        const data = await response.json();
                        displayBadges(data.badges);
                        updateStats(data.badges);
                    } else {
                        showNoBadges();
                    }
                } catch (error) {
                    showNoBadges();
                }
            }

            function displayBadges(badges) {
                const container = document.getElementById('badges-container');
                
                if (badges.length === 0) {
                    showNoBadges();
                    return;
                }
                
                let html = '<div class="badges-grid">';
                badges.forEach(badge => {
                    const date = new Date(badge.earned_date).toLocaleDateString();
                    html += `
                        <div class="badge-card">
                            <div class="badge-svg">${badge.svg_data}</div>
                            <div class="badge-name">${badge.name}</div>
                            <div class="badge-description">${badge.description}</div>
                            <div class="badge-date">Earned: ${date}</div>
                            <div style="margin-top: 10px; font-size: 0.9em;">
                                Topic: ${badge.topic}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                container.innerHTML = html;
            }

            function showNoBadges() {
                document.getElementById('badges-container').innerHTML = `
                    <div class="no-badges">
                        <div style="font-size: 4em; margin-bottom: 20px;">🎯</div>
                        <h2>Ready to Earn Your First Badge!</h2>
                        <p style="font-size: 1.2em; margin: 20px 0;">Complete a Mini Hackathon to earn your first achievement badge!</p>
                        <a href="/choose-topic" class="btn" style="font-size: 1.3em;">🚀 Start Your First Hackathon</a>
                    </div>
                `;
            }

            function updateStats(badges) {
                const count = badges.length;
                let countText = count === 0 ? "No badges yet" : 
                               count === 1 ? "1 Badge Earned!" : 
                               `${count} Badges Collected!`;
                
                document.getElementById('badge-count').textContent = `🏆 ${countText}`;
                
                if (badges.length > 0) {
                    const latest = badges[badges.length - 1];
                    const latestDate = new Date(latest.earned_date).toLocaleDateString();
                    document.getElementById('latest-badge').textContent = `Latest: ${latest.name} (${latestDate})`;
                } else {
                    document.getElementById('latest-badge').textContent = 'Start your first adventure to earn badges!';
                }
            }
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/review-sessions", response_class=HTMLResponse)
async def review_sessions():
    """Review previous learning sessions."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Review Your Adventures</title>
        <style>
            body { 
                font-family: 'Comic Sans MS', cursive; 
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                color: #333; 
                padding: 30px;
                margin: 0;
            }
            .container { 
                max-width: 1000px; 
                margin: 0 auto; 
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .stats-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin: 15px 0;
                text-align: center;
            }
            .hackathon-card {
                background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin: 15px 0;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s;
            }
            .btn:hover { background: #5a67d8; transform: translateY(-2px); }
            .score-bar {
                background: rgba(255,255,255,0.3);
                height: 10px;
                border-radius: 5px;
                margin: 10px 0;
                overflow: hidden;
            }
            .score-fill {
                height: 100%;
                background: rgba(255,255,255,0.8);
                border-radius: 5px;
                transition: width 0.5s ease;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📚 Your Learning Journey</h1>
            <div id="stats-container">
                <div class="stats-card">
                    <h2>🔄 Loading your adventure history...</h2>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="btn">🏠 Back to Home</a>
                <a href="/choose-topic" class="btn">🌟 Start New Adventure</a>
                <a href="/badges" class="btn">🏆 View Badges</a>
            </div>
        </div>

        <script>
            window.onload = function() {
                loadStats();
            };

            async function loadStats() {
                try {
                    const response = await fetch('/api/get-stats');
                    if (response.ok) {
                        const stats = await response.json();
                        displayStats(stats);
                    }
                } catch (error) {
                    document.getElementById('stats-container').innerHTML = 
                        '<div class="stats-card"><h2>Unable to load stats right now</h2></div>';
                }
            }

            function displayStats(stats) {
                let html = '';
                
                if (stats.total_sessions > 0) {
                    html += `
                        <div class="stats-card">
                            <h2>🎯 Total Adventures: ${stats.total_sessions}</h2>
                            <p>Reading Sessions: ${stats.reading_sessions}</p>
                            <p>Mini Hackathons: ${stats.hackathon_sessions || 0}</p>
                        </div>
                    `;
                    
                    if (stats.avg_wpm) {
                        html += `
                            <div class="stats-card">
                                <h2>📈 Reading Progress</h2>
                                <p>Average Speed: ${stats.avg_wpm} words per minute</p>
                                <p>Best Speed: ${stats.max_wpm} WPM</p>
                                <p>Latest: ${stats.latest_wpm} WPM</p>
                            </div>
                        `;
                    }
                    
                    if (stats.hackathon_metrics) {
                        html += `
                            <div class="hackathon-card">
                                <h2>💡 Mini Hackathon Achievements</h2>
                                <p>Total Completed: ${stats.hackathon_metrics.total_completed}</p>
                                <p>Average Completion Time: ${stats.hackathon_metrics.avg_time} minutes</p>
                                <div style="margin: 15px 0;">
                                    <div>Creativity Score: ${stats.hackathon_metrics.avg_creativity}/10</div>
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${stats.hackathon_metrics.avg_creativity * 10}%"></div>
                                    </div>
                                </div>
                                <div style="margin: 15px 0;">
                                    <div>Clarity Score: ${stats.hackathon_metrics.avg_clarity}/10</div>
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${stats.hackathon_metrics.avg_clarity * 10}%"></div>
                                    </div>
                                </div>
                                <div style="margin: 15px 0;">
                                    <div>Feasibility Score: ${stats.hackathon_metrics.avg_feasibility}/10</div>
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${stats.hackathon_metrics.avg_feasibility * 10}%"></div>
                                    </div>
                                </div>
                                <p>Badges Earned: ${stats.hackathon_metrics.badges_earned}</p>
                            </div>
                        `;
                    }
                    
                    if (stats.avg_mood) {
                        const moodText = stats.avg_mood > 0.3 ? 'Happy 😊' : 
                                       stats.avg_mood > 0 ? 'Good 🙂' : 
                                       stats.avg_mood > -0.3 ? 'Neutral 😐' : 'Needs Encouragement 💪';
                        html += `
                            <div class="stats-card">
                                <h2>😊 Average Mood: ${moodText}</h2>
                                <p>Mood checks completed: ${stats.mood_checks}</p>
                            </div>
                        `;
                    }
                } else {
                    html = `
                        <div class="stats-card">
                            <h2>🌟 Ready for Your First Adventure!</h2>
                            <p>No learning sessions yet - let's start your first one!</p>
                        </div>
                    `;
                }
                
                document.getElementById('stats-container').innerHTML = html;
            }
        </script>
    </body>
    </html>
    """
    return html_content

    # =============================================================================
# API ENDPOINTS (Hidden from User)
# =============================================================================

@app.post("/start_session")
async def start_session():
    """Create a new Assistant thread and return the thread ID."""
    thread = client.beta.threads.create()
    return {"thread_id": thread.id}

@app.post("/submit_audio")
async def submit_audio(
    thread_id: str = Form(...),
    audio: UploadFile = File(...)
):
    """Score read-aloud audio and send the result to the Assistant."""
    metrics = readaloud.score(audio, passage_id="p1")
    wpm = metrics["words_per_minute"]
    errors = metrics["words_total"] - metrics["words_correct"]

    profile.snapshots.append(
        LearnerSnapshot(
            timestamp=datetime.utcnow(),
            wpm=wpm,
            activity_id="read_snippet",
        )
    )

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
    """Assess mood from an image and record the snapshot."""
    mood_score = mood.assess_image(image)

    profile.snapshots.append(
        LearnerSnapshot(
            timestamp=datetime.utcnow(),
            mood_score=mood_score,
            activity_id="face_snapshot",
        )
    )

    return {"mood_score": mood_score}

@app.get("/next_activity")
async def next_activity(thread_id: str):
    """Advance the Assistant thread and return the latest activity JSON."""
    client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=assistant_id,
    )

    messages = client.beta.threads.messages.list(thread_id=thread_id).data
    if not messages:
        return {"activity": "No activity generated yet."}

    latest = messages[0]
    content_parts = latest.content or []
    if content_parts and hasattr(content_parts[0], "text"):
        reply = content_parts[0].text.value
    else:
        reply = str(content_parts)

    cleaned = reply.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end + 1]

    try:
        json.loads(cleaned)
        reply = cleaned
    except json.JSONDecodeError:
        pass

    return {"activity": reply}

@app.post("/api/start-adventure")
async def start_adventure(request: Request):
    """Start a new learning adventure with selected topic."""
    global current_session_id
    
    try:
        data = await request.json()
        topic = data.get('topic', 'General Learning')
        
        # Create new session
        thread = client.beta.threads.create()
        session_id = thread.id
        current_session_id = session_id
        
        # Store session data
        active_sessions[session_id] = SessionData(
            session_id=session_id,
            thread_id=session_id,
            start_time=datetime.now(timezone.utc),
            current_topic=topic,
            last_mood_check=datetime.now(timezone.utc),
            reading_level=profile.reading_band.lower().replace(' ', '_'),
            current_wpm=profile.current_wpm
        )
        
        # Add topic to preferred topics
        if topic not in profile.preferred_topics:
            profile.preferred_topics.append(topic)
        
        print(f"✅ Started new adventure: {topic} (Session: {session_id})")
        return {"success": True, "session_id": session_id, "topic": topic}
        
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/start-hackathon")
async def start_hackathon(request: Request):
    """Start a new Mini Hackathon session."""
    global current_hackathon_session
    
    try:
        data = await request.json()
        topic = data.get('topic', 'General Learning')
        
        # Create new hackathon session
        session_id = str(uuid.uuid4())
        current_hackathon_session = session_id
        
        # Generate challenge story
        challenge_story = generate_challenge_story(topic, "General Challenge")
        
        # Create hackathon session
        hackathon_session = HackathonSession(
            session_id=session_id,
            topic=topic,
            challenge_story=challenge_story,
            start_time=datetime.now(timezone.utc),
            metrics=HackathonMetrics(topic=topic)
        )
        
        hackathon_sessions[session_id] = hackathon_session
        
        print(f"✅ Started new hackathon: {topic} (Session: {session_id})")
        return {"success": True, "session_id": session_id, "topic": topic}
        
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get("/api/get-hackathon-session")
async def get_hackathon_session():
    """Get current hackathon session data."""
    global current_hackathon_session
    
    if not current_hackathon_session or current_hackathon_session not in hackathon_sessions:
        raise HTTPException(status_code=404, detail="No active hackathon session")
    
    session = hackathon_sessions[current_hackathon_session]
    return {
        "session_id": session.session_id,
        "topic": session.topic,
        "challenge_story": session.challenge_story,
        "current_phase": session.current_phase,
        "completed": session.completed
    }

@app.post("/api/get-idea-spark")
async def get_idea_spark(request: Request):
    """Generate AI idea sparks for brainstorming."""
    try:
        data = await request.json()
        challenge = data.get('challenge', '')
        notes = data.get('notes', '')
        topic = data.get('topic', '')
        
        prompt = f"""You are the IdeaSpark Coach for kids aged 9-10. Based on their challenge "{challenge}" and their notes: "{notes}", provide a 20-word encouraging nudge that helps them think deeper about the problem.

Be enthusiastic, use simple language, and ask one thought-provoking question. Focus on the connection between {topic} and {challenge}.

Example: "Great thinking! How might people in {topic} face this challenge differently? What if your AI could learn from their experience?"

Provide just the encouraging spark, no extra text."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50
        )
        
        spark = response.choices[0].message.content.strip()
        return {"spark": spark}
        
    except Exception:
        return {"spark": "Great thinking! Keep exploring how AI could help solve this challenge in creative ways!"}

@app.post("/api/improve-pitch")
async def improve_pitch(request: Request):
    """Get AI writing coach suggestions for pitch improvement."""
    try:
        data = await request.json()
        pitch = data.get('pitch', '')
        challenge = data.get('challenge', '')
        
        prompt = f"""You are a friendly writing coach for a 9-10 year old. They wrote this pitch for their "{challenge}" AI solution:

"{pitch}"

Give 2-3 specific, encouraging suggestions to make their pitch stronger. Use simple language and be positive. Focus on clarity and engagement.

Format as HTML with bullet points. Example:
<ul>
<li>Great start! Try adding one specific example of how your AI would help someone.</li>
<li>Your idea is creative! Can you explain the "wow factor" in one exciting sentence?</li>
</ul>"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        
        suggestions = response.choices[0].message.content.strip()
        return {"suggestions": suggestions}
        
    except Exception:
        return {"suggestions": "<ul><li>Your pitch is off to a great start!</li><li>Try adding more details about how your AI will help people.</li><li>Make sure to explain why your solution is special!</li></ul>"}

@app.post("/api/ai-render-sketch")
async def ai_render_sketch(request: Request):
    """Convert sketch to polished diagram using GPT-4o."""
    try:
        data = await request.json()
        concept = data.get('concept', '')
        
        # For now, return a placeholder since we can't actually process images in this demo
        # In a real implementation, this would use GPT-4o vision API to interpret the sketch
        # and generate a polished diagram
        
        return {
            "image_url": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMmZmIiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiPkFJLVJlbmRlcmVkIERpYWdyYW08L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiI+Rm9yOiAke2NvbmNlcHR9PC90ZXh0Pgo8L3N2Zz4K",
            "description": f"AI-rendered diagram for {concept}"
        }
        
    except Exception:
        return {"error": "AI rendering temporarily unavailable"}

@app.post("/api/score-pitch")
async def score_pitch(
    audio: UploadFile = File(...),
    challenge: str = Form(...)
):
    """Score pitch audio and return metrics."""
    try:
        scores = score_pitch_audio(audio, challenge)
        
        # Update hackathon session with scores
        if current_hackathon_session and current_hackathon_session in hackathon_sessions:
            session = hackathon_sessions[current_hackathon_session]
            session.metrics.clarity_score = scores.get('clarity_score', 7.0)
            session.metrics.creativity_score = scores.get('creativity_score', 7.0)
            session.metrics.feasibility_score = scores.get('feasibility_score', 7.0)
            session.pitch_transcription = scores.get('transcription', '')
        
        return scores
        
    except Exception as e:
        print(f"❌ Error scoring pitch: {e}")
        return {
            "clarity_score": 7.0,
            "creativity_score": 7.0,
            "feasibility_score": 7.0,
            "feedback": "Great effort on your pitch!",
            "transcription": "Could not process audio"
        }

@app.post("/api/get-shark-questions")
async def get_shark_questions(request: Request):
    """Generate Shark Bot investor questions."""
    try:
        data = await request.json()
        challenge = data.get('challenge', '')
        pitch = data.get('pitch', '')
        
        prompt = f"""You are 3 AI investors (Shark Bots) evaluating a kid's AI solution for "{challenge}".
Their pitch is: "{pitch}"


Generate 3 follow-up questions that are:
- Age-appropriate for a 9-10 year old
- Focus on feasibility, ethics, and cost
- Encouraging but challenging
- Easy to understand

Return as JSON:
{{"questions": [
  {{"investor": "Tech Shark", "question": "How would you make sure your AI is safe for kids to use?"}},
  {{"investor": "Money Shark", "question": "What would it cost to build your AI solution?"}},
  {{"investor": "Impact Shark", "question": "How would you know if your AI is really helping people?"}}
]}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        
        try:
            questions_data = json.loads(response.choices[0].message.content)
            return questions_data
        except json.JSONDecodeError:
            # Fallback questions
            return {
                "questions": [
                    {"investor": "Tech Shark", "question": "How would you make sure your AI is safe and helpful?"},
                    {"investor": "Money Shark", "question": "What resources would you need to build this?"},
                    {"investor": "Impact Shark", "question": "How would you measure if your solution is working?"}
                ]
            }
        
    except Exception:
        return {
            "questions": [
                {"investor": "Tech Shark", "question": "How would your AI learn and get better over time?"},
                {"investor": "Money Shark", "question": "What would be the most expensive part to build?"},
                {"investor": "Impact Shark", "question": "How many people do you think this could help?"}
            ]
        }

@app.post("/api/generate-badge")
async def generate_badge(request: Request):
    """Generate achievement badge for completed hackathon."""
    try:
        data = await request.json()
        challenge = data.get('challenge', 'AI Innovator')
        topic = data.get('topic', 'Technology')
        
        # Generate SVG badge
        svg_data = generate_badge_svg(challenge, topic)
        
        # Create badge object
        badge = Badge(
            id=str(uuid.uuid4()),
            name=f"{challenge} Champion",
            description=f"Completed a Mini Hackathon focused on {challenge} solutions!",
            svg_data=svg_data,
            earned_date=datetime.now(timezone.utc),
            topic=topic
        )
        
        # Add to profile
        profile.badges.append(badge)
        
        return {
            "name": badge.name,
            "description": badge.description,
            "svg": badge.svg_data
        }
        
    except Exception:
        return {
            "name": f"{challenge} Champion",
            "description": "Completed a Mini Hackathon!",
            "svg": f'''<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" fill="#4CAF50" stroke="#333" stroke-width="3"/>
                <text x="100" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">{challenge}</text>
                <text x="100" y="130" text-anchor="middle" fill="white" font-family="Arial" font-size="24">🏆</text>
            </svg>'''
        }

@app.get("/api/get-badges")
async def get_badges():
    """Get all earned badges."""
    badges_data = []
    for badge in profile.badges:
        badges_data.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "svg_data": badge.svg_data,
            "earned_date": badge.earned_date.isoformat(),
            "topic": badge.topic
        })
    
    return {"badges": badges_data}

@app.get("/api/get-final-scores")
async def get_final_scores():
    """Get final hackathon scores."""
    if current_hackathon_session and current_hackathon_session in hackathon_sessions:
        session = hackathon_sessions[current_hackathon_session]
        return {
            "clarity_score": session.metrics.clarity_score,
            "creativity_score": session.metrics.creativity_score,
            "feasibility_score": session.metrics.feasibility_score,
            "feedback": "Excellent work on your hackathon! You showed great creativity and problem-solving skills."
        }
    
    return {
        "clarity_score": 8.0,
        "creativity_score": 8.5,
        "feasibility_score": 7.5,
        "feedback": "Great job completing your hackathon challenge!"
    }

@app.post("/api/save-hackathon-progress")
async def save_hackathon_progress(request: Request):
    """Save hackathon progress."""
    try:
        data = await request.json()
        session_id = data.get('session_id')
        phase = data.get('phase')
        hackathon_data = data.get('data')
        
        if session_id in hackathon_sessions:
            session = hackathon_sessions[session_id]
            session.current_phase = phase
            
            # Update session data based on phase
            if 'avatar' in hackathon_data:
                session.avatar = hackathon_data['avatar']
            if 'selectedChallenge' in hackathon_data:
                session.selected_challenge = hackathon_data['selectedChallenge']
            if 'brainstormNotes' in hackathon_data:
                session.brainstorm_notes = hackathon_data['brainstormNotes']
            if 'conceptData' in hackathon_data:
                session.concept_data = hackathon_data['conceptData']
            if 'sketchData' in hackathon_data:
                session.sketch_data = hackathon_data['sketchData']
            if 'onePagerText' in hackathon_data:
                session.one_pager_text = hackathon_data['onePagerText']
        
        return {"success": True}
        
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/complete-hackathon")
async def complete_hackathon(request: Request):
    """Complete hackathon and save final metrics."""
    try:
        data = await request.json()
        session_id = data.get('session_id')
        
        if session_id in hackathon_sessions:
            session = hackathon_sessions[session_id]
            session.completed = True
            
            # Calculate completion time
            completion_time = (datetime.now(timezone.utc) - session.start_time).total_seconds() / 60
            session.metrics.completion_time = int(completion_time)
            
            # Add to profile
            profile.hackathon_sessions.append(session)
            
            # Create learning snapshot
            snapshot = LearnerSnapshot(
                timestamp=datetime.now(timezone.utc),
                activity_id="mini_hackathon",
                topic=session.topic,
                reading_level=profile.reading_band.lower().replace(' ', '_')
            )
            profile.snapshots.append(snapshot)
            
            # Store in Pinecone
            store_snapshot_in_pinecone(snapshot, profile.name)
        
        return {"success": True}
        
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get("/api/get-current-story")
async def get_current_story():
    """Get current story for the active session."""
    global current_session_id
    
    if not current_session_id or current_session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="No active session")
    
    session = active_sessions[current_session_id]
    
    # Generate new story based on current topic and reading level
    story = generate_story_for_topic(
        session.current_topic, 
        session.reading_level,
        session.current_wpm
    )
    
    return story

@app.post("/api/score-reading")
async def score_reading_api(
    audio: UploadFile = File(...),
    passage: str = Form(...),
    actual_duration: Optional[str] = Form(None)
):
    """Score reading performance and update user profile."""
    global current_session_id
    
    if not current_session_id:
        raise HTTPException(status_code=404, detail="No active session")
    
    try:
        print(f"🎤 Processing audio file: {audio.filename}, size: {audio.size} bytes")
        
        # Score the reading
        metrics = score_reading(audio, passage_text=passage)
        wpm = metrics["words_per_minute"]
        accuracy = metrics["accuracy"]
        
        # If we have actual duration from frontend, use it to double-check
        if actual_duration:
            try:
                frontend_duration = float(actual_duration)
                target_words = len(passage.split())
                frontend_wpm = int((target_words / frontend_duration) * 60) if frontend_duration > 0 else 0
                
                print(f"🕐 Frontend duration: {frontend_duration:.1f}s, Frontend WPM: {frontend_wpm}")
                print(f"🤖 Backend calculation: {metrics['reading_duration']:.1f}s, Backend WPM: {wpm}")
                
                # Use frontend timing if it seems more reasonable
                if 50 <= frontend_wpm <= 200 and (wpm > 200 or wpm < 30):
                    print("📊 Using frontend timing as it seems more accurate")
                    wpm = frontend_wpm
                    metrics["words_per_minute"] = wpm
                    metrics["reading_duration"] = frontend_duration
                    
            except ValueError:
                print("⚠️ Could not parse frontend duration")
        
        # Update session data
        session = active_sessions[current_session_id]
        session.current_wpm = wpm
        session.stories_completed += 1
        
        # Assess and update reading level
        new_reading_level = assess_reading_level(wpm, accuracy)
        session.reading_level = new_reading_level
        
        # Update global profile
        profile.current_wpm = wpm
        profile.reading_band = new_reading_level.replace('_', ' ').title()
        
        # Record snapshot
        snapshot = LearnerSnapshot(
            timestamp=datetime.now(timezone.utc),
            wpm=wpm,
            activity_id="story_reading",
            topic=session.current_topic,
            reading_level=new_reading_level
        )
        profile.snapshots.append(snapshot)
        
        # Store in Pinecone
        store_snapshot_in_pinecone(snapshot, profile.name)
        
        print(f"✅ Reading scored: {wpm} WPM, {accuracy:.1%} accuracy, level: {new_reading_level}")
        return {
            "status": "success",
            **metrics,
            "reading_level": new_reading_level,
            "level_updated": new_reading_level != session.reading_level
        }
        
    except Exception as e:
        print(f"❌ Error scoring reading: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score reading: {e}")

@app.post("/api/auto-mood-check")
async def auto_mood_check(image: UploadFile = File(...)):
    """Automatic mood assessment from webcam."""
    global current_session_id
    
    if not current_session_id:
        return {"mood_score": 0.0, "message": "No active session"}
    
    try:
        # Assess mood
        mood_score = assess_mood_from_image(image)
        
        # Update session
        session = active_sessions[current_session_id]
        session.last_mood_check = datetime.now(timezone.utc)
        session.mood_check_count += 1
        
        # Record snapshot
        snapshot = LearnerSnapshot(
            timestamp=datetime.now(timezone.utc),
            mood_score=mood_score,
            activity_id="auto_mood_check",
            topic=session.current_topic
        )
        profile.snapshots.append(snapshot)
        
        # Store in Pinecone
        store_snapshot_in_pinecone(snapshot, profile.name)
        
        # Check if intervention needed
        needs_break = mood_score < -0.5
        
        return {
            "mood_score": mood_score,
            "needs_break": needs_break,
            "message": "Mood assessed successfully"
        }
        
    except Exception as e:
        print(f"Auto mood check error: {e}")
        return {"mood_score": 0.0, "message": "Mood check failed"}

@app.get("/api/get-stats")
async def get_stats():
    """Get learning statistics for review page."""
    if not profile.snapshots and not profile.hackathon_sessions:
        return {"total_sessions": 0, "message": "No learning data available yet"}
    
    # Calculate statistics
    reading_snapshots = [s for s in profile.snapshots if s.wpm is not None]
    mood_snapshots = [s for s in profile.snapshots if s.mood_score is not None]
    hackathon_count = len(profile.hackathon_sessions)
    
    stats = {
        "total_sessions": len(profile.snapshots) + hackathon_count,
        "reading_sessions": len(reading_snapshots),
        "hackathon_sessions": hackathon_count,
        "mood_checks": len(mood_snapshots),
        "current_reading_level": profile.reading_band,
        "favorite_topics": profile.preferred_topics[:3] if profile.preferred_topics else []
    }
    
    if reading_snapshots:
        wpms = [s.wpm for s in reading_snapshots]
        stats.update({
            "avg_wpm": round(sum(wpms) / len(wpms), 1),
            "max_wpm": max(wpms),
            "latest_wpm": wpms[-1],
            "wpm_improvement": wpms[-1] - wpms[0] if len(wpms) > 1 else 0
        })
    
    if mood_snapshots:
        moods = [s.mood_score for s in mood_snapshots]
        stats.update({
            "avg_mood": round(sum(moods) / len(moods), 2),
            "latest_mood": moods[-1]
        })
    
    # Hackathon metrics
    if profile.hackathon_sessions:
        completed_sessions = [s for s in profile.hackathon_sessions if s.completed]
        if completed_sessions:
            avg_creativity = sum(s.metrics.creativity_score for s in completed_sessions) / len(completed_sessions)
            avg_clarity = sum(s.metrics.clarity_score for s in completed_sessions) / len(completed_sessions)
            avg_feasibility = sum(s.metrics.feasibility_score for s in completed_sessions) / len(completed_sessions)
            avg_time = sum(s.metrics.completion_time for s in completed_sessions) / len(completed_sessions)
            
            stats["hackathon_metrics"] = {
                "total_completed": len(completed_sessions),
                "avg_creativity": round(avg_creativity, 1),
                "avg_clarity": round(avg_clarity, 1),
                "avg_feasibility": round(avg_feasibility, 1),
                "avg_time": round(avg_time, 0),
                "badges_earned": len(profile.badges)
            }
    
    return stats

# =============================================================================
# SYSTEM ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """System health check."""
    return {
        "status": "healthy",
        "active_sessions": len(active_sessions),
        "current_session": current_session_id,
        "hackathon_sessions": len(hackathon_sessions),
        "current_hackathon": current_hackathon_session,
        "total_snapshots": len(profile.snapshots),
        "badges_earned": len(profile.badges)
    }

@app.get("/api/reset-session")
async def reset_session():
    """Reset current session (for testing)."""
    global current_session_id, active_sessions, current_hackathon_session, hackathon_sessions
    current_session_id = None
    current_hackathon_session = None
    active_sessions.clear()
    hackathon_sessions.clear()
    return {"message": "All sessions reset successfully"}

# =============================================================================
# ASSISTANT INTEGRATION
# =============================================================================

# System prompt for contextual learning
SYSTEM_PROMPT = """You are Karl's adaptive learning coach. You create personalized activities based on his interests and performance.

### Current Profile
{profile}

### Current Session Topic
{topic}

### Rules
1. Keep activities 5-8 minutes max
2. Adapt difficulty based on reading performance
3. If mood score < -0.4, suggest a fun break activity
4. Always include a "read_aloud" section with 40-60 words
5. Make content relevant to the chosen topic

Response format (JSON only):
{
  "title": "Activity Title",
  "story_prompt": "Engaging context for the activity",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "read_aloud": "Text for Karl to read (40-60 words)",
  "reward_token": false
}"""

# Create OpenAI Assistant
try:
    assistant = client.beta.assistants.create(
        name="Karl-Learning-Adaptive-Coach",
        model="gpt-4o-mini",
        tools=[{"type": "code_interpreter"}],
        instructions=SYSTEM_PROMPT.replace("{profile}", json.dumps(profile.model_dump())).replace("{topic}", "General Learning")
    )
    assistant_id = assistant.id
    print(f"✅ Created Adaptive Learning Assistant: {assistant_id}")
except Exception as e:
    print(f"❌ Failed to create assistant: {e}")
    assistant_id = None

# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    print("🚀 Starting Karl Learning GPT - with Mini Hackathon...")
    print(f"👤 Profile: {profile.name}, Grade {profile.grade}")
    print(f"📈 Current Reading Level: {profile.reading_band}")
    print(f"🎯 Current WPM Target: {profile.current_wpm}")
    print(f"🏆 Badges Earned: {len(profile.badges)}")
    print(f"💡 Hackathons Completed: {len(profile.hackathon_sessions)}")
    
    # Store initial profile in Pinecone
    if os.getenv("PINECONE_API_KEY"):
        try:
            index = pc.Index("karl-profile")
            profile_text = f"""
            Learner Profile - {profile.name}
            Grade: {profile.grade}
            Reading Level: {profile.reading_band}
            Current WPM: {profile.current_wpm}
            Learning Preferences: Visual {profile.modality.visual}%, Audio {profile.modality.audio}%, Kinesthetic {profile.modality.kinesthetic}%
            ADHD Accommodations: {profile.adhd}
            Preferred Topics: {', '.join(profile.preferred_topics) if profile.preferred_topics else 'None yet'}
            Badges Earned: {len(profile.badges)}
            Hackathons Completed: {len(profile.hackathon_sessions)}
            """
            
            embedding = embed_text(profile_text)
            index.upsert([
                (f"karl-profile-initial-{datetime.now(timezone.utc).isoformat()}", embedding, {
                    "text": profile_text,
                    "profile_type": "initial_setup",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            ])
            print("📡 Initial profile stored in Pinecone")
        except Exception as e:
            print(f"⚠️ Pinecone storage failed: {e}")
    
    # Run the server
    # Launch the FastAPI app. The previous module path referenced
    # ``karl_learning_consolidated`` which no longer exists in this repo.
    # Using ``app:app`` ensures Uvicorn can locate the application object
    # defined in this file.
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
