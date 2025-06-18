// Enhanced ActivityBox.jsx
import { motion } from 'framer-motion';
import { Book, Target, Gift } from 'lucide-react';

export function ActivityBox({ data }) {
  if (!data) return null;

  const { title, story_prompt, steps, read_aloud, reward_token } = data;

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-3xl shadow-large w-full max-w-4xl mx-auto overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-500 to-adventure-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Book size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">{title}</h2>
            <p className="text-white/90 font-medium">Your current adventure task</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Story Prompt */}
        {story_prompt && (
          <motion.div
            className="bg-gradient-to-r from-hero-50 to-adventure-50 rounded-2xl p-6 border border-hero-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-3 flex items-center gap-2">
              <Target size={20} className="text-hero-600" />
              Story Setup
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">{story_prompt}</p>
          </motion.div>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-energy-50 to-sunshine-50 rounded-2xl p-6 border border-energy-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-4 flex items-center gap-2">
              📋 What to Do
            </h3>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-gray-700 text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <span className="w-8 h-8 bg-energy-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Read Aloud Section */}
        {read_aloud && (
          <motion.div
            className="bg-gradient-to-r from-adventure-50 to-ocean-50 rounded-2xl p-6 border-l-4 border-adventure-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-4 flex items-center gap-2">
              🎤 Read This Out Loud
            </h3>
            <blockquote className="text-gray-800 text-xl leading-relaxed font-medium italic bg-white/60 p-4 rounded-xl border border-white/80">
              "{read_aloud}"
            </blockquote>
            <p className="text-sm text-gray-600 mt-3 font-medium">
              💡 Tip: Click the microphone button above to record yourself reading!
            </p>
          </motion.div>
        )}

        {/* Reward Token */}
        {reward_token && (
          <motion.div
            className="bg-gradient-to-r from-sunshine-400 to-energy-400 rounded-2xl p-6 text-center border-2 border-sunshine-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="flex items-center justify-center gap-3">
              <Gift size={32} className="text-white" />
              <span className="font-display text-2xl font-bold text-white">
                🎉 Awesome! You earned a reward!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced AudioRecorder.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

export function AudioRecorder({ threadId, passageText, afterSubmit, className }) {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      rec.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'read.webm', { type: 'audio/webm' });
        const form = new FormData();
        form.append('thread_id', threadId);
        form.append('passage', passageText);  
        form.append('audio', file);
        await axios.post('/api/submit_audio', form);
        afterSubmit();
        setRecorder(null);
        setIsRecording(false);
      };

      rec.start();
      setRecorder(rec);
      setIsRecording(true);
    } catch (e) {
      console.error("Audio record failed:", e);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      // Stop all tracks to free up the microphone
      recorder.stream?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className={className}>
      {!isRecording ? (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="energy"
            size="lg"
            onClick={startRecording}
            className="min-w-[140px] shadow-glow-orange"
          >
            <Mic size={24} className="mr-2" />
            Start Reading
          </Button>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: ["0 0 0 0 rgba(249, 115, 22, 0.4)", "0 0 0 10px rgba(249, 115, 22, 0)"]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={stopRecording}
            className="min-w-[140px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <MicOff size={24} className="mr-2" />
            Stop Recording
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced WebcamSnap.jsx
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Smile } from 'lucide-react';
import { Button } from './ui/button';
import Webcam from 'react-webcam';
import axios from 'axios';

export function WebcamSnap({ threadId, onMood, className }) {
  const camRef = useRef();

  const shoot = async () => {
    try {
      const imageSrc = camRef.current.getScreenshot();
      const blob = await (await fetch(imageSrc)).blob();
      const form = new FormData();
      form.append('thread_id', threadId);
      form.append('image', new File([blob], 'snap.png'));
      const res = await axios.post('/api/submit_mood', form);
      onMood(res.data.mood_score);
    } catch (e) {
      console.error("Mood check failed:", e);
    }
  };

  return (
    <div className={className}>
      <Webcam
        ref={camRef}
        audio={false}
        screenshotFormat="image/png"
        width={0}
        height={0}
        style={{ display: 'none' }}
      />
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="adventure"
          size="lg"
          onClick={shoot}
          className="min-w-[140px] shadow-glow-green"
        >
          <Camera size={24} className="mr-2" />
          Mood Check
        </Button>
      </motion.div>
    </div>
  );
}

// Enhanced ComicPad.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function ComicPad({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto border-4 border-hero-200"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-hero-500 to-energy-500 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Comic Break Time!</h2>
                    <p className="text-white/90">Time for some creative fun!</p>
                  </div>
                </div>
                
                <Button
                  variant="utility"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Sparkles size={64} className="text-sunshine-500 mx-auto mb-4" />
              </motion.div>
              
              <h3 className="font-display text-3xl font-bold text-comicInk">
                Awesome Learning Time!
              </h3>
              
              <p className="text-xl text-gray-700 leading-relaxed max-w-md mx-auto">
                You've been learning for 20 minutes! Time for a quick creative break to recharge your brain. 
                Draw, imagine, or just take a deep breath!
              </p>

              <div className="bg-gradient-to-r from-sunshine-100 to-energy-100 rounded-2xl p-6 border-2 border-sunshine-200">
                <p className="font-semibold text-lg text-comicInk mb-2">
                  🎨 Quick Creative Challenge:
                </p>
                <p className="text-gray-700">
                  Draw Karl on his next adventure! What amazing place will he explore?
                </p>
              </div>

              <Button
                variant="hero"
                size="lg"
                onClick={onClose}
                className="shadow-glow-blue"
              >
                <Sparkles size={24} className="mr-2" />
                Back to Learning!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}