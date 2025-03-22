import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import SuccessAnimation from '@/components/animations/success-animation';
import BreakTimer from '@/components/break-timer';
import BreakGameModal from '@/components/break-timer/break-game-modal';
import { useToast } from '@/hooks/use-toast';

// Animation types supported by our system
type AnimationType = 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';

// Define the context type with all micro-interaction functions
type MicroInteractionsContextType = {
  triggerAnimation: (type?: AnimationType, message?: string) => void;
  showBreakTimer: () => void;
  hideBreakTimer: () => void;
  showBreakGame: (duration?: number) => void;
  hideBreakGame: () => void;
  showAchievement: (title: string, description: string, points?: number) => void;
  startOnboarding: () => void;
};

export const MicroInteractionsContext = createContext<MicroInteractionsContextType | null>(null);

export function MicroInteractionsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Animation state
  const [animationDetails, setAnimationDetails] = useState<{
    trigger: boolean;
    type: AnimationType;
    message?: string;
  }>({
    trigger: false,
    type: 'random',
  });

  // Break timer state
  const [showBreakTimerState, setShowBreakTimerState] = useState(false);
  
  // Break game state
  const [breakGameDetails, setBreakGameDetails] = useState<{
    show: boolean;
    duration: number;
  }>({
    show: false,
    duration: 300, // 5 minutes in seconds
  });

  // Trigger a success animation with optional message
  const triggerAnimation = useCallback((type: AnimationType = 'random', message?: string) => {
    setAnimationDetails({
      trigger: true,
      type,
      message,
    });
  }, []);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    setAnimationDetails(prev => ({
      ...prev,
      trigger: false,
    }));
  }, []);

  // Show break timer
  const showBreakTimer = useCallback(() => {
    setShowBreakTimerState(true);
  }, []);

  // Hide break timer
  const hideBreakTimer = useCallback(() => {
    setShowBreakTimerState(false);
  }, []);

  // Show break game with mini-games
  const showBreakGame = useCallback((duration: number = 300) => {
    setBreakGameDetails({
      show: true,
      duration,
    });
  }, []);

  // Hide break game
  const hideBreakGame = useCallback(() => {
    setBreakGameDetails({
      ...breakGameDetails,
      show: false,
    });
  }, [breakGameDetails]);

  // Show achievement notification with points
  const showAchievement = useCallback((title: string, description: string, points: number = 0) => {
    // Trigger stars animation
    triggerAnimation('stars');
    
    // Show toast with achievement details
    toast({
      title: `🏆 ${title}`,
      description: (
        <div className="space-y-1">
          <p>{description}</p>
          {points > 0 && (
            <p className="font-semibold text-primary">+{points} points</p>
          )}
        </div>
      ),
      duration: 5000,
    });
  }, [toast, triggerAnimation]);

  // Implement onboarding tour - placeholders for future implementation
  const startOnboarding = useCallback(() => {
    toast({
      title: "Onboarding",
      description: "Welcome to DecA(I)de! Let's get you started with a quick tour.",
      duration: 5000,
    });
    // Future: implement a step-by-step tour
  }, [toast]);

  return (
    <MicroInteractionsContext.Provider
      value={{
        triggerAnimation,
        showBreakTimer,
        hideBreakTimer,
        showBreakGame,
        hideBreakGame,
        showAchievement,
        startOnboarding,
      }}
    >
      {children}
      
      {/* Success animation component */}
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
      
      {/* Break Game with mini-games */}
      {breakGameDetails.show && (
        <BreakGameModal 
          isOpen={breakGameDetails.show} 
          onClose={hideBreakGame} 
          breakDuration={breakGameDetails.duration}
        />
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