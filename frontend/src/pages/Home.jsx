import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import {
  Rocket,
  Stars,
  Zap,
  BookOpen,
  FlaskConical,
  Snail,
  PawPrint,
  Atom,
  Cat,
} from "lucide-react";

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
          <div className="mb-6 flex justify-center space-x-4 text-blue-600">
            <FlaskConical className="w-12 h-12" />
            <Snail className="w-12 h-12" />
            <PawPrint className="w-12 h-12" />
            <Atom className="w-12 h-12" />
            <Cat className="w-12 h-12" />
          </div>
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
          className="group bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-lg text-lg font-medium shadow-sm border border-blue-600 transition-all duration-200 flex items-center space-x-3 w-[400px]"
        >
          <Rocket className="h-6 w-6" />
          <span>Start Learning Adventure</span>
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

    </div>
  );
}
