import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from './components/ui/button';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function WebcamSnap({ threadId, onMood, className }) {
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
      console.error('Mood check failed:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (threadId) {
        shoot();
      }
    }, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [threadId]);

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

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
