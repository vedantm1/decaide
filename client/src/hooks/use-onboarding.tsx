import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  shouldShowOnboarding: boolean;
  completeOnboarding: () => void;
  startOnboarding: () => void;
  triggerOnboardingForNewUser: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    // Check for new user flag every time auth context changes
    const checkOnboarding = () => {
      const hasCompleted = localStorage.getItem('onboardingCompleted');
      const isNewUser = localStorage.getItem('isNewUser');
      
      console.log('Onboarding check:', { hasCompleted, isNewUser });
      
      if (!hasCompleted && isNewUser === 'true') {
        console.log('Triggering onboarding for new user');
        setShouldShowOnboarding(true);
        setIsOnboardingOpen(true);
        // Clear the new user flag
        localStorage.removeItem('isNewUser');
      }
    };

    // Initial check
    checkOnboarding();
    
    // Listen for custom event to trigger onboarding
    const handleTriggerOnboarding = () => {
      console.log('Received triggerOnboarding event');
      triggerOnboardingForNewUser();
    };
    
    window.addEventListener('triggerOnboarding', handleTriggerOnboarding);
    
    // Also listen for storage changes in case flag is set after component mounts
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isNewUser' && e.newValue === 'true') {
        checkOnboarding();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check again after a brief delay to handle race conditions
    const timeout = setTimeout(checkOnboarding, 100);
    
    return () => {
      window.removeEventListener('triggerOnboarding', handleTriggerOnboarding);
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeout);
    };
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsOnboardingOpen(false);
    setShouldShowOnboarding(false);
  };

  const startOnboarding = () => {
    console.log('Manually starting onboarding');
    setIsOnboardingOpen(true);
    setShouldShowOnboarding(true);
  };

  const triggerOnboardingForNewUser = () => {
    console.log('Triggering onboarding for new user via direct call');
    setShouldShowOnboarding(true);
    setIsOnboardingOpen(true);
  };

  const value = {
    isOnboardingOpen,
    shouldShowOnboarding,
    completeOnboarding,
    startOnboarding,
    triggerOnboardingForNewUser,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}