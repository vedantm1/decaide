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
  startOnboarding: () => void; // New guided tour function
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

  // Implement onboarding tour with Diego the Dolphin
  const startOnboarding = () => {
    // Array of onboarding steps with messages and positions
    const onboardingSteps = [
      {
        message: "Welcome to DecA(I)de! Let me guide you through our platform. We'll help you prepare for your DECA competition!",
        position: 'bottom-right' as const
      },
      {
        message: "The Dashboard shows your progress, daily challenges, and recommended practice activities.",
        position: 'top-right' as const
      },
      {
        message: "Practice roleplays to improve your business presentation skills with real-time AI feedback.",
        position: 'bottom-left' as const
      },
      {
        message: "Take practice tests to prepare for the exam portion of your DECA event.",
        position: 'top-left' as const
      },
      {
        message: "Track your progress on performance indicators - master these to excel in your competition!",
        position: 'bottom-right' as const
      }
    ];
    
    // Show first step
    let currentStep = 0;
    showMascot(onboardingSteps[currentStep].message, onboardingSteps[currentStep].position);
    
    // Set up listener for the "Got it!" button clicks
    const moveToNextStep = () => {
      currentStep++;
      if (currentStep < onboardingSteps.length) {
        setTimeout(() => {
          showMascot(onboardingSteps[currentStep].message, onboardingSteps[currentStep].position);
        }, 500);
      }
    };
    
    // Use a custom event to connect the mascot's "Got it" button with moving to next step
    document.addEventListener('mascot-acknowledged', moveToNextStep, { once: false });
    
    // Clean up after the tour is done
    if (currentStep >= onboardingSteps.length - 1) {
      document.removeEventListener('mascot-acknowledged', moveToNextStep);
    }
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
      
      {/* Diego the Dolphin Mascot - Enhanced with more animations */}
      {mascotDetails.show && (
        <div 
          className={`fixed z-50 max-w-xs animate-bounce-slow ${
            mascotDetails.position === 'bottom-right' ? 'bottom-5 right-5' :
            mascotDetails.position === 'top-right' ? 'top-5 right-5' :
            mascotDetails.position === 'bottom-left' ? 'bottom-5 left-5' :
            'top-5 left-5'
          }`}
        >
          <div className="relative bg-gradient-to-br from-blue-100 to-cyan-50 p-5 rounded-xl border border-blue-200 shadow-lg overflow-hidden">
            {/* Enhanced animated water waves with multiple layers */}
            <div className="absolute inset-0 overflow-hidden rounded-xl opacity-30">
              <div className="absolute animate-wave-1 h-24 w-[200%] -bottom-10 left-0 right-0 bg-cyan-400 rounded-t-[100%]"></div>
              <div className="absolute animate-wave-2 h-20 w-[200%] -bottom-8 left-0 right-0 bg-blue-400 rounded-t-[100%]"></div>
              <div className="absolute animate-wave-3 h-16 w-[200%] -bottom-6 left-0 right-0 bg-blue-300 rounded-t-[100%]"></div>
            </div>
            
            {/* Animated water splash effect */}
            <div className="absolute -left-2 -bottom-1">
              <div className="animate-splash-left w-6 h-12 bg-blue-200 opacity-50 rounded-full blur-sm"></div>
            </div>
            <div className="absolute -right-2 -bottom-1">
              <div className="animate-splash-right w-6 h-12 bg-blue-200 opacity-50 rounded-full blur-sm"></div>
            </div>
            
            {/* Diego dolphin with enhanced animation */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-6xl animate-dolphin-jump">
              <div className="relative">
                <span className="block transform rotate-[-5deg]">🐬</span>
                {/* Water splash particles */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <div className="animate-splash-out-1 w-1 h-1 bg-blue-300 rounded-full absolute"></div>
                  <div className="animate-splash-out-2 w-1 h-1 bg-blue-300 rounded-full absolute"></div>
                  <div className="animate-splash-out-3 w-1 h-1 bg-blue-300 rounded-full absolute"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center relative z-10">
              <p className="font-bold text-blue-800 text-lg animate-text-focus-in">Hi, I'm Diego the Dolphin!</p>
              <p className="text-sm text-blue-700 mt-2 leading-relaxed animate-fade-in">
                {mascotDetails.message}
              </p>
              <button 
                onClick={(e) => {
                  // Dispatch custom event for onboarding tour
                  document.dispatchEvent(new CustomEvent('mascot-acknowledged'));
                  hideMascot();
                }}
                className="mt-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors duration-200 animate-pulse-light"
              >
                Got it!
              </button>
            </div>
            
            {/* Enhanced bubbles animation with more bubbles */}
            <div className="absolute -right-2 top-1/3 transform -translate-y-1/2">
              <div className="animate-bubble-1 w-2 h-2 rounded-full bg-blue-300 opacity-80"></div>
              <div className="animate-bubble-2 w-3 h-3 rounded-full bg-blue-300 opacity-60 mt-2"></div>
              <div className="animate-bubble-3 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-70 mt-1"></div>
              <div className="animate-bubble-4 w-2.5 h-2.5 rounded-full bg-blue-300 opacity-50 mt-1"></div>
            </div>
            <div className="absolute -left-2 top-2/3 transform -translate-y-1/2">
              <div className="animate-bubble-2 w-2 h-2 rounded-full bg-blue-300 opacity-70"></div>
              <div className="animate-bubble-3 w-1 h-1 rounded-full bg-blue-300 opacity-80 mt-1"></div>
              <div className="animate-bubble-1 w-1.5 h-1.5 rounded-full bg-blue-300 opacity-60 mt-1"></div>
            </div>
            
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
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