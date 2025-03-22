import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';

export interface SuccessAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';
  message?: string;
  duration?: number;
}

const animations: Record<string, () => void> = {
  confetti: () => {
    const duration = 1500;
    const end = Date.now() + duration;
    
    const colors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4'];
    
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },
  
  stars: () => {
    const end = Date.now() + 1000;
    
    const colors = ['#f59e0b', '#facc15', '#eab308'];
    
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        shapes: ['star'],
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        shapes: ['star'],
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },
  
  circles: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
      shapes: ['circle'],
    });
  },
  
  fireworks: () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    
    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
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
  
  useEffect(() => {
    if (trigger && !hasAnimated.current) {
      hasAnimated.current = true;
      
      // Run the animation based on the selected type
      animations[type]();
      
      // Show toast if message is provided
      if (message) {
        toast({
          title: "Success!",
          description: message,
          variant: "default",
        });
      }
      
      // Run onComplete callback after duration
      setTimeout(() => {
        onComplete();
      }, duration);
    }
    
    return () => {
      hasAnimated.current = false;
    };
  }, [trigger, type, message, duration, onComplete, toast]);
  
  // Render animated overlay if needed
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Optional overlay content can be added here */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}