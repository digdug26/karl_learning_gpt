from fastapi.testclient import TestClient
import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from backend.main import app

client = TestClient(app)


def test_story_prompt():
    resp = client.get('/story-prompt')
    assert resp.status_code == 200
    assert 'prompt' in resp.json()


def test_submit_story():
    payload = {"user_id": "tester", "prompt": "A penguin", "story_text": "finds treasure"}
    resp = client.post('/submit-story', json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert 'story_id' in data and 'img_url' in data
    assert data['img_url'].endswith('.jpeg')
    img_path = pathlib.Path(data['img_url'])
    assert img_path.exists()
    img_path.unlink(missing_ok=True)
