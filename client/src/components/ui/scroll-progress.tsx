import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrollProgressProps {
  target?: string; // CSS selector for the target element to track
  className?: string;
}

export function ScrollProgress({ target, className }: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const targetElement = target ? document.querySelector(target) : window;
      
      if (target && targetElement) {
        // Track specific element scroll
        const element = targetElement as Element;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
      } else {
        // Track window scroll
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    const targetElement = target ? document.querySelector(target) : window;
    
    if (targetElement) {
      targetElement.addEventListener('scroll', updateScrollProgress);
      // Initial calculation
      updateScrollProgress();
      
      return () => {
        targetElement.removeEventListener('scroll', updateScrollProgress);
      };
    }
  }, [target]);

  return (
    <div className={`scroll-indicator ${className || ''}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40"
        style={{
          width: `${scrollProgress}%`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${scrollProgress}%` }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40 
        }}
      />
    </div>
  );
}