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
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const isNewUser = localStorage.getItem('isNewUser');
    
    // Only show onboarding for new users who haven't completed it
    if (isNewUser === 'true' && onboardingCompleted !== 'true') {
      setShouldShowOnboarding(true);
      setIsOnboardingOpen(true);
      console.log('Onboarding should be visible now');
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.removeItem('isNewUser'); // Clear the new user flag
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