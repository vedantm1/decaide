/**
 * Micro-Interactions Hook and Context Provider
 * This provides a centralized system for triggering various animations and micro-interactions
 * throughout the application, enhancing user experience.
 */
import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import SuccessAnimation from '@/components/animations/success-animation';
import BreakTimer from '@/components/break-timer';
import BreakGameModal from '@/components/break-timer/break-game-modal';
import { useToast } from '@/hooks/use-toast';
import { playAnimation, AnimationType as AnimationEngineType } from '@/lib/animation-engine';

// Animation types supported by our system
export type AnimationType = 
  | 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random'
  | 'sparkles' | 'bubbles' | 'waves' | 'dolphin' | 'tropical'
  | 'achievement' | 'celebrate' | 'success' | 'levelUp' | 'rewardUnlocked'
  | 'rainbowTrail' | 'glitter' | 'paperPlane' | 'floatingNumbers'
  | 'flipCard' | 'rotate3D' | 'bounce' | 'fadeScale' | 'slideSwing'
  | 'popIn' | 'rollOut' | 'blinkFade' | 'wiggle' | 'tremble'
  | 'heartbeat' | 'pulse' | 'flash' | 'tada' | 'jello' | 'rubber'
  | 'swing' | 'wobble' | 'shake' | 'flip' | 'flipInX' | 'flipInY'
  | 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'zoomIn' | 'jackInTheBox'
  | 'lightSpeedIn' | 'rotateIn' | 'rollIn' | 'slideInUp' | 'slideInDown';

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

// Create context with null default value
// We maintain this as a named export for compatibility with existing code
export const MicroInteractionsContext = createContext<MicroInteractionsContextType | null>(null);

// Provider component that wraps around components that need micro-interactions
export function MicroInteractionsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Animation state for legacy animation component
  const [animationDetails, setAnimationDetails] = useState<{
    trigger: boolean;
    type: AnimationType;
    message?: string;
  }>({
    trigger: false,
    type: 'random',
  });

  // Break timer visibility state
  const [showBreakTimerState, setShowBreakTimerState] = useState(false);
  
  // Break game state with duration
  const [breakGameDetails, setBreakGameDetails] = useState<{
    show: boolean;
    duration: number;
  }>({
    show: false,
    duration: 300, // 5 minutes in seconds
  });

  // Trigger an animation with optional message
  const triggerAnimation = useCallback((type: AnimationType = 'random', message?: string) => {
    // Set state for the legacy animation component
    setAnimationDetails({
      trigger: true,
      type,
      message,
    });
    
    // Also use our new animation engine for enhanced animations
    playAnimation({
      type: type as AnimationEngineType,
      message,
      particleCount: type === 'random' ? 150 : 100, // More particles for random animations
      duration: 3000,
      colorScheme: 'tropical', // Use tropical theme by default
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
    // Trigger achievement-specific animations
    triggerAnimation('achievement');
    
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
      
      {/* Success animation component - only use for basic animation types that it supports */}
      <SuccessAnimation
        trigger={animationDetails.trigger}
        onComplete={handleAnimationComplete}
        type={animationDetails.type === 'confetti' || 
              animationDetails.type === 'stars' || 
              animationDetails.type === 'circles' || 
              animationDetails.type === 'fireworks' || 
              animationDetails.type === 'random' 
                ? animationDetails.type 
                : 'random'}
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

// Hook for accessing the micro-interactions context
export function useMicroInteractions() {
  const context = useContext(MicroInteractionsContext);
  if (!context) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionsProvider');
  }
  return context;
}