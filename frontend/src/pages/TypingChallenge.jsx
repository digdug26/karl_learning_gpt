import { useState } from 'react';
import { Button } from '../components/ui/button';
import TypingHomeRow from '../components/TypingHomeRow';
import { Keyboard, ListTodo, Goal, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TypingChallenge({ onBack }) {
  const [activity, setActivity] = useState(null);

  const activities = [
    {
      id: 'basics',
      title: 'Typing Basics',
      subtitle: 'Home row practice',
      icon: Keyboard,
    },
    {
      id: 'words',
      title: 'Word Sprint',
      subtitle: 'Coming soon',
      icon: ListTodo,
    },
    {
      id: 'sentences',
      title: 'Sentence Dash',
      subtitle: 'Coming soon',
      icon: Goal,
    },
  ];

  if (activity === 'basics') {
    return (
      <div className="min-h-screen bg-sky-200 p-8 flex flex-col items-center">
        <div className="self-start mb-6">
          <Button variant="utility" size="md" onClick={() => setActivity(null)}>
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
        </div>
        <TypingHomeRow />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col items-center p-8 relative">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-5xl font-bold text-comicInk mb-4">
          Typing Challenge
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Choose a typing activity to begin.
        </p>
      </motion.div>

      <div className="flex flex-col gap-8 w-full max-w-md items-center">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="energy"
              size="lg"
              onClick={() => item.id === 'basics' && setActivity('basics')}
              disabled={item.id !== 'basics'}
              className="w-72 h-20 justify-start text-left border-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-energy-400 to-energy-600 opacity-90" />
              <motion.div className="relative z-10 mr-6 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <item.icon size={32} className="text-white" />
              </motion.div>
              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-white/90 text-sm font-medium">{item.subtitle}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Button variant="utility" size="md" onClick={onBack} className="hover:shadow-medium">
          <ArrowLeft size={20} className="mr-2" />
          Back to Menu
        </Button>
      </motion.div>
    </div>
  );
}
