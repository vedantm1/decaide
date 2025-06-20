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
    // Disable onboarding to prevent runtime errors
    const hasCompleted = localStorage.getItem('onboardingCompleted');
    if (!hasCompleted) {
      // Don't show onboarding automatically - let user trigger it
      setShouldShowOnboarding(false);
      setIsOnboardingOpen(false);
    }
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