import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft, PenTool, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoryForge({ onBack }) {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const { data } = await axios.get('/api/story-prompt');
      setPrompt(data.prompt);
    } catch (e) {
      console.error('Failed to load prompt', e);
      setError('Failed to load story prompt. Please try again.');
    }
  };

  const submitStory = async () => {
    if (!story.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post('/api/submit-story', {
        user_id: 'demo',
        prompt,
        story_text: story,
      });
      setImageUrl(data.img_url);
    } catch (e) {
      console.error('Failed to submit story', e);
      setError('Failed to submit your story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Story Complete!</h1>
          <Button 
            variant="secondary" 
            onClick={() => { 
              setImageUrl(null); 
              setStory(''); 
              setError('');
              fetchPrompt();
            }}
          >
            <PenTool className="h-4 w-4 mr-2" />
            Write Another Story
          </Button>
        </div>

        {/* Success Message */}
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-900">Great work!</h3>
              <p className="text-green-700">Your story has been created successfully.</p>
            </div>
          </div>
        </motion.div>

        {/* Story Illustration */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Your Story Illustration</h3>
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt="Story illustration" 
              className="max-w-md w-full rounded-lg border border-slate-200 shadow-sm"
            />
          </div>
        </div>

        {/* Story Text Display */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Your Story</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-3 font-medium">Prompt:</p>
            <p className="text-slate-700 mb-4 italic">{prompt}</p>
            <p className="text-sm text-slate-600 mb-3 font-medium">Your Story:</p>
            <p className="text-slate-700 leading-relaxed">{story}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <PenTool className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Story Forge</h1>
          <p className="text-slate-600">Create your own adventure story</p>
        </div>
      </div>

      {/* Writing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Story Prompt */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Your Writing Prompt</h3>
          {prompt ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-slate-700 leading-relaxed">{prompt}</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <p className="text-slate-500">Loading your writing prompt...</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPrompt}
            className="mt-4"
            disabled={loading}
          >
            Get New Prompt
          </Button>
        </div>

        {/* Story Writing Area */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Write Your Story</h3>
          
          <textarea
            className="w-full h-64 p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Start writing your story here... Be creative and have fun!"
            disabled={loading}
          />
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              {story.length} characters
            </p>
            
            <Button
              onClick={submitStory}
              disabled={!story.trim() || loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Story...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit Story</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Writing Tips */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-3">Writing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-800 mb-1">Be Descriptive</h4>
            <p className="text-slate-600">Use vivid details to bring your story to life.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-1">Create Characters</h4>
            <p className="text-slate-600">Give your characters interesting personalities.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-1">Have Fun</h4>
            <p className="text-slate-600">Let your imagination run wild and enjoy writing!</p>
          </div>
        </div>
      </div>
    </div>
  );
}