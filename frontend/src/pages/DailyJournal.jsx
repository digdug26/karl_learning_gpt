import { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { BookOpen, CheckCircle, Loader2, Calendar, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyJournal({ onBack }) {
  const [entry, setEntry] = useState('');
  const [reflection, setReflection] = useState('');
  const [question, setQuestion] = useState('');
  const [entryId, setEntryId] = useState(null);
  const [stage, setStage] = useState('write'); // 'write', 'reflect', 'done'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitEntry = async () => {
    if (!entry.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post('/api/journal-entry', {
        user_id: 'demo_user',
        entry,
      });
      setQuestion(data.question);
      setEntryId(data.entry_id);
      setStage('reflect');
    } catch (e) {
      console.error(e);
      setError('Failed to submit entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitReflection = async () => {
    try {
      setLoading(true);
      if (entryId) {
        await axios.post('/api/journal-reflection', {
          entry_id: entryId,
          reflection,
        });
      }
      setStage('done');
    } catch (e) {
      console.error(e);
      setError('Failed to save reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetJournal = () => {
    setEntry('');
    setReflection('');
    setQuestion('');
    setEntryId(null);
    setStage('write');
    setError('');
  };

  if (stage === 'reflect') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reflection Time</h1>
            <p className="text-slate-600">Think about what you wrote</p>
          </div>
        </div>

        {/* Entry Display */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Your Journal Entry</h3>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{entry}</p>
          </div>
        </div>

        {/* Reflection Question */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Reflection Question</h3>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <p className="text-slate-700 font-medium">{question}</p>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Your Reflection (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="4"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Take a moment to reflect on your thoughts..."
              disabled={loading}
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={submitReflection}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Reflection
                  </>
                )}
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setStage('done')}
                disabled={loading}
              >
                Skip Reflection
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Journal Entry Complete!</h1>
          <p className="text-slate-600">Thank you for taking time to reflect today.</p>
        </div>

        {/* Completion Card */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Great job journaling today!
          </h3>
          <p className="text-slate-600 mb-6">
            Regular journaling helps you process thoughts and emotions. 
            Keep up the excellent work!
          </p>
          
          <div className="flex space-x-3 justify-center">
            <Button onClick={resetJournal}>
              <BookOpen className="h-4 w-4 mr-2" />
              Write Another Entry
            </Button>
            <Button variant="secondary" onClick={onBack}>
              Return to Menu
            </Button>
          </div>
        </motion.div>

        {/* Encouragement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            💭 "Writing is thinking on paper" - Keep exploring your thoughts!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Journal</h1>
          <p className="text-slate-600">Express your thoughts and feelings</p>
        </div>
      </div>

      {/* Writing Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Today's Entry</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How was your day? What's on your mind?
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="8"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Write about anything - your day, feelings, thoughts, dreams, or experiences. There's no right or wrong way to journal!"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-slate-500">
                {entry.length} characters
              </p>
              <p className="text-sm text-slate-500">
                {entry.trim().split(/\s+/).filter(word => word.length > 0).length} words
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={submitEntry}
            disabled={!entry.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting Entry...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Entry
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Writing Prompts */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Need some inspiration?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-slate-200">
            <p className="text-slate-700">💭 What made you smile today?</p>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <p className="text-slate-700">🌟 What are you grateful for?</p>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <p className="text-slate-700">🎯 What did you learn today?</p>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <p className="text-slate-700">🚀 What are you excited about?</p>
          </div>
        </div>
      </div>

      {/* Benefits Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Why Journaling Helps</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Helps you understand your feelings</li>
          <li>• Improves writing and thinking skills</li>
          <li>• Creates a record of your growth</li>
          <li>• Reduces stress and anxiety</li>
        </ul>
      </div>
    </div>
  );
}