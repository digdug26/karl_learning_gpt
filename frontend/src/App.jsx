import { useState, useEffect } from 'react';
import axios from 'axios';

import AudioRecorder from './AudioRecorder';
import WebcamSnap from './WebcamSnap';
import ActivityBox from './ActivityBox';
import SessionTimer from './components/SessionTimer';
import TypingHomeRow from './components/TypingHomeRow';
import ComicPad from './components/ComicPad';

const profile = { attention: { session_max_minutes: 30 } };

export default function App() {
  const [threadId, setThreadId] = useState(null);
  const [activity, setActivity] = useState(null);
  const [moodScore, setMoodScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComic, setShowComic] = useState(false);
  const readAloudText = activity?.read_aloud || "";

  useEffect(() => {
    const openComic = () => setShowComic(true);
    window.addEventListener('comic-break', openComic);
    return () => window.removeEventListener('comic-break', openComic);
  }, []);

  const handleTypingDone = (correct) => {
    console.log('typing complete', correct);
  };

  const endSession = () => {
    setThreadId(null);
    setActivity(null);
    setMoodScore(null);
  };


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
        <SessionTimer maxMinutes={profile.attention.session_max_minutes} onHardCap={endSession}>
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
          <TypingHomeRow onFinish={handleTypingDone} />
        </>
        </SessionTimer>
      )}
      <ComicPad open={showComic} onClose={() => setShowComic(false)} />
    </main>
  );
}
