import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  shouldShowOnboarding: boolean;
  completeOnboarding: () => void;
  startOnboarding: () => void;
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
    setIsOnboardingOpen(true);
    setShouldShowOnboarding(true);
  };

  const value = {
    isOnboardingOpen,
    shouldShowOnboarding,
    completeOnboarding,
    startOnboarding,
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