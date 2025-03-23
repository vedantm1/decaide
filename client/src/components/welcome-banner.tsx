import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiegoGuide } from '@/hooks/use-diego-guide';

/**
 * WelcomeBanner - Displays a welcome banner after completing the Diego tutorial
 * Appears at the top of the screen and automatically disappears after a few seconds
 */
export default function WelcomeBanner() {
  const { isNewUser, hasTutorialCompleted } = useDiegoGuide();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  
  // Show welcome banner after tutorial is completed
  useEffect(() => {
    if (hasTutorialCompleted && isNewUser) {
      setShowWelcomeBanner(true);
      
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasTutorialCompleted, isNewUser]);
  
  return (
    <AnimatePresence>
      {showWelcomeBanner && (
        <motion.div 
          className="fixed inset-x-0 top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
        >
          <div className="dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 dark:border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 shadow-lg">
            <div className="container mx-auto flex items-center justify-center gap-2 text-center">
              <span className="animate-pulse text-yellow-200">🏝️</span>
              <span className="font-medium">Welcome to DecA(I)de! 3-day trial activated - enjoy our tropical dolphin assistant!</span>
              <span className="animate-pulse text-yellow-200">🏝️</span>
              <button 
                onClick={() => setShowWelcomeBanner(false)}
                className="ml-2 text-white/80 hover:text-white"
                aria-label="Close welcome banner"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}