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
    closeChat,
  } = useDiegoGuide();
  
  const { triggerAnimation } = useMicroInteractions();
  const [location] = useState(window.location.pathname.split('?')[0]);
  
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
    </>
  );
}