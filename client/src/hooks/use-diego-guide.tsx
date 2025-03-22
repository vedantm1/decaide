import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Tutorial step types
export type TutorialStep = 
  | 'welcome'
  | 'dashboard'
  | 'navigation'
  | 'roleplay'
  | 'performance_indicators'
  | 'practice_tests'
  | 'written_events'
  | 'progress'
  | 'settings'
  | 'complete'
  | null;

interface DiegoGuideContextType {
  isVisible: boolean;
  showDiego: (step?: TutorialStep) => void;
  hideDiego: () => void;
  currentStep: TutorialStep;
  setCurrentStep: (step: TutorialStep) => void;
  completeTutorial: () => void;
  hasTutorialCompleted: boolean;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}

const DiegoGuideContext = createContext<DiegoGuideContextType | null>(null);

export function DiegoGuideProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep>(null);
  const [hasTutorialCompleted, setHasTutorialCompleted] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check localStorage on initial render to see if the user has completed the tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted');
    if (tutorialCompleted === 'true') {
      setHasTutorialCompleted(true);
    }

    // Check if this is a new user
    const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
    if (isFirstTimeUser) {
      setIsNewUser(true);
      localStorage.setItem('isFirstTimeUser', 'false');
    }
  }, []);

  // Show Diego with an optional specific step
  const showDiego = (step: TutorialStep = 'welcome') => {
    setCurrentStep(step);
    setIsVisible(true);
  };

  // Hide Diego
  const hideDiego = () => {
    setIsVisible(false);
  };

  // Mark the tutorial as completed
  const completeTutorial = () => {
    setHasTutorialCompleted(true);
    localStorage.setItem('diegoTutorialCompleted', 'true');
    hideDiego();
  };

  return (
    <DiegoGuideContext.Provider
      value={{
        isVisible,
        showDiego,
        hideDiego,
        currentStep,
        setCurrentStep,
        completeTutorial,
        hasTutorialCompleted,
        isNewUser,
        setIsNewUser,
      }}
    >
      {children}
    </DiegoGuideContext.Provider>
  );
}

export function useDiegoGuide() {
  const context = useContext(DiegoGuideContext);
  if (!context) {
    throw new Error('useDiegoGuide must be used within a DiegoGuideProvider');
  }
  return context;
}