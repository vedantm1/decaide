import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface ThreeEnvironmentContextProps {
  enabled: boolean;
  colorScheme: string;
  eventType: string;
  isDarkMode: boolean;
  showNavigationSystem: boolean;
  showDiego: boolean;
  showAchievement: (title: string, description: string, points: number) => void;
  dismissAchievement: () => void;
  setEventType: (type: string) => void;
  toggleEnvironment: () => void;
}

const ThreeEnvironmentContext = createContext<ThreeEnvironmentContextProps>({
  enabled: true,
  colorScheme: 'aquaBlue',
  eventType: 'default',
  isDarkMode: false,
  showNavigationSystem: true,
  showDiego: true,
  showAchievement: () => {},
  dismissAchievement: () => {},
  setEventType: () => {},
  toggleEnvironment: () => {}
});

interface Achievement {
  title: string;
  description: string;
  points: number;
}

export const ThreeEnvironmentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [location] = useLocation();
  const [enabled, setEnabled] = useState(true);
  const [colorScheme, setColorScheme] = useState('aquaBlue');
  const [eventType, setEventType] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNavigationSystem, setShowNavigationSystem] = useState(true);
  const [showDiego, setShowDiego] = useState(true);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [showAchievementState, setShowAchievementState] = useState(false);
  
  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      if (customEvent.detail) {
        setColorScheme(customEvent.detail.colorScheme || 'aquaBlue');
        
        // Check for dark mode
        const darkMode = document.documentElement.classList.contains('dark');
        setIsDarkMode(darkMode);
      }
    };
    
    // Initial check for dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    window.addEventListener('themechange', handleThemeChange);
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);
  
  // Update event type based on current route
  useEffect(() => {
    // Determine event type from route
    if (location.includes('/roleplay')) {
      setEventType('marketing');
    } else if (location.includes('/finance')) {
      setEventType('finance');
    } else if (location.includes('/hospitality')) {
      setEventType('hospitality');
    } else {
      setEventType('default');
    }
    
    // Hide Diego and navigation on login/auth page
    if (location === '/auth' || location === '/login') {
      setShowDiego(false);
      setShowNavigationSystem(false);
    } else {
      setShowDiego(true);
      setShowNavigationSystem(true);
    }
  }, [location]);
  
  // Show achievement popup
  const showAchievement = (title: string, description: string, points: number) => {
    setAchievement({ title, description, points });
    setShowAchievementState(true);
  };
  
  // Dismiss achievement popup
  const dismissAchievement = () => {
    setShowAchievementState(false);
  };
  
  // Toggle environment on/off
  const toggleEnvironment = () => {
    setEnabled(!enabled);
  };
  
  return (
    <ThreeEnvironmentContext.Provider
      value={{
        enabled,
        colorScheme,
        eventType,
        isDarkMode,
        showNavigationSystem,
        showDiego,
        showAchievement,
        dismissAchievement,
        setEventType,
        toggleEnvironment
      }}
    >
      {children}
      
      {/* Achievement display will be handled by the ThreeEnvironment component */}
    </ThreeEnvironmentContext.Provider>
  );
};

export const useThreeEnvironment = () => useContext(ThreeEnvironmentContext);

export default useThreeEnvironment;