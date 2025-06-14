import { useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function WebcamSnap({ threadId, onMood }) {
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
    <div className="inline-block mr-4">
      <Webcam
        ref={camRef}
        audio={false}
        screenshotFormat="image/png"
        width={0}
        height={0}
      />
      <button onClick={shoot}>📸 Mood check</button>
    </div>
  );
}
