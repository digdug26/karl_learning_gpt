import { useState } from 'react';
import axios from 'axios';

export default function AudioRecorder({ threadId, passageText, afterSubmit }) {
  const [recorder, setRecorder] = useState(null);

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
        setRecorder(null);      // 🔑 change back to “Start reading”
      };

      rec.start();
      setRecorder(rec);
    } catch (e) {
      console.error("Audio record failed:", e);
    }
  };

  return (
    <div className="inline-block mr-4">
      {!recorder ? (
        <button onClick={startRecording}>🎙️ Start reading</button>
      ) : (
        <button onClick={() => recorder.stop()}>⏹️ Stop</button>
      )}
    </div>
  );
}
