from fastapi.testclient import TestClient
import json, pathlib, sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from backend.main import app

client = TestClient(app)
profile = json.load(open(pathlib.Path(__file__).parent/'../backend/data/profile.json'))


def test_next_session():
    resp = client.post('/next-session', json={"profile": profile, "recent_metrics": {}})
    assert resp.status_code == 200
    for key in ["intro","reading_text","math_quest","typing_text","comic_prompt"]:
        assert key in resp.json()
