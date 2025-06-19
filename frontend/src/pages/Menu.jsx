import { Button } from "../components/ui/button";
import { BookOpen, Gamepad2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Menu({ onSelect, onBack }) {
  const menuItems = [
    {
      id: "story",
      title: "Story Mode",
      subtitle: "Read amazing adventures with Karl",
      icon: BookOpen,
      variant: "adventure",
      gradient: "from-adventure-400 to-adventure-600",
      glowColor: "glow-green"
    },
    {
      id: "game",
      title: "Typing Challenge",
      subtitle: "Practice your typing skills",
      icon: Gamepad2,
      variant: "energy",
      gradient: "from-energy-400 to-energy-600",
      glowColor: "glow-orange"
    },
    {
      id: "draw",
      title: "Comic Pad",
      subtitle: "Create your own comic stories",
      icon: ImageIcon,
      variant: "secondary",
      gradient: "from-hero-400 to-hero-600",
      glowColor: "glow-blue"
    }
  ];

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col items-center justify-center p-8 relative">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_theme(colors.ocean.500)_1px,_transparent_1px)] bg-[length:50px_50px]"></div>
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-16 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-5xl font-bold text-comicInk mb-4">
          Choose Your
        </h1>
        <h2 className="font-display text-4xl font-bold bg-gradient-to-r from-ocean-600 to-hero-600 bg-clip-text text-transparent">
          Adventure Mode!
        </h2>
        <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto">
          Pick what you'd like to do today. Each mode is packed with fun learning!
        </p>
      </motion.div>

      {/* Encouraging message */}
      <motion.div
        className="text-center mb-8 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-gray-500 font-medium">
          🌟 Every choice leads to awesome learning! 🌟
        </p>
      </motion.div>

      {/* Menu Buttons */}
      <div className="flex flex-col gap-8 w-full max-w-md z-10 items-center">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant={item.variant}
              size="lg"
              onClick={() => onSelect(item.id)}
              className={`w-72 h-20 justify-start text-left shadow-${item.glowColor} hover:shadow-${item.glowColor} group relative overflow-hidden border-3`}
            >
              {/* Background gradient animation */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Icon */}
              <motion.div
                className="relative z-10 mr-6 p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon size={32} className="text-white" />
              </motion.div>
              
              {/* Text content */}
              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm font-medium">
                  {item.subtitle}
                </p>
              </div>

              {/* Arrow indicator */}
              <motion.div
                className="relative z-10 ml-4"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.div>
                </div>
              </motion.div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      {onBack && (
        <motion.div
          className="mt-12 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6,
            delay: 0.6
          }}
        >
          <Button
            variant="utility"
            size="md"
            onClick={onBack}
            className="hover:shadow-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Button>
        </motion.div>
      )}

    </div>
  );
}