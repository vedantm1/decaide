import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ConfettiExplosion from './confetti-explosion';

// Use lazy loading for Lottie animations
const LottieAnimation = lazy(() => import('./lottie-animation'));

// Import celebration animations
const celebrationLottie = { 
  // The Lottie data will be fetched dynamically to avoid bundling large JSON files
  // These would contain real Lottie animation data in production
};

export interface SuccessAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';
  message?: string;
  duration?: number;
}

// Configuration for different animation types
const animationConfigs = {
  confetti: {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4'],
  },
  stars: {
    particleCount: 60,
    spread: 100,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#f59e0b', '#facc15', '#eab308', '#ffedd5'],
  },
  circles: {
    particleCount: 80,
    spread: 50,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#f8fafc'],
  },
  fireworks: {
    particleCount: 200,
    spread: 360,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'],
  }
};

// Enhanced drink animation using MotionOne for smoother performance
const TropicalDrink = () => {
  return (
    <motion.div 
      className="absolute bottom-8 right-8 w-32 h-32"
      initial={{ opacity: 0, y: 20, rotate: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.8, ease: "easeOut", repeat: 1, repeatType: "reverse" }
      }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="relative w-full h-full">
        {/* Glass */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-cyan-100 opacity-60 rounded-t-lg rounded-b-3xl"></div>
        
        {/* Liquid */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-b-3xl">
          {/* Liquid surface wave */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-2"
            animate={{ 
              y: [0, -1, 1, 0],
              transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
          >
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
              <path 
                d="M0,0 Q25,10 50,0 Q75,10 100,0 L100,20 L0,20 Z" 
                fill="#4FC3F7" 
              />
            </svg>
          </motion.div>
        </div>
        
        {/* Straw */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 rotate-12 w-2 h-28 bg-gradient-to-b from-red-400 to-red-500 rounded-full"></div>
        
        {/* Umbrella */}
        <div className="absolute bottom-20 right-2 w-12 h-8">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-yellow-700 rounded-full"></div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-6 rounded-t-full bg-pink-400"></div>
        </div>
        
        {/* Fruit decoration */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-yellow-300 border-2 border-yellow-400">
          {/* Lemon slice details */}
          <div className="absolute inset-1 rounded-full border border-yellow-400 opacity-60"></div>
        </div>
      </div>
      
      {/* Ice cube */}
      <motion.div 
        className="absolute top-10 right-3 w-4 h-4 rounded-md bg-white opacity-70"
        animate={{
          y: [0, 8, 0],
          x: [0, 2, 0],
          rotate: [0, 10, 20, 30],
          transition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
        }}
      />
      
      {/* Bubbles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white opacity-60"
          style={{ 
            width: `${4 + Math.random() * 4}px`, 
            height: `${4 + Math.random() * 4}px`,
            left: `${35 + Math.random() * 30}%`, 
            bottom: `${20 + i * 10}%` 
          }}
          animate={{
            y: [-20, -40],
            opacity: [0.7, 0],
            transition: { 
              duration: 1 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.6,
              ease: "easeOut" 
            }
          }}
        />
      ))}
    </motion.div>
  );
};

export default function SuccessAnimation({ 
  trigger,
  onComplete = () => {},
  type = 'random',
  message,
  duration = 2000,
}: SuccessAnimationProps) {
  const hasAnimated = useRef(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationType, setAnimationType] = useState(type);
  const controls = useAnimationControls();
  
  // Emojis for the floating animation including tropical elements
  const emojis = useRef([
    '🏆', '🌟', '✨', '💯', '🔥', '👏', '🎉', '🚀', '💪', '👍', '🍹', '🥥', '🌴', '🏄', '🌊'
  ]);

  // Generate random positions for emojis
  const getRandomEmojis = useCallback(() => {
    return Array.from({ length: isMobile ? 5 : 8 }, (_, i) => ({
      id: i,
      emoji: emojis.current[Math.floor(Math.random() * emojis.current.length)],
      x: Math.random() * 100, // random x position (0-100%)
      delay: Math.random() * 0.8, // staggered delay
      scale: 0.8 + Math.random() * 0.5, // random size
    }));
  }, [isMobile]);

  const [floatingEmojis, setFloatingEmojis] = useState(getRandomEmojis());
  
  // Randomize animation type if 'random' is selected
  useEffect(() => {
    if (type === 'random') {
      const types = ['confetti', 'stars', 'circles', 'fireworks'];
      const randomType = types[Math.floor(Math.random() * types.length)] as typeof type;
      setAnimationType(randomType);
    } else {
      setAnimationType(type);
    }
  }, [type, trigger]);
  
  // The main animation sequence
  const runAnimation = useCallback(() => {
    // First show the animation overlay
    setShowCelebration(true);
    
    // Update emojis with new random positions
    setFloatingEmojis(getRandomEmojis());
    
    // Run the badge animation sequence
    controls.start({
      scale: [0.5, 1.1, 1],
      opacity: [0, 1, 1],
      rotate: [0, -5, 5, -2, 0],
      transition: { 
        duration: 0.8,
        ease: "easeOut" 
      }
    });
    
    // Show toast if message is provided - with slight delay so visual effects appear first
    if (message) {
      setTimeout(() => {
        toast({
          title: "Success!",
          description: message,
          variant: "default",
        });
      }, 300);
    }
    
    // Run onComplete callback after duration
    setTimeout(() => {
      setShowCelebration(false);
      onComplete();
    }, duration);
  }, [animationType, message, duration, onComplete, toast, controls, getRandomEmojis]);
  
  useEffect(() => {
    if (trigger) {
      hasAnimated.current = true;
      runAnimation();
    }
    
    // Only reset hasAnimated when trigger is false
    if (!trigger) {
      hasAnimated.current = false;
    }
  }, [trigger, runAnimation]);
  
  // Create a more elaborate celebration overlay
  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Confetti explosion using our enhanced component */}
          {animationType !== 'random' && (
            <ConfettiExplosion
              duration={duration * 0.8}
              particleCount={animationConfigs[animationType].particleCount}
              spread={animationConfigs[animationType].spread}
              origin={animationConfigs[animationType].origin}
              colors={animationConfigs[animationType].colors}
            />
          )}
          
          {/* Floating emojis */}
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              className="absolute text-4xl"
              initial={{ 
                y: "110vh", 
                x: `${item.x}vw`,
                opacity: 0.3, 
                scale: item.scale 
              }}
              animate={{ 
                y: "-20vh", 
                opacity: [0.3, 1, 0],
                rotate: Math.random() > 0.5 ? [0, 15, -15, 0] : [0, -15, 15, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: item.delay,
                ease: "easeOut" 
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
          
          {/* Central success badge - show for certain animation types */}
          {(animationType === 'fireworks' || animationType === 'stars') && (
            <motion.div 
              animate={controls}
              className="relative rounded-full bg-white shadow-xl p-8 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-xl" />
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white to-slate-100" />
              <div className="relative flex flex-col items-center text-primary-700">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-12 h-12 text-primary"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <motion.path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M22 4L12 14.01l-3-3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <motion.p 
                  className="text-sm font-medium mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  Great job!
                </motion.p>
              </div>
            </motion.div>
          )}
          
          {/* Show tropical drink animation for some celebration types */}
          {(animationType === 'confetti' || animationType === 'random') && (
            <TropicalDrink />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}