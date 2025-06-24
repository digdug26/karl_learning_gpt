import { Button } from "../components/ui/button";
import { Swords, Keyboard, Image as ImageIcon, ArrowLeft, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Menu({ onSelect, onBack }) {
  const menuItems = [
    {
      id: "story",
      title: "Story Mode",
      subtitle: "Read interactive adventures and improve comprehension skills",
      icon: Swords,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100"
    },
    {
      id: "game",
      title: "Typing Challenge",
      subtitle: "Practice typing accuracy and speed with fun exercises",
      icon: Keyboard,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100"
    },
    {
      id: "draw",
      title: "Comic Pad",
      subtitle: "Create your own comic stories and express creativity",
      icon: ImageIcon,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-100"
    },
    {
      id: "accomplishments",
      title: "Accomplishments",
      subtitle: "View earned badges and track your learning progress",
      icon: Award,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      hoverColor: "hover:bg-yellow-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Choose Your Activity
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Select from our engaging learning activities. Each one is designed to help you grow and have fun!
        </p>
      </motion.div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.05,
                ease: "easeOut"
              }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onSelect(item.id)}
              className={`w-full p-6 rounded-lg shadow-sm border transition-all duration-200 text-left group ${item.bgColor} ${item.borderColor} ${item.hoverColor} hover:shadow-md`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg bg-white group-hover:scale-105 transition-transform duration-200`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-slate-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0">
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Stats Overview */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          delay: 0.5
        }}
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Progress Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">12</div>
            <div className="text-sm text-slate-600">Stories Read</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">45</div>
            <div className="text-sm text-slate-600">WPM Typing Speed</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
            <div className="text-sm text-slate-600">Badges Earned</div>
          </div>
        </div>
      </motion.div>

      {/* Encouragement message */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.6,
          delay: 0.7
        }}
      >
        <p className="text-slate-500 text-sm">
          🌟 Great job on your learning journey! Keep up the excellent work! 🌟
        </p>
      </motion.div>
    </div>
  );
}