import { createContext, ReactNode, useContext, useState } from 'react';
import SuccessAnimation from '@/components/animations/success-animation';
import BreakTimer from '@/components/break-timer';
import { useIsMobile } from '@/hooks/use-mobile';

type AnimationType = 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';

type MicroInteractionsContextType = {
  triggerAnimation: (type?: AnimationType, message?: string) => void;
  showBreakTimer: () => void;
  hideBreakTimer: () => void;
  showMascot: (message: string, position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left') => void;
  hideMascot: () => void;
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
  
  const [mascotDetails, setMascotDetails] = useState<{
    show: boolean;
    message: string;
    position: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  }>({
    show: false,
    message: '',
    position: 'bottom-right',
  });

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

  // Show mascot
  const showMascot = (
    message: string,
    position: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left' = 'bottom-right'
  ) => {
    setMascotDetails({
      show: true,
      message,
      position,
    });
  };

  // Hide mascot
  const hideMascot = () => {
    setMascotDetails(prev => ({
      ...prev,
      show: false,
    }));
  };

  return (
    <MicroInteractionsContext.Provider
      value={{
        triggerAnimation,
        showBreakTimer,
        hideBreakTimer,
        showMascot,
        hideMascot,
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
      
      {/* Diego the Mascot */}
      {mascotDetails.show && (
        <div className={`fixed z-50 max-w-xs ${
          mascotDetails.position === 'bottom-right' ? 'bottom-5 right-5' :
          mascotDetails.position === 'top-right' ? 'top-5 right-5' :
          mascotDetails.position === 'bottom-left' ? 'bottom-5 left-5' :
          'top-5 left-5'
        }`}>
          <div className="relative bg-blue-100 p-4 rounded-lg">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">
              🐬
            </div>
            <div className="mt-10 text-center">
              <p className="font-medium text-blue-800">Hi, I'm Diego!</p>
              <p className="text-sm text-blue-700 mt-1">
                {mascotDetails.message}
              </p>
              <button 
                onClick={hideMascot}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
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