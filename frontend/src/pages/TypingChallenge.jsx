import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import TypingHomeRow from '../components/TypingHomeRow';
import StoryForge from './StoryForge';
import DailyJournal from './DailyJournal';
import { Keyboard, PenTool, NotebookPen, ChevronRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TypingChallenge({ onBack }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    const handler = () => setActivity(null);
    window.addEventListener('reset-typing-challenge', handler);
    return () => window.removeEventListener('reset-typing-challenge', handler);
  }, []);

  const activities = [
    {
      id: 'basics',
      title: 'Typing Basics',
      subtitle: 'Master the home row keys and improve your typing foundation',
      description: 'Practice fundamental typing skills with interactive exercises',
      icon: Keyboard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      difficulty: 'Beginner',
      duration: '10-15 min'
    },
    {
      id: 'forge',
      title: 'Story Forge',
      subtitle: 'Create engaging short stories while practicing typing',
      description: 'Combine creativity with typing practice in this fun writing exercise',
      icon: PenTool,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      difficulty: 'Intermediate',
      duration: '15-20 min'
    },
    {
      id: 'journal',
      title: 'Daily Journal',
      subtitle: 'Reflect on your day while building typing fluency',
      description: 'Practice typing through personal reflection and journaling',
      icon: NotebookPen,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      difficulty: 'All Levels',
      duration: '10-25 min'
    },
  ];

  if (activity === 'basics') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pl-2 mt-4">
          <Keyboard className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Typing Basics</h1>
            <p className="text-slate-600">Home row practice and fundamentals</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <TypingHomeRow />
        </div>
      </div>
    );
  }

  if (activity === 'forge') {
    return <StoryForge onBack={() => setActivity(null)} />;
  }

  if (activity === 'journal') {
    return <DailyJournal onBack={() => setActivity(null)} />;
  }

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
          <Target className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Typing Challenge</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Improve your typing skills through engaging activities and targeted practice exercises
        </p>
      </motion.div>

      {/* Activity Selection */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <button
              onClick={() => setActivity(item.id)}
              className={`w-full p-6 rounded-lg shadow-sm border transition-all duration-200 text-left group ${item.bgColor} ${item.borderColor} ${item.hoverColor} hover:shadow-md`}
            >
              <div className="flex items-center space-x-6">
                {/* Icon */}
                <div className={`p-4 bg-white rounded-lg border ${item.borderColor} group-hover:scale-105 transition-transform duration-200`}>
                  <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-slate-800">
                      {item.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      item.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>Duration: {item.duration}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0">
                  <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Typing Tips */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          delay: 0.4
        }}
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Typing Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-slate-900 mb-2">Proper Posture</h4>
            <p className="text-sm text-slate-600">Sit up straight with feet flat on the floor</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-slate-900 mb-2">Home Row</h4>
            <p className="text-sm text-slate-600">Keep fingers on ASDF and JKL; keys</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-slate-900 mb-2">Look Ahead</h4>
            <p className="text-sm text-slate-600">Don't look at the keyboard while typing</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-slate-900 mb-2">Practice Daily</h4>
            <p className="text-sm text-slate-600">Consistent practice builds muscle memory</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          delay: 0.6
        }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Improve Your Typing?</h3>
          <p className="text-slate-600 mb-4">
            Choose an activity above to start practicing. Remember, consistent practice is the key to becoming a faster, more accurate typist!
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Track Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Build Skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Have Fun</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}