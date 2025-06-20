import { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DailyJournal({ onBack }) {
  const [entry, setEntry] = useState('');
  const [reflection, setReflection] = useState('');
  const [question, setQuestion] = useState('');
  const [entryId, setEntryId] = useState(null);
  const [stage, setStage] = useState('write'); // 'write', 'reflect', 'done'

  const submitEntry = async () => {
    if (!entry.trim()) return;
    try {
      const { data } = await axios.post('/api/journal-entry', {
        user_id: 'demo_user',
        entry,
      });
      setQuestion(data.question);
      setEntryId(data.entry_id);
      setStage('reflect');
    } catch (e) {
      console.error(e);
    }
  };

  const submitReflection = async () => {
    try {
      if (entryId) {
        await axios.post('/api/journal-reflection', {
          entry_id: entryId,
          reflection,
        });
      }
      setStage('done');
    } catch (e) {
      console.error(e);
    }
  };

  if (stage === 'reflect') {
    return (
      <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
        <div className="self-start mb-6">
        <Button variant="utility" size="lg" onClick={onBack}>
          <ArrowLeft size={28} className="mr-2" /> Back
        </Button>
        </div>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-soft">
          <p className="mb-4 text-gray-700 whitespace-pre-wrap">{entry}</p>
          <p className="font-semibold mb-2">{question}</p>
          <textarea
            className="w-full border rounded-xl p-3 mb-4"
            rows="4"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Optional reflection"
          />
          <Button variant="energy" size="md" onClick={submitReflection}>
            Save Reflection
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
        <div className="self-start mb-6">
        <Button variant="utility" size="lg" onClick={onBack}>
          <ArrowLeft size={28} className="mr-2" /> Back
        </Button>
        </div>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg text-center shadow-soft">
          <p className="font-semibold text-comicInk">Thanks for journaling today!</p>
        </div>
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-soft">
        <textarea
          className="w-full border rounded-xl p-4 mb-4"
          rows="6"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write anything about your day..."
        />
        <Button variant="energy" size="md" onClick={submitEntry}>
          Submit Entry
        </Button>
      </div>
    </div>
  );
}
