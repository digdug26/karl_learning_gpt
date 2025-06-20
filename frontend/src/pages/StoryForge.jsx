import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoryForge({ onBack }) {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const { data } = await axios.get('/api/story-prompt');
      setPrompt(data.prompt);
    } catch (e) {
      console.error('Failed to load prompt', e);
    }
  };

  const submitStory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/submit-story', {
        user_id: 'demo',
        prompt,
        story_text: story,
      });
      setImageUrl(data.img_url);
    } catch (e) {
      console.error('Failed to submit story', e);
    } finally {
      setLoading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
        <div className="self-start mb-6">
        <Button variant="utility" size="lg" onClick={() => { setImageUrl(null); setStory(''); }}>
          <ArrowLeft size={28} className="mr-2" /> New Story
        </Button>
        </div>
        <img src={imageUrl} alt="Story illustration" className="max-w-md rounded-xl border-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
      <div className="self-start mb-6">
        <Button variant="utility" size="lg" onClick={onBack}>
          <ArrowLeft size={28} className="mr-2" /> Back
        </Button>
      </div>
      <motion.h1
        className="font-display text-4xl font-bold text-comicInk mb-4 flex items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PenTool size={32} /> Story Forge
      </motion.h1>
      <p className="text-gray-700 mb-4 text-center max-w-sm">
        {prompt || 'Loading prompt...'}
      </p>
      <textarea
        className="w-full max-w-sm h-40 p-4 border-2 border-gray-200 rounded-xl mb-4"
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="Write your story here..."
      />
      <Button
        variant="adventure"
        size="md"
        onClick={submitStory}
        disabled={!story || loading}
        className="mb-4"
      >
        {loading ? 'Submitting...' : 'Submit Story'}
      </Button>
    </div>
  );
}
