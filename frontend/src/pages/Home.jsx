import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Rocket, Stars, Zap, BookOpen, Keyboard } from "lucide-react";

export default function Home({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Subtle Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 text-slate-300 opacity-60"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Stars size={32} />
        </motion.div>
        
        <motion.div
          className="absolute top-32 right-32 text-blue-300 opacity-60"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Zap size={28} />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-1/4 text-green-300 opacity-60"
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 15, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <BookOpen size={24} />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-12 z-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-slate-900 mb-2">
            Karl's Adventure
          </h1>
          <h2 className="text-2xl font-medium text-slate-600">
            Learning Platform
          </h2>
        </motion.div>

        <motion.p
          className="text-lg text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.8,
            delay: 0.4
          }}
        >
          Welcome to your personalized learning journey! Explore reading adventures, 
          practice typing skills, and track your progress in a fun, engaging environment.
        </motion.p>
      </div>

      {/* Professional Action Button */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6,
          delay: 0.6,
          ease: "easeOut"
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={onStart}
          className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium shadow-sm border border-blue-600 transition-all duration-200 flex items-center space-x-3"
        >
          <Rocket className="h-6 w-6" />
          <span>Start Learning Adventure</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            →
          </motion.div>
        </button>
      </motion.div>

      {/* Welcome message */}
      <motion.p
        className="mt-8 text-sm text-slate-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          delay: 1
        }}
      >
        Ready to begin? Click above to explore your learning options.
      </motion.p>

      {/* Feature highlights */}
      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          delay: 1.2
        }}
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
          <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-2">Interactive Stories</h3>
          <p className="text-sm text-slate-600">Engaging reading adventures that make learning fun</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
          <Keyboard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-2">Typing Practice</h3>
          <p className="text-sm text-slate-600">Build essential keyboard skills through games</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
          <Stars className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-2">Track Progress</h3>
          <p className="text-sm text-slate-600">See your achievements and celebrate success</p>
        </div>
      </motion.div>
    </div>
  );
}
