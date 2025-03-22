import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Collection of different success animations that will randomly appear
const SUCCESS_ANIMATIONS = [
  {
    id: 'runner',
    component: ({ onComplete }: { onComplete: () => void }) => (
      <motion.div 
        className="fixed bottom-4 left-[-100px] z-50"
        initial={{ x: 0 }}
        animate={{ x: window.innerWidth + 100 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        onAnimationComplete={onComplete}
      >
        <div className="relative">
          <motion.div 
            className="text-4xl"
            animate={{ y: [0, -20, 0], rotate: [0, 0, 0] }}
            transition={{ repeat: 4, duration: 0.5 }}
          >
            🏃
          </motion.div>
          <motion.div
            className="absolute -top-8 left-0 bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Great job!
          </motion.div>
        </div>
      </motion.div>
    )
  },
  {
    id: 'confetti',
    component: ({ onComplete }: { onComplete: () => void }) => (
      <motion.div 
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, delay: 1 }}
        onAnimationComplete={onComplete}
      >
        <div className="relative">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#FF5E5B', '#D8D8D8', '#FFFFEA', '#00CECB', '#FFED66'][i % 5],
                top: 0,
                left: 0,
              }}
              initial={{ x: 0, y: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 200, 
                y: (Math.random() * 200) + 50,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 1.5, delay: i * 0.02 }}
            />
          ))}
          <motion.div
            className="text-2xl font-bold text-primary-700"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            Correct! +10 points
          </motion.div>
        </div>
      </motion.div>
    )
  },
  {
    id: 'trophy',
    component: ({ onComplete }: { onComplete: () => void }) => (
      <motion.div 
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 1500);
        }}
      >
        <div className="bg-white shadow-lg rounded-lg p-3 flex items-center gap-3">
          <motion.div 
            className="text-2xl"
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 0.6, 
              repeat: 1
            }}
          >
            🏆
          </motion.div>
          <div className="text-sm font-medium text-primary-700">
            Perfect answer!
          </div>
        </div>
      </motion.div>
    )
  },
  {
    id: 'character',
    component: ({ onComplete }: { onComplete: () => void }) => (
      <motion.div 
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 2000);
        }}
      >
        <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-xs">
          <div className="bg-primary-600 text-white p-3 text-sm font-bold">
            Diego the Dolphin
          </div>
          <div className="p-4 flex gap-3">
            <div className="text-4xl">🐬</div>
            <motion.div 
              className="text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-medium">That's correct!</p>
              <p className="text-gray-600 text-xs mt-1">You're on a 3-day streak. Keep it up!</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }
];

export interface SuccessAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function SuccessAnimation({ trigger, onComplete = () => {} }: SuccessAnimationProps) {
  const [animation, setAnimation] = useState<null | any>(null);

  useEffect(() => {
    if (trigger) {
      // Choose a random animation
      const randomIndex = Math.floor(Math.random() * SUCCESS_ANIMATIONS.length);
      setAnimation(SUCCESS_ANIMATIONS[randomIndex]);
    } else {
      setAnimation(null);
    }
  }, [trigger]);

  const handleComplete = () => {
    setAnimation(null);
    onComplete();
  };

  return (
    <AnimatePresence>
      {animation && <animation.component onComplete={handleComplete} />}
    </AnimatePresence>
  );
}