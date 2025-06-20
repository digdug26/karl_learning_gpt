import { useState, useEffect } from 'react';
import { Award, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { loadProgress, alphabet } from '../utils/typingProgress';

export default function Accomplishments({ onBack }) {
  const [progress, setProgress] = useState(() => loadProgress());

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const progressPercentage = (progress.lettersCount / alphabet.length) * 100;
  const totalAchievements = progress.achievements.length + (progress.badge ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-slate-900">Karl's Accomplishments</h1>
        </div>
        <p className="text-lg text-slate-600">
          Track your learning progress and celebrate your achievements
        </p>
      </motion.div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Letters Mastered</p>
              <p className="text-2xl font-bold text-slate-900">{progress.lettersCount}</p>
              <p className="text-sm text-slate-500">of {alphabet.length} letters</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Progress</p>
              <p className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</p>
              <p className="text-sm text-slate-500">Complete</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Achievements</p>
              <p className="text-2xl font-bold text-slate-900">{totalAchievements}</p>
              <p className="text-sm text-slate-500">Earned</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Typing Mastery Progress */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Typing Mastery Progress</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Overall Progress</span>
            <span className="text-sm font-medium text-slate-900">
              {progress.lettersCount}/{alphabet.length} letters
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="text-right">
            <span className="text-xs text-slate-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
        </div>

        {/* Letter Grid */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Letter Progress</h4>
          <div className="grid grid-cols-13 gap-1">
            {alphabet.map((letter, index) => {
              const isMastered = progress.masteredLetters && progress.masteredLetters.includes(letter);
              return (
                <motion.div
                  key={letter}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                    isMastered 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  {letter.toUpperCase()}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Achievements & Badges */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Award className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-slate-900">Earned Achievements</h3>
        </div>

        {totalAchievements === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-2">No achievements yet</p>
            <p className="text-sm text-slate-400">Keep practicing to earn your first badge!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Achievement Icons Display */}
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {progress.achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  className="text-3xl p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {achievement.icon}
                </motion.div>
              ))}
              {progress.badge && (
                <motion.div
                  className="text-3xl p-2 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: progress.achievements.length * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {progress.badge.icon}
                </motion.div>
              )}
            </div>

            {/* Achievement Details */}
            <div className="space-y-2">
              {progress.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {achievement.name || `Achievement ${idx + 1}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {achievement.description || 'Great work!'}
                    </p>
                  </div>
                </div>
              ))}
              {progress.badge && (
                <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-lg">{progress.badge.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {progress.badge.name || 'Special Badge'}
                    </p>
                    <p className="text-xs text-yellow-600">
                      {progress.badge.description || 'Outstanding achievement!'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Encouragement Message */}
      <motion.div
        className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-3" />
        <h4 className="font-medium text-blue-900 mb-2">Keep Up the Great Work!</h4>
        <p className="text-sm text-blue-700">
          {progressPercentage < 25 
            ? "You're just getting started - every step counts!"
            : progressPercentage < 50
            ? "You're making excellent progress - keep it up!"
            : progressPercentage < 75
            ? "Wow! You're more than halfway there!"
            : progressPercentage < 100
            ? "Almost there! You're doing amazing!"
            : "Congratulations! You've mastered all the letters!"
          }
        </p>
      </motion.div>
    </div>
  );
}