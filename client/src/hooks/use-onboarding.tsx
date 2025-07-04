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
    // Check if user just registered and needs onboarding
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          
          // Show onboarding if user doesn't have an event selected
          const needsOnboarding = !user.eventCode && !user.event_code;
          
          if (needsOnboarding) {
            setShouldShowOnboarding(true);
            setIsOnboardingOpen(true);
            console.log('Onboarding should be visible now - user needs event selection');
          }
        }
      } catch (error) {
        console.log('Not authenticated, onboarding not needed');
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsOnboardingOpen(false);
    setShouldShowOnboarding(false);
    // Trigger a page reload to refresh user data
    window.location.reload();
  };

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
    setShouldShowOnboarding(true);
  };

  // Debug function to manually trigger onboarding
  window.showTutorial = () => {
    setIsOnboardingOpen(true);
    setShouldShowOnboarding(true);
    console.log('Manual tutorial trigger activated');
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