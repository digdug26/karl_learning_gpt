// Enhanced ActivityBox.jsx
import { motion } from 'framer-motion';
import { Book, Target, Gift } from 'lucide-react';

export function ActivityBox({ data }) {
  if (!data) return null;

  const { title, story_prompt, steps, read_aloud, reward_token } = data;

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-3xl shadow-large w-full max-w-4xl mx-auto overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-500 to-adventure-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Book size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">{title}</h2>
            <p className="text-white/90 font-medium">Your current adventure task</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Story Prompt */}
        {story_prompt && (
          <motion.div
            className="bg-gradient-to-r from-hero-50 to-adventure-50 rounded-2xl p-6 border border-hero-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-3 flex items-center gap-2">
              <Target size={20} className="text-hero-600" />
              Story Setup
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">{story_prompt}</p>
          </motion.div>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-energy-50 to-sunshine-50 rounded-2xl p-6 border border-energy-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-4 flex items-center gap-2">
              📋 What to Do
            </h3>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-gray-700 text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <span className="w-8 h-8 bg-energy-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Read Aloud Section */}
        {read_aloud && (
          <motion.div
            className="bg-gradient-to-r from-adventure-50 to-ocean-50 rounded-2xl p-6 border-l-4 border-adventure-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-display font-semibold text-lg text-comicInk mb-4 flex items-center gap-2">
              🎤 Read This Out Loud
            </h3>
            <blockquote className="text-gray-800 text-xl leading-relaxed font-medium italic bg-white/60 p-4 rounded-xl border border-white/80">
              "{read_aloud}"
            </blockquote>
            <p className="text-sm text-gray-600 mt-3 font-medium">
              💡 Tip: Click the microphone button above to record yourself reading!
            </p>
          </motion.div>
        )}

        {/* Reward Token */}
        {reward_token && (
          <motion.div
            className="bg-gradient-to-r from-sunshine-400 to-energy-400 rounded-2xl p-6 text-center border-2 border-sunshine-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="flex items-center justify-center gap-3">
              <Gift size={32} className="text-white" />
              <span className="font-display text-2xl font-bold text-white">
                🎉 Awesome! You earned a reward!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ActivityBox;
