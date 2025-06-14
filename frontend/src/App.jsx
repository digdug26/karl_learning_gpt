import { useState } from 'react';
import axios from 'axios';

import AudioRecorder from './AudioRecorder';
import WebcamSnap from './WebcamSnap';
import ActivityBox from './ActivityBox';

export default function App() {
  const [threadId, setThreadId] = useState(null);
  const [activity, setActivity] = useState(null);
  const [moodScore, setMoodScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const readAloudText = activity?.read_aloud || "";


  // 1️⃣ Start a session and fetch the first activity
  const newSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/start_session');
      setThreadId(data.thread_id);

      const actRes = await axios.get('/api/next_activity', {
        params: { thread_id: data.thread_id }
      });
      setActivity(JSON.parse(actRes.data.activity));
    } catch (e) {
      console.error("Error starting session:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Fetch the next activity (used after audio or by button)
  const fetchActivity = async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      const { data } = await axios.get('/api/next_activity', {
        params: { thread_id: threadId }
      });
      setActivity(JSON.parse(data.activity));
    } catch (e) {
      console.error("Error fetching activity:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      {!threadId ? (
        <button onClick={newSession} disabled={loading}>
          🚀 Start Karl’s Adventure
        </button>
      ) : (
        <>
          <div className="mb-4">
            <AudioRecorder
              threadId={threadId}
              passageText={readAloudText}
              afterSubmit={fetchActivity}
            />
            <WebcamSnap
              threadId={threadId}
              onMood={setMoodScore}
            />
          </div>

          {/* Show mood score if we have one */}
          {moodScore !== null && (
            <p className="mb-4">🧠 Mood score: {moodScore}</p>
          )}

          <button
            className="mb-4"
            onClick={fetchActivity}
            disabled={loading}
          >
            ⏭️ Next Task
          </button>

          {/* Show the current activity */}
          <ActivityBox data={activity} />
        </>
      )}
    </main>
  );
}
