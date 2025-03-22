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
      
      {/* Diego the Dolphin Mascot */}
      {mascotDetails.show && (
        <div 
          className={`fixed z-50 max-w-xs animate-bounce-slow ${
            mascotDetails.position === 'bottom-right' ? 'bottom-5 right-5' :
            mascotDetails.position === 'top-right' ? 'top-5 right-5' :
            mascotDetails.position === 'bottom-left' ? 'bottom-5 left-5' :
            'top-5 left-5'
          }`}
        >
          <div className="relative bg-gradient-to-br from-blue-100 to-cyan-50 p-5 rounded-xl border border-blue-200 shadow-lg">
            {/* Animated water waves */}
            <div className="absolute inset-0 overflow-hidden rounded-xl opacity-20">
              <div className="absolute animate-wave-1 h-24 w-[200%] -bottom-10 left-0 right-0 bg-cyan-400 rounded-t-[100%]"></div>
              <div className="absolute animate-wave-2 h-24 w-[200%] -bottom-10 left-0 right-0 bg-blue-400 rounded-t-[100%]"></div>
            </div>
            
            {/* Diego emoji with animation */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-6xl animate-float">
              🐬
            </div>
            
            <div className="mt-12 text-center relative z-10">
              <p className="font-bold text-blue-800 text-lg">Hi, I'm Diego the Dolphin!</p>
              <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                {mascotDetails.message}
              </p>
              <button 
                onClick={hideMascot}
                className="mt-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors duration-200"
              >
                Got it!
              </button>
            </div>
            
            {/* Bubbles Animation */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-bubble-1 w-2 h-2 rounded-full bg-blue-300 opacity-80"></div>
              <div className="animate-bubble-2 w-3 h-3 rounded-full bg-blue-300 opacity-60 mt-2"></div>
              <div className="animate-bubble-3 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-70 mt-2"></div>
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