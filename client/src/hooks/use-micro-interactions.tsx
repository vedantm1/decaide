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

  // Hide mascot - completely reset mascot state to ensure it disappears properly
  const hideMascot = () => {
    // Reset completely to default state instead of just toggling show
    setMascotDetails({
      show: false,
      message: '',
      position: 'bottom-right',
    });
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
      
      {/* Diego the Dolphin Mascot - Simple version */}
      {mascotDetails.show && (
        <div 
          className={`fixed z-50 max-w-xs ${
            mascotDetails.position === 'bottom-right' ? 'bottom-5 right-5' :
            mascotDetails.position === 'top-right' ? 'top-5 right-5' :
            mascotDetails.position === 'bottom-left' ? 'bottom-5 left-5' :
            'top-5 left-5'
          }`}
        >
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-lg">
            <div className="text-center">
              <p className="font-bold text-blue-800 text-lg">Hi, I'm Diego the Dolphin!</p>
              <p className="text-sm text-blue-700 mt-2">
                {mascotDetails.message}
              </p>
              <div className="flex justify-center mt-3">
                <button 
                  onClick={() => {
                    // Dispatch custom event for onboarding tour
                    document.dispatchEvent(new CustomEvent('mascot-acknowledged'));
                    // Ensure it fully disappears
                    hideMascot();
                  }}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full"
                >
                  Got it!
                </button>
              </div>
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