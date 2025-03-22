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