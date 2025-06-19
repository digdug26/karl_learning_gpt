import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function ComicPad({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto border-4 border-hero-200"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-hero-500 to-energy-500 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Comic Break Time!</h2>
                    <p className="text-white/90">Time for some creative fun!</p>
                  </div>
                </div>

                <Button
                  variant="utility"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
                <Sparkles size={64} className="text-sunshine-500 mx-auto mb-4" />
              </motion.div>

              <h3 className="font-display text-3xl font-bold text-comicInk">Awesome Learning Time!</h3>

              <p className="text-xl text-gray-700 leading-relaxed max-w-md mx-auto">
                You've been learning for 20 minutes! Time for a quick creative break to recharge your brain.
                Draw, imagine, or just take a deep breath!
              </p>

              <div className="bg-gradient-to-r from-sunshine-100 to-energy-100 rounded-2xl p-6 border-2 border-sunshine-200">
                <p className="font-semibold text-lg text-comicInk mb-2">🎨 Quick Creative Challenge:</p>
                <p className="text-gray-700">Draw Karl on his next adventure! What amazing place will he explore?</p>
              </div>

              <Button variant="hero" size="lg" onClick={onClose} className="shadow-glow-blue">
                <Sparkles size={24} className="mr-2" />
                Back to Learning!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
