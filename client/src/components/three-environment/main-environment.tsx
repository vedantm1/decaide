import React, { useState, useEffect } from 'react';
import { useThreeEnvironment } from '@/hooks/use-three-environment';
import { useDiegoGuide } from '@/hooks/use-diego-guide';
import ThreeEnvironment from './index';
import NavigationSystem from './navigation-system';
import DiegoCharacter from './diego-character';
import AchievementSystem from './achievement-system';
import InteractiveCard from './interactive-card';
import { motion, AnimatePresence } from 'framer-motion';

// Main environment wrapper that integrates all 3D components
const MainThreeEnvironment: React.FC = () => {
  const { 
    enabled, 
    colorScheme, 
    eventType, 
    isDarkMode,
    showNavigationSystem,
    showDiego,
    dismissAchievement
  } = useThreeEnvironment();
  
  const { 
    isNewUser, 
    currentStep, 
    completeTutorial, 
    isChatOpen, 
    toggleChat 
  } = useDiegoGuide();
  
  const [achievementData, setAchievementData] = useState<{
    title: string;
    description: string;
    points: number;
    isVisible: boolean;
  } | null>(null);
  
  // Listen for achievement events
  useEffect(() => {
    const handleAchievementEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        description: string;
        points: number;
      }>;
      
      if (customEvent.detail) {
        setAchievementData({
          ...customEvent.detail,
          isVisible: true
        });
      }
    };
    
    window.addEventListener('achievement', handleAchievementEvent);
    return () => {
      window.removeEventListener('achievement', handleAchievementEvent);
    };
  }, []);
  
  // Handle achievement dismissal
  const handleAchievementComplete = () => {
    if (achievementData) {
      setAchievementData({
        ...achievementData,
        isVisible: false
      });
      
      setTimeout(() => {
        setAchievementData(null);
        dismissAchievement();
      }, 500);
    }
  };
  
  // Handle Diego click to open chat
  const handleDiegoClick = () => {
    toggleChat();
  };
  
  // Map Diego's emotion state based on guide state
  const getDiegoEmotion = () => {
    if (isNewUser) return 'excited';
    if (isChatOpen) return 'happy';
    if (currentStep === 'welcome') return 'excited';
    if (currentStep === 'navigation') return 'thinking';
    return 'idle';
  };
  
  // Don't render if disabled
  if (!enabled) return null;
  
  return (
    <>
      {/* Main 3D environment */}
      <ThreeEnvironment 
        colorScheme={colorScheme}
        eventType={eventType}
      >
        {/* 3D Navigation System */}
        {showNavigationSystem && (
          <NavigationSystem 
            colorScheme={colorScheme}
            isDarkMode={isDarkMode}
          />
        )}
        
        {/* Diego Character */}
        {showDiego && (
          <DiegoCharacter
            position={[8, 0, 2]}
            rotation={[0, -Math.PI / 4, 0]}
            scale={1}
            colorScheme={colorScheme}
            isDarkMode={isDarkMode}
            isNewUser={isNewUser}
            isChatOpen={isChatOpen}
            onDiegoClick={handleDiegoClick}
            emotionState={getDiegoEmotion()}
          />
        )}
        
        {/* Achievement System */}
        {achievementData && (
          <AchievementSystem
            title={achievementData.title}
            description={achievementData.description}
            points={achievementData.points}
            color={colorScheme === 'aquaBlue' ? '#3b82f6' : 
                   colorScheme === 'coralPink' ? '#ec4899' :
                   colorScheme === 'mintGreen' ? '#22c55e' : '#8b5cf6'}
            isVisible={achievementData.isVisible}
            onComplete={handleAchievementComplete}
            isDarkMode={isDarkMode}
          />
        )}
      </ThreeEnvironment>
      
      {/* Mobile performance warning/toggle */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 md:hidden"
          >
            <button 
              onClick={() => {
                // Dispatch custom event to toggle environment
                window.dispatchEvent(new CustomEvent('toggleThreeEnvironment'));
              }}
              className="bg-white dark:bg-slate-800 shadow-lg rounded-full p-3 flex items-center space-x-2"
            >
              <span className="text-yellow-500">⚠️</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                3D may affect performance
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MainThreeEnvironment;