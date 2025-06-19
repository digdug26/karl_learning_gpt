from fastapi.testclient import TestClient
import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))
from backend.main import app

client = TestClient(app)

def setup_module(module):
    data_dir = pathlib.Path(__file__).resolve().parents[1] / 'backend' / 'data'
    for name in ['journal_entries.json', 'journal_badges.json']:
        path = data_dir / name
        if path.exists():
            path.unlink()

def test_journal_flow():
    resp = client.post('/journal-entry', json={'user_id': 'tester', 'entry': 'My day was great.'})
    assert resp.status_code == 200
    data = resp.json()
    assert 'entry_id' in data and 'question' in data

    entry_id = data['entry_id']
    resp = client.post('/journal-reflection', json={'entry_id': entry_id, 'reflection': 'I enjoyed coding.'})
    assert resp.status_code == 200
    saved = resp.json()['entry']
    assert saved['reflection'] == 'I enjoyed coding.'

    # create four more entries to trigger badge
    for i in range(4):
        resp = client.post('/journal-entry', json={'user_id': 'tester', 'entry': f'Entry {i}'})
        assert resp.status_code == 200
    last = resp.json()
    assert 'badge' in last and last['badge']['streak'] == 5
