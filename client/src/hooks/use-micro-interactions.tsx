import { createContext, ReactNode, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      
      {/* Diego the Dolphin Mascot - Advanced interactive version */}
      {mascotDetails.show && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 15 }}
          className={`fixed z-50 max-w-sm ${
            mascotDetails.position === 'bottom-right' ? 'bottom-5 right-5' :
            mascotDetails.position === 'top-right' ? 'top-5 right-5' :
            mascotDetails.position === 'bottom-left' ? 'bottom-5 left-5' :
            'top-5 left-5'
          }`}
        >
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-200 shadow-xl">
            {/* Mascot visuals */}
            <div className="absolute -top-16 -left-8 w-24 h-24 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <g transform="translate(50 50)">
                  {/* Dolphin head */}
                  <ellipse cx="0" cy="0" rx="35" ry="40" fill="#3B82F6" />
                  
                  {/* Dolphin smile */}
                  <path d="M-15,10 Q0,25 15,10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Eyes */}
                  <circle cx="-10" cy="-5" r="6" fill="white" />
                  <circle cx="10" cy="-5" r="6" fill="white" />
                  <circle cx="-10" cy="-5" r="3" fill="black" />
                  <circle cx="10" cy="-5" r="3" fill="black" />
                  
                  {/* Blush */}
                  <circle cx="-18" cy="8" r="5" fill="#F87171" opacity="0.5" />
                  <circle cx="18" cy="8" r="5" fill="#F87171" opacity="0.5" />
                </g>
              </svg>
            </div>
            
            {/* Memphis-style decoration elements */}
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-yellow-300 opacity-70"></div>
            <div className="absolute bottom-3 right-14 w-7 h-2 bg-pink-400 opacity-60 rotate-12"></div>
            
            <div className="pl-16">
              <div className="text-left">
                <p className="font-bold text-blue-800 text-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                  {mascotDetails.message.length > 50 ? "Diego says:" : "Hi, I'm Diego!"}
                </p>
                <div className="relative">
                  <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                    {mascotDetails.message}
                  </p>
                  <div className="absolute -left-4 -top-6 text-5xl text-blue-200 opacity-20">"</div>
                  <div className="absolute -right-4 -bottom-6 text-5xl text-blue-200 opacity-20">"</div>
                </div>
                <div className="flex justify-start mt-4 space-x-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Dispatch custom event for onboarding tour
                      document.dispatchEvent(new CustomEvent('mascot-acknowledged'));
                      // Add a tiny delay to make the animation feel more natural
                      setTimeout(hideMascot, 120);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Got it!
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={hideMascot}
                    className="px-3 py-2 bg-transparent text-blue-600 font-medium rounded-full hover:bg-blue-50 transition-all duration-200"
                  >
                    Dismiss
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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