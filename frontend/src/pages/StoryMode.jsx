import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Mic, 
  Camera, 
  SkipForward, 
  Clock,
  Award,
  Loader2,
  Play,
  AlertCircle
} from 'lucide-react';

import { Button } from '../components/ui/button';
import AudioRecorder from '../AudioRecorder';
import WebcamSnap from '../WebcamSnap';
import ActivityBox from '../ActivityBox';
import SessionTimer from '../components/SessionTimer';
import TypingHomeRow from '../components/TypingHomeRow';
import ComicPad from '../components/ComicPad';

const profile = { attention: { session_max_minutes: 30 } };

export default function StoryMode({ onBack }) {
  const [threadId, setThreadId] = useState(null);
  const [activity, setActivity] = useState(null);
  const [moodScore, setMoodScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComic, setShowComic] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const readAloudText = activity?.read_aloud || "";

  useEffect(() => {
    const openComic = () => setShowComic(true);
    window.addEventListener('comic-break', openComic);
    return () => window.removeEventListener('comic-break', openComic);
  }, []);

  const handleTypingDone = (correct) => {
    // Placeholder for future typing completion handling
  };

  const endSession = () => {
    setThreadId(null);
    setActivity(null);
    setMoodScore(null);
    setSessionStarted(false);
    setError('');
  };

  // Start a session and fetch the first activity
  const newSession = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post('/api/start_session');
      setThreadId(data.thread_id);
      setSessionStarted(true);

      const actRes = await axios.get('/api/next_activity', {
        params: { thread_id: data.thread_id }
      });
      try {
        setActivity(JSON.parse(actRes.data.activity));
      } catch (err) {
        console.error('Failed to parse activity:', err);
        setError('Failed to load activity. Please try again.');
        setActivity(null);
      }
    } catch (e) {
      console.error("Error starting session:", e);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the next activity
  const fetchActivity = async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/next_activity', {
        params: { thread_id: threadId }
      });
      try {
        setActivity(JSON.parse(data.activity));
      } catch (err) {
        console.error('Failed to parse activity:', err);
        setError('Failed to load next activity. Please try again.');
        setActivity(null);
      }
    } catch (e) {
      console.error("Error fetching activity:", e);
      setError('Failed to fetch activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionStarted) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Story Mode</h1>
              <p className="text-lg text-slate-600">Interactive Learning Adventures</p>
            </div>
          </div>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Ready for Your Learning Adventure?
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Get ready to explore amazing stories, practice reading skills, and engage in fun learning activities. 
            Each session is personalized just for you and includes reading practice, interactive exercises, and progress tracking.
          </p>
          
          <Button
            size="lg"
            onClick={newSession}
            disabled={loading}
            className="mb-4"
          