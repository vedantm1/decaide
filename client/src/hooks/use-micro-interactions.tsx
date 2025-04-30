import React, { createContext, useContext, useState } from 'react';

interface MicroInteractionContextType {
  triggerAnimation: (type?: string, message?: string) => void;
  showAchievement: (title: string, description: string, points: number) => void;
  hideAchievement: () => void;
}

// Default context values
const defaultContext: MicroInteractionContextType = {
  triggerAnimation: () => {},
  showAchievement: () => {},
  hideAchievement: () => {},
};

// Create context
const MicroInteractionContext = createContext<MicroInteractionContextType>(defaultContext);

// Provider component
export const MicroInteractionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showingAchievement, setShowingAchievement] = useState(false);

  // Function to trigger various animations
  const triggerAnimation = (type = 'stars', message?: string) => {
    console.log(`Animation triggered: ${type}, Message: ${message}`);
    // This is a mock implementation that doesn't actually show animations
  };

  // Function to show achievement dialog
  const showAchievement = (title: string, description: string, points: number) => {
    console.log(`Achievement shown: ${title}, ${description}, Points: ${points}`);
    setShowingAchievement(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowingAchievement(false);
    }, 3000);
  };

  // Function to hide achievement dialog
  const hideAchievement = () => {
    setShowingAchievement(false);
  };

  const value = {
    triggerAnimation,
    showAchievement,
    hideAchievement,
  };

  return (
    <MicroInteractionContext.Provider value={value}>
      {children}
    </MicroInteractionContext.Provider>
  );
};

// Hook for components to use micro interactions
export const useMicroInteractions = () => {
  const context = useContext(MicroInteractionContext);
  if (context === undefined) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionsProvider');
  }
  return context;
};