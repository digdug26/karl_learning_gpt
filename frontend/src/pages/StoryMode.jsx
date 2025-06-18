import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Mic, 
  MicOff, 
  Camera, 
  SkipForward, 
  Home,
  Clock,
  Award,
  Loader2
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
  const [showComic, setShowComic] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
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
    setSessionStarted(false);
  };

  // Start a session and fetch the first activity
  const newSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/start_session');
      setThreadId(data.thread_id);
      setSessionStarted(true);

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

  // Fetch the next activity
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
    <div className="min-h-screen bg-gradient-to-br from-lightMist via-sky-50 to-adventure-50 relative">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_theme(colors.ocean.300),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_theme(colors.adventure.300),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        
        {/* Header with session info */}
        {sessionStarted && (
          <motion.div
            className="mb-8 flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-white/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <SessionTimer maxMinutes={profile.attention.session_max_minutes} onHardCap={endSession}>
                  {({ elapsed, maxMinutes }) => (
                    <div>
                      <h3 className="font-display font-semibold text-lg text-comicInk">
                        Learning Session Active
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Time: {elapsed}/{maxMinutes} minutes
                      </p>
                    </div>
                  )}
                </SessionTimer>
              </div>
            </div>

            {moodScore !== null && (
              <motion.div
                className="flex items-center gap-3 bg-adventure-100 rounded-xl p-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Award size={20} className="text-adventure-600" />
                <span className="font-semibold text-adventure-700">
                  Mood: {moodScore}/10
                </span>
              </motion.div>
            )}

            <Button
              variant="utility"
              size="sm"
              onClick={onBack}
              className="hover:shadow-medium"
            >
              <Home size={16} className="mr-2" />
              Exit
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex flex-col items-center">
          
          {!sessionStarted ? (
            /* Welcome Screen */
            <motion.div
              className="text-center max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-12">
                <h1 className="font-display text-5xl font-bold text-comicInk mb-4">
                  Story Mode
                </h1>
                <h2 className="font-display text-3xl font-semibold bg-gradient-to-r from-adventure-600 to-ocean-600 bg-clip-text text-transparent mb-6">
                  Ready for Adventure?
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Get ready to read amazing stories, practice your skills, and have tons of fun! 
                  Karl is excited to learn with you today.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="hero"
                  size="xxl"
                  onClick={newSession}
                  loading={loading}
                  className="shadow-2xl hover:shadow-glow-blue border-4 border-ocean-300"
                >
                  <Rocket size={40} className="mr-4" />
                  <span className="text-white font-bold">
                    {loading ? "Starting Adventure..." : "🚀 Start Karl's Adventure"}
                  </span>
                </Button>
              </motion.div>

              <p className="mt-6 text-gray-600 font-medium">
                Click to begin your personalized learning session!
              </p>
            </motion.div>
          ) : (
            /* Active Session Interface */
            <div className="w-full max-w-4xl space-y-8">
              
              {/* Action Buttons Row */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Audio Recording */}
                <div className="flex flex-col items-center">
                  <AudioRecorder
                    threadId={threadId}
                    passageText={readAloudText}
                    afterSubmit={fetchActivity}
                    className="mb-2"
                  />
                  <span className="text-sm font-medium text-gray-600">Record Reading</span>
                </div>

                {/* Mood Check */}
                <div className="flex flex-col items-center">
                  <WebcamSnap
                    threadId={threadId}
                    onMood={setMoodScore}
                    className="mb-2"
                  />
                  <span className="text-sm font-medium text-gray-600">Mood Check</span>
                </div>

                {/* Next Activity */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="energy"
                    size="lg"
                    onClick={fetchActivity}
                    loading={loading}
                    className="mb-2 min-w-[140px]"
                  >
                    {loading ? (
                      <Loader2 size={24} className="animate-spin mr-2" />
                    ) : (
                      <SkipForward size={24} className="mr-2" />
                    )}
                    Next Task
                  </Button>
                  <span className="text-sm font-medium text-gray-600">Continue</span>
                </div>
              </motion.div>

              {/* Activity Display */}
              <AnimatePresence mode="wait">
                {activity && (
                  <motion.div
                    key={activity.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ActivityBox data={activity} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing Practice */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="font-display font-semibold text-xl text-comicInk mb-4 text-center">
                  ⌨️ Quick Typing Practice
                </h3>
                <TypingHomeRow onFinish={handleTypingDone} />
              </motion.div>
            </div>
          )}
        </div>

        {/* Comic Break Modal */}
        <AnimatePresence>
          {showComic && (
            <ComicPad 
              open={showComic} 
              onClose={() => setShowComic(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>