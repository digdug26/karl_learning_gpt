import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Rocket, Stars, Zap } from "lucide-react";

export default function Home({ onStart }) {
  return (
    <div className="min-h-screen bg-sky-200 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 text-sunshine-400 opacity-30"
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
          <Stars size={40} />
        </motion.div>
        
        <motion.div
          className="absolute top-32 right-32 text-hero-400 opacity-30"
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
          <Zap size={35} />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-1/4 text-adventure-400 opacity-30"
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
          <Stars size={30} />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-12 z-10">
        <motion.h1
          className="font-body text-7xl font-extrabold text-hero-600 mb-8 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          Karl's
        </motion.h1>

        <motion.h2
          className="font-body text-6xl font-extrabold text-energy-600 mb-8 drop-shadow-sm"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut"
          }}
        >
          Adventure!
        </motion.h2>

        <motion.p
          className="text-xl text-gray-700 font-medium max-w-md mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.8,
            delay: 0.4
          }}
        >
          Ready for an amazing learning journey? Let's explore, read, and have fun together!
        </motion.p>
      </div>

      {/* Hero Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.6
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="hero"
          size="xxl"
          onClick={onStart}
          className="group shadow-2xl hover:shadow-glow-blue border-4 border-ocean-300 bg-gradient-to-r from-ocean-500 via-ocean-600 to-ocean-700 relative"
        >
          <motion.div
            className="mr-4"
            animate={{ 
              x: [0, 5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Rocket size={40} className="text-white" />
          </motion.div>
          
          <span className="text-white font-bold">
            Start Karl's Adventure!
          </span>
          
        </Button>
      </motion.div>

      {/* Encouraging subtitle */}
      <motion.p
        className="mt-8 text-lg text-gray-600 font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          delay: 1
        }}
      >
        Click to begin your learning quest! 🎯
      </motion.p>
    </div>
  );
}