import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import AudioRecorder from '../AudioRecorder';
import { incrementCount } from '../utils/funFactsHistory';

export default function FunFacts({ onBack }) {
  const [options, setOptions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function loadOpts() {
      try {
        const { data } = await axios.get('/api/fun_facts_options');
        setOptions(data.options);
      } catch (e) {
        console.error('Failed to load options', e);
      }
    }
    loadOpts();
  }, []);

  const chooseOption = async (opt) => {
    const count = incrementCount(opt);
    setSelected(opt);
    try {
      const { data } = await axios.post('/api/fun_facts_summary', { topic: opt, count });
      setSummary(data.summary);
    } catch (e) {
      console.error('Failed to fetch summary', e);
      setSummary(
        `You are an inspiring educator teaching a 9 year old all about ${opt}. This is the ${count} time this topic has been introduced to the student so cater your response and level of detail/depth to this. Provide a detailed summary about this topic that is both educational and interesting.`
      );
    }
  };

  const handleAudioDone = (data) => {
    if (data) {
      const accuracy = data.words_total ? Math.round((data.words_correct / data.words_total) * 100) : 0;
      setResults({ wpm: data.words_per_minute, accuracy });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Fun Facts</h1>
      </div>

      {!selected && options && (
        <div className="space-y-3">
          {Object.values(options).map((opt) => (
            <Button key={opt} onClick={() => chooseOption(opt)} className="w-full">
              {opt}
            </Button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <p className="whitespace-pre-line text-lg">{summary}</p>

          {!results && (
            <AudioRecorder
              threadId={`fact-${selected}`}
              passageText={summary}
              afterSubmit={handleAudioDone}
              startLabel="Start Recording"
              stopLabel="Stop Recording"
            />
          )}

          {results && (
            <div>
              <p className="text-sm">Speed: {results.wpm} WPM</p>
              <p className="text-sm">Accuracy: {results.accuracy}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
