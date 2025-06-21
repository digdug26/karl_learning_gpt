import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import AudioRecorder from '../AudioRecorder';

const STORY_PARTS = [
  {
    text: `Karl had always dreamed of exploring hidden worlds. Today, a shimmering gateway opened before him. With a deep breath, he stepped through and found himself in a realm of magic and mystery.

The air sparkled with possibility as he looked around. Nearby, two paths beckoned for adventure.`,
    options: ['Take the path through the singing forest', 'Enter the cave of echoes']
  },
  {
    text: `Karl pressed onward, feeling brave after his first choice. The landscape shifted with every step, revealing wonders beyond imagination.`,
    options: ['Follow the river of light', 'Climb the floating staircase']
  },
  {
    text: `Up ahead, strange creatures waved hello. They whispered clues about a hidden treasure lost for centuries.`,
    options: ['Ask the creatures for help', 'Continue alone toward the ruins']
  },
  {
    text: `A gentle breeze carried the scent of adventure. Karl felt more confident with each decision.`,
    options: ['Search the crystal tower', 'Explore the underground tunnel']
  },
  {
    text: `Lights twinkled in the distance, guiding Karl toward his next discovery.`,
    options: ['Head toward the twinkling lights', 'Rest beside the glowing pond']
  },
  {
    text: `Every choice led Karl deeper into the story. He wondered what surprises awaited next.`,
    options: ['Inspect the mysterious footprints', 'Follow the singing birds']
  },
  {
    text: `Karl felt the adventure nearing its peak. The world around him buzzed with energy.`,
    options: ['Enter the grand library', 'Speak the secret password']
  },
  {
    text: `Only a few steps remained before the tale would end. Karl took a deep breath and prepared for the finale.`,
    options: ['Open the ancient door', 'Step onto the glowing platform']
  },
  {
    text: `With a triumphant smile, Karl realized he had completed his quest. The world shimmered once more as the gateway home appeared.`,
    options: []
  }
];

export default function ChooseAdventure({ onBack }) {
  const [index, setIndex] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [stats, setStats] = useState([]);
  const [path, setPath] = useState([]);

  const handleAudioDone = (data) => {
    setRecorded(true);
    if (data) {
      const accuracy = data.words_total ? Math.round((data.words_correct / data.words_total) * 100) : 0;
      setStats([...stats, { wpm: data.words_per_minute, accuracy }]);
    }
  };

  const handleChoice = (option) => {
    setPath([...path, option]);
    setRecorded(false);
    const next = index + 1;
    if (next >= STORY_PARTS.length) {
      setIndex(STORY_PARTS.length);
    } else {
      setIndex(next);
    }
  };

  if (index >= STORY_PARTS.length) {
    const avgWpm = stats.reduce((a, b) => a + b.wpm, 0) / stats.length || 0;
    const avgAcc = stats.reduce((a, b) => a + b.accuracy, 0) / stats.length || 0;
    const summary = STORY_PARTS.map(p => p.text).join(' ');
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Adventure Complete!</h1>
        <p>Great job reading through the story.</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-medium">🏅 Reading Badge Earned!</p>
          <p className="text-sm mt-2">{summary.slice(0, 120)}...</p>
        </div>
        <p className="text-sm">Average Speed: {avgWpm.toFixed(1)} WPM</p>
        <p className="text-sm">Average Accuracy: {avgAcc.toFixed(1)}%</p>
      </div>
    );
  }

  const part = STORY_PARTS[index];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </Button>
        <h1 className="text-2xl font-bold">Choose Your Own Adventure!</h1>
      </div>

      <p className="whitespace-pre-line text-lg">{part.text}</p>

      {!recorded && (
        <AudioRecorder
          threadId={`adv-${index}`}
          passageText={part.text}
          afterSubmit={handleAudioDone}
        />
      )}

      {recorded && part.options.length > 0 && (
        <div className="space-y-3">
          {part.options.map((opt) => (
            <Button key={opt} onClick={() => handleChoice(opt)} className="w-full">
              {opt}
            </Button>
          ))}
        </div>
      )}

      {recorded && part.options.length === 0 && (
        <Button onClick={() => handleChoice('end')}>Next</Button>
      )}
    </div>
  );
}
