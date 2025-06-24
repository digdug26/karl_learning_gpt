import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './components/ui/button';
import axios from 'axios';

export default function AudioRecorder({
  threadId,
  passageText,
  afterSubmit,
  className,
  startLabel = 'Start Reading',
  stopLabel = 'Stop Recording'
}) {
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
        const { data } = await axios.post('/api/submit_audio', form);
        afterSubmit(data);
        setRecorder(null);
        setIsRecording(false);
      };

      rec.start();
      setRecorder(rec);
      setIsRecording(true);
    } catch (e) {
      console.error('Audio record failed:', e);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      recorder.stream?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className={className}>
      {!isRecording ? (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="energy"
            size="lg"
            onClick={startRecording}
            className="min-w-[140px] shadow-glow-orange"
          >
            <Mic size={24} className="mr-2" />
            {startLabel}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0.4)', '0 0 0 10px rgba(249, 115, 22, 0)'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={stopRecording}
            className="min-w-[140px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <MicOff size={24} className="mr-2" />
            {stopLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
