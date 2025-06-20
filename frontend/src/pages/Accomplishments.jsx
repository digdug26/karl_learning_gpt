import { useState, useEffect } from 'react';
import { ArrowLeft, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { loadProgress, alphabet } from '../utils/typingProgress';

export default function Accomplishments({ onBack }) {
  const [progress, setProgress] = useState(() => loadProgress());

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
      <div className="self-start mb-6">
        <Button variant="utility" size="md" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
      </div>
      <motion.h2 className="text-3xl font-bold mb-6" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        Karl's Accomplishments
      </motion.h2>

      <div className="w-full max-w-md mb-8">
        <p className="mb-2 font-semibold">Typing Mastery Progress</p>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-adventure-400 to-adventure-600"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.lettersCount / alphabet.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-xs font-mono text-gray-600 mt-1">
          {progress.lettersCount}/{alphabet.length} letters mastered
        </div>
      </div>

      <div className="w-full max-w-md">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award size={20}/> Earned Stickers & Badges
        </h3>
        <div className="bg-white/80 p-4 rounded-xl min-h-[80px]">
          {progress.achievements.length === 0 && !progress.badge && (
            <p className="text-sm text-gray-500">No achievements yet. Keep practicing!</p>
          )}
          <div className="flex flex-wrap gap-2 text-2xl">
            {progress.achievements.map((s, idx) => (
              <span key={idx}>{s.icon}</span>
            ))}
            {progress.badge && <span>{progress.badge.icon}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
