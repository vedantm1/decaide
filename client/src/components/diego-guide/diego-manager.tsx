import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDiegoGuide } from '@/hooks/use-diego-guide';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import Diego from './diego';
import DiegoChat from './diego-chat';

/**
 * DiegoManager - Central component for managing Diego's appearance and behaviors
 * This component should be placed in App.tsx to handle all Diego-related functionality
 */
export default function DiegoManager() {
  const {
    isVisible,
    currentStep,
    isNewUser,
    completeTutorial,
    isChatOpen,
    toggleChat,
    closeChat,
    hasTutorialCompleted
  } = useDiegoGuide();
  
  const { triggerAnimation } = useMicroInteractions();
  const [location, setLocation] = useState(window.location.pathname.split('?')[0]);
  
  // Update location when path changes
  useEffect(() => {
    const handleRouteChange = () => {
      setLocation(window.location.pathname.split('?')[0]);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  
  // Handle when Diego guide tutorial is completed
  const handleTutorialComplete = () => {
    completeTutorial();
    
    // Show special celebration animation when tutorial completes
    triggerAnimation('confetti', 'Welcome to DecA(I)de!');
    
    // After a short delay, also show stars animation
    setTimeout(() => {
      triggerAnimation('stars', 'You\'re all set to ace your DECA competitions!');
    }, 1500);
  };
  
  // Hide Diego on auth page
  if (location === '/auth') {
    return null;
  }
  
  return (
    <>
      <AnimatePresence>
        {/* Main Diego Tutorial Component */}
        {isVisible && (
          <Diego
            isNewUser={isNewUser}
            currentStep={currentStep || undefined}
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>
      
      {/* Diego Chat Component */}
      {isChatOpen && <DiegoChat isOpen={isChatOpen} onClose={closeChat} />}
      
      {/* Permanent Diego button that appears after tutorial is completed */}
      {hasTutorialCompleted && !isChatOpen && location !== '/auth' && (
        <motion.button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-2 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Ask Diego"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-primary-foreground"
              fill="currentColor"
            >
              {/* Dolphin silhouette - simplified for button */}
              <path d="M12 3C7 3 4 6 3 9C2 12 2 15 4 18C6 21 9 22 12 22C15 22 18 21 20 18C22 15 22 12 21 9C20 6 17 3 12 3Z" />
              {/* Blowhole */}
              <circle cx="12" cy="4" r="0.5" fill="white" />
              {/* Eye */}
              <circle cx="8" cy="8" r="1.2" fill="white" />
            </svg>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary text-xs px-2 py-1 rounded-full shadow-sm whitespace-nowrap font-medium">
              Ask Diego
            </span>
          </div>
        </motion.button>
      )}
    </>
  );
}