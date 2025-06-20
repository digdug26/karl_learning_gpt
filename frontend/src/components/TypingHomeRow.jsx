// Enhanced TypingHomeRow.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, CheckCircle, XCircle, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import generatePracticeText from '../utils/generatePracticeText';
import { loadProgress, saveProgress, alphabet, randomSticker } from '../utils/typingProgress';

export default function TypingHomeRow({ onFinish }) {
  const [progress, setProgress] = useState(() => loadProgress());
  const [text, setText] = useState(() => generatePracticeText(progress.lettersCount));
  const [input, setInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [usedBackspace, setUsedBackspace] = useState(false);
  const [stageMsg, setStageMsg] = useState('');

  useEffect(() => {
    if (stageMsg) {
      const id = setTimeout(() => setStageMsg(''), 4000);
      return () => clearTimeout(id);
    }
  }, [stageMsg]);
  
  const correct = text.slice(0, input.length) === input;
  const complete = input === text && input.length > 0;
  
  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Handle completion logic including streak tracking
  useEffect(() => {
    if (complete && !isComplete) {
      setIsComplete(true);
      setShowResult(true);

      setProgress((prev) => {
        let updated = { ...prev };
        if (correct && !usedBackspace) {
          updated.streak += 1;
        } else {
          updated.streak = 0;
        }

        if (updated.streak >= 5) {
          if (updated.lettersCount < alphabet.length) {
            updated.lettersCount += 1;
            updated.streak = 0;
            setStageMsg(`Congrats! You mastered Stage ${updated.lettersCount - 1}!`);
            const stage = updated.lettersCount - 1;
            if ([5,10,15,20,25].includes(stage)) {
              updated.achievements.push({ type: 'sticker', icon: randomSticker(), stage });
            }
            if (stage === 26) {
              updated.badge = { icon: '🏆', stage };
            }
          } else if (!updated.badge) {
            updated.streak = 0;
            const stage = alphabet.length;
            setStageMsg(`Congrats! You mastered Stage ${stage}!`);
            updated.badge = { icon: '🏆', stage };
          }
        }
        return updated;
      });

      onFinish?.(correct);

      setTimeout(() => {
        setShowResult(false);
      }, 3000);
    }
  }, [complete, isComplete, correct, usedBackspace, onFinish]);

  const resetExercise = () => {
    setInput('');
    setIsComplete(false);
    setShowResult(false);
    setUsedBackspace(false);
    setText(generatePracticeText(progress.lettersCount));
  };

  useEffect(() => {
    setText(generatePracticeText(progress.lettersCount));
  }, [progress.lettersCount]);

  // Character-by-character display with color coding
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'font-mono text-xl ';
      
      if (index < input.length) {
        // Typed characters
        if (input[index] === char) {
          className += 'text-adventure-600 bg-adventure-100'; // Correct
        } else {
          className += 'text-red-600 bg-red-100'; // Incorrect
        }
      } else if (index === input.length) {
        // Current character
        className += 'text-gray-800 bg-ocean-200 animate-pulse'; // Next to type
      } else {
        // Untyped characters
        className += 'text-gray-400'; // Not yet typed
      }
      
      return (
        <span key={index} className={`${className} px-1 py-0.5 rounded transition-colors duration-200`}>
          {char}
        </span>
      );
    });
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-energy-500 to-sunshine-500 rounded-xl flex items-center justify-center">
          <Keyboard size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-xl text-comicInk">
            Typing Practice
          </h3>
          <p className="text-gray-600 text-sm">
            Type the text below exactly as shown
          </p>
        </div>
      </div>

      {/* Text to type */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-4 border-2 border-white/50 shadow-soft">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type this text:
        </label>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[60px] flex items-center justify-center border-2 border-gray-200">
          <div className="text-center leading-relaxed">
            {renderText()}
          </div>
        </div>
      </div>

      {/* Mastery progress bar */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mastery Progress:</label>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-adventure-400 to-adventure-600"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.lettersCount / alphabet.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-xs font-mono text-gray-600 mt-1">
          {progress.lettersCount}/{alphabet.length} letters
        </div>
      </div>

      {/* Input field */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/50 shadow-soft">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Your typing:
        </label>
        <input
          type="text"
          value={input}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') setUsedBackspace(true);
          }}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start typing here..."
          className={`w-full p-4 text-xl font-mono rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ocean-300 ${
            correct ? 'border-adventure-300 bg-adventure-50' : 'border-red-300 bg-red-50'
          } ${isComplete ? 'cursor-not-allowed' : ''}`}
          disabled={isComplete}
          autoFocus
        />
        
        {/* Progress indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ocean-400 to-adventure-400"
                initial={{ width: 0 }}
                animate={{ width: `${(input.length / text.length) * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="text-gray-600 font-mono text-xs">
              {input.length}/{text.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {input.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                {correct ? (
                  <CheckCircle size={16} className="text-adventure-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
                <span className={`text-sm font-semibold ${correct ? 'text-adventure-600' : 'text-red-600'}`}>
                  {correct ? 'Perfect!' : 'Check your typing'}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Reset button */}
      {input.length > 0 && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="utility"
            size="sm"
            onClick={resetExercise}
            className="hover:shadow-medium"
          >
            <RotateCcw size={16} className="mr-2" />
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Success/Completion Message */}
      <AnimatePresence>
        {showResult && isComplete && (
          <motion.div
            className="mt-6 bg-gradient-to-r from-adventure-400 to-adventure-600 rounded-2xl p-6 text-center text-white shadow-glow-green border-2 border-adventure-300"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle size={48} className="mx-auto mb-4" />
            </motion.div>
            
            <h4 className="font-display text-2xl font-bold mb-2">
              🎉 Excellent Typing!
            </h4>
            
            <p className="text-adventure-100 font-medium">
              {correct ? 
                "Perfect! You typed everything correctly!" :
                "Good effort! Keep practicing to improve your accuracy."
              }
            </p>
            
            <motion.div
              className="mt-4 text-sm text-adventure-100 opacity-75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              This message will disappear automatically...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {stageMsg && (
        <motion.div
          className="mt-4 bg-gradient-to-r from-hero-400 to-energy-500 text-white rounded-xl p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {stageMsg}
        </motion.div>
      )}

      {/* Typing Tips */}
      <motion.div
        className="mt-6 bg-gradient-to-r from-sunshine-50 to-energy-50 rounded-2xl p-6 border border-sunshine-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className="font-display font-semibold text-lg text-comicInk mb-3 flex items-center gap-2">
          💡 Typing Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 bg-sunshine-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>Keep your fingers on the home row keys</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 bg-energy-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>Look at the screen, not the keyboard</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 bg-adventure-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>Type steadily, accuracy beats speed</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>Practice a little bit every day</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced SessionTimer.jsx

export function SessionTimer({ maxMinutes, children, onHardCap }) {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(id);
  }, []);
  
  useEffect(() => {
    if (elapsed === 20) {
      window.dispatchEvent(new Event('comic-break'));
    }
    if (elapsed >= maxMinutes) {
      onHardCap?.();
    }
  }, [elapsed, maxMinutes, onHardCap]);

  const timeRemaining = maxMinutes - elapsed;
  const isNearEnd = timeRemaining <= 5;
  const progressPercentage = (elapsed / maxMinutes) * 100;

  return (
    <div className="w-full">
      {/* Timer Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isNearEnd ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-ocean-400 to-ocean-600'
        }`}>
          <Clock size={24} className="text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-semibold text-lg text-comicInk">
              Session Progress
            </span>
            <span className={`font-mono font-bold ${isNearEnd ? 'text-red-600' : 'text-gray-700'}`}>
              {elapsed}/{maxMinutes} min
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                isNearEnd 
                  ? 'bg-gradient-to-r from-red-400 to-red-600' 
                  : 'bg-gradient-to-r from-ocean-400 to-adventure-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {isNearEnd && (
            <motion.div
              className="flex items-center gap-2 mt-2 text-red-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              <span className="text-sm font-semibold">
                Session ending soon! ({timeRemaining} min remaining)
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Session milestones */}
      {elapsed === 20 && (
        <motion.div
          className="mb-4 bg-gradient-to-r from-hero-100 to-energy-100 rounded-xl p-4 border border-hero-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <p className="font-semibold text-comicInk">Comic break time!</p>
              <p className="text-sm text-gray-600">You've been learning for 20 minutes - great job!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Children content */}
      {typeof children === 'function' ? children({ elapsed, maxMinutes, timeRemaining }) : children}
    </div>
  );
}

