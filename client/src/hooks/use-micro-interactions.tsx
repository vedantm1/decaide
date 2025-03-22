import { createContext, ReactNode, useContext, useState } from 'react';
import SuccessAnimation from '@/components/animations/success-animation';
import BreakTimer from '@/components/break-timer';

type AnimationType = 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';

type MicroInteractionsContextType = {
  triggerAnimation: (type?: AnimationType, message?: string) => void;
  showBreakTimer: () => void;
  hideBreakTimer: () => void;
  showMascot: (message: string, position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left') => void;
  hideMascot: () => void;
  startOnboarding: () => void;
};

export const MicroInteractionsContext = createContext<MicroInteractionsContextType | null>(null);

export function MicroInteractionsProvider({ children }: { children: ReactNode }) {
  const [animationDetails, setAnimationDetails] = useState<{
    trigger: boolean;
    type: AnimationType;
    message?: string;
  }>({
    trigger: false,
    type: 'random',
  });

  const [showBreakTimerState, setShowBreakTimerState] = useState(false);
  
  // Trigger a success animation
  const triggerAnimation = (type: AnimationType = 'random', message?: string) => {
    setAnimationDetails({
      trigger: true,
      type,
      message,
    });
  };

  // Handle animation complete
  const handleAnimationComplete = () => {
    setAnimationDetails(prev => ({
      ...prev,
      trigger: false,
    }));
  };

  // Show break timer
  const showBreakTimer = () => {
    setShowBreakTimerState(true);
  };

  // Hide break timer
  const hideBreakTimer = () => {
    setShowBreakTimerState(false);
  };

  // Show mascot - TEMPORARILY DISABLED
  const showMascot = (
    message: string,
    position: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left' = 'bottom-right'
  ) => {
    // Temporarily disabled
    console.log('Diego mascot temporarily disabled');
  };

  // Hide mascot - TEMPORARILY DISABLED
  const hideMascot = () => {
    // Temporarily disabled
    console.log('Diego mascot temporarily disabled');
  };

  // Implement onboarding tour - TEMPORARILY DISABLED
  const startOnboarding = () => {
    // Temporarily disabled
    console.log('Onboarding tour temporarily disabled');
  };

  return (
    <MicroInteractionsContext.Provider
      value={{
        triggerAnimation,
        showBreakTimer,
        hideBreakTimer,
        showMascot,
        hideMascot,
        startOnboarding,
      }}
    >
      {children}
      
      {/* Animation component */}
      <SuccessAnimation
        trigger={animationDetails.trigger}
        onComplete={handleAnimationComplete}
        type={animationDetails.type}
        message={animationDetails.message}
      />
      
      {/* Break Timer */}
      {showBreakTimerState && (
        <BreakTimer onClose={hideBreakTimer} />
      )}
      
      {/* Diego the Dolphin Mascot - TEMPORARILY REMOVED */}
    </MicroInteractionsContext.Provider>
  );
}

export function useMicroInteractions() {
  const context = useContext(MicroInteractionsContext);
  if (!context) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionsProvider');
  }
  return context;
}