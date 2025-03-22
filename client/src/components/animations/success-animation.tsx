import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SuccessAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';
  message?: string;
  duration?: number;
}

const animations: Record<string, () => void> = {
  confetti: () => {
    // Single burst instead of continuous animation
    const colors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4'];
    
    // Left side burst
    confetti({
      particleCount: 15,
      angle: 60,
      spread: 40,
      origin: { x: 0.2, y: 0.6 },
      colors: colors,
      scalar: 0.8, // Smaller particles
      disableForReducedMotion: true // Accessibility
    });
    
    // Right side burst
    confetti({
      particleCount: 15,
      angle: 120,
      spread: 40,
      origin: { x: 0.8, y: 0.6 },
      colors: colors,
      scalar: 0.8,
      disableForReducedMotion: true
    });
  },
  
  stars: () => {
    // Simplified stars effect
    const colors = ['#f59e0b', '#facc15', '#eab308'];
    
    confetti({
      particleCount: 10,
      spread: 70,
      shapes: ['star'],
      origin: { x: 0.5, y: 0.5 },
      colors: colors,
      scalar: 0.7,
      disableForReducedMotion: true
    });
  },
  
  circles: () => {
    // Lightweight circles effect
    confetti({
      particleCount: 30, // Reduced from 100
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
      shapes: ['circle'],
      scalar: 0.8,
      disableForReducedMotion: true
    });
  },
  
  fireworks: () => {
    // Simplified fireworks - just two bursts
    const defaults = { 
      startVelocity: 25, 
      spread: 360, 
      ticks: 50, 
      zIndex: 0,
      disableForReducedMotion: true
    };
    
    // First burst
    confetti({
      ...defaults,
      particleCount: 25,
      origin: { x: 0.3, y: 0.5 }
    });
    
    // Second burst with delay
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 25,
        origin: { x: 0.7, y: 0.5 }
      });
    }, 250);
  },

  // Random will be handled in the component logic
  random: () => {
    const types = ['confetti', 'stars', 'circles', 'fireworks'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    animations[randomType]();
  }
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
  const controls = useAnimationControls();
  
  // Emojis for the floating animation
  const emojis = useRef([
    '🏆', '🌟', '✨', '💯', '🔥', '👏', '🎉', '🚀', '💪', '👍'
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
  
  // The main animation sequence
  const runAnimation = useCallback(() => {
    // First show the animation overlay
    setShowCelebration(true);
    
    // Run the particle animation based on the selected type
    animations[type]();
    
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
  }, [type, message, duration, onComplete, toast, controls, getRandomEmojis]);
  
  useEffect(() => {
    if (trigger && !hasAnimated.current) {
      hasAnimated.current = true;
      runAnimation();
    }
    
    return () => {
      hasAnimated.current = false;
    };
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
          {(type === 'fireworks' || type === 'stars') && (
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}