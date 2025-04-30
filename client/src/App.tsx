import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import RoleplayPage from "@/pages/roleplay";
import PerformanceIndicatorsPage from "@/pages/performance-indicators";
import PracticeTestsPage from "@/pages/practice-tests";
import WrittenEventsPage from "@/pages/written-events";
import MyProgressPage from "@/pages/my-progress";
import SettingsPage from "@/pages/settings";
import PricingPage from "@/pages/pricing";
import WhyDecadePage from "@/pages/why-decade";
import InteractionShowcasePage from "@/pages/interaction-showcase";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { MicroInteractionsProvider } from "@/hooks/use-micro-interactions";
import { DiegoGuideProvider, useDiegoGuide } from "@/hooks/use-diego-guide";
import Diego from "@/components/diego-guide/diego";
import DiegoChat from "@/components/diego-guide/diego-chat";
import ThemeProvider from "@/lib/theme-provider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/roleplay" component={RoleplayPage} />
      <ProtectedRoute path="/performance-indicators" component={PerformanceIndicatorsPage} />
      <ProtectedRoute path="/tests" component={PracticeTestsPage} />
      <ProtectedRoute path="/written-events" component={WrittenEventsPage} />
      <ProtectedRoute path="/progress" component={MyProgressPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/interactions" component={InteractionShowcasePage} />
      <Route path="/why-decade" component={WhyDecadePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set the underwater background directly on document body
  useEffect(() => {
    document.body.style.background = 'linear-gradient(to bottom, #22d3ee, #0369a1)'; // cyan-400 to blue-700
    
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <MicroInteractionsProvider>
            <DiegoGuideProvider>
              {/* Use only the clean background with no extra elements */}
              <Router />
              <Toaster />
              <DiegoGuideManager />
            </DiegoGuideProvider>
          </MicroInteractionsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// This component manages the Diego UI using the hook
function DiegoGuideManager() {
  const { 
    isNewUser, 
    currentStep, 
    completeTutorial, 
    isChatOpen, 
    toggleChat, 
    closeChat, 
    hasTutorialCompleted 
  } = useDiegoGuide();
  const [location] = window.location.pathname.split('?');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  
  // For visual customization
  const [visualStyle, setVisualStyle] = useState('memphis');
  const [colorScheme, setColorScheme] = useState('aquaBlue');
  
  // Check localStorage on mount to get user preferences and set up event listeners
  useEffect(() => {
    // Function to update state from storage
    const updateFromStorage = () => {
      const savedAppearance = localStorage.getItem('diegoAppearance');
      if (savedAppearance) {
        try {
          const parsed = JSON.parse(savedAppearance);
          setVisualStyle(parsed.visualStyle || 'memphis');
          setColorScheme(parsed.colorScheme || 'aquaBlue');
          console.log('Theme applied:', parsed.visualStyle, parsed.colorScheme);
        } catch (e) {
          console.error('Failed to parse appearance settings', e);
        }
      }
    };
    
    // Initial load
    updateFromStorage();
    
    // Set up listener for storage changes (for when settings are updated in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'diegoAppearance') {
        updateFromStorage();
      }
    };
    
    // Set up listener for theme change events (from within the same window)
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      if (customEvent.detail) {
        setVisualStyle(customEvent.detail.visualStyle || 'memphis');
        setColorScheme(customEvent.detail.colorScheme || 'aquaBlue');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themechange', handleThemeChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);
  
  // Show welcome banner after tutorial is completed
  useEffect(() => {
    if (hasTutorialCompleted && isNewUser) {
      setShowWelcomeBanner(true);
      
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasTutorialCompleted, isNewUser]);
  
  // Hide Diego on the auth page
  if (location === '/auth') {
    return null;
  }
  
  // Custom onComplete handler
  const handleTutorialComplete = () => {
    completeTutorial();
    setShowWelcomeBanner(true);
  };
  
  return (
    <>
      {/* Welcome banner removed as requested */}

      <Diego 
        isNewUser={isNewUser} 
        currentStep={currentStep || undefined} 
        onComplete={handleTutorialComplete} 
      />
      {isChatOpen && <DiegoChat isOpen={isChatOpen} onClose={closeChat} />}
      
      {/* Permanent Diego button that appears after tutorial is completed */}
      {hasTutorialCompleted && !isChatOpen && location !== '/auth' && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-2 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all hover:scale-110 group"
          aria-label="Ask Diego"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-primary-foreground"
              fill="currentColor"
            >
              {/* Main body - Diego design based on reference */}
              <path 
                d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z" 
                fill="#1AB7EA"
                stroke="#000000"
                strokeWidth="1"
              />
              
              {/* Spikes on top/back */}
              <path 
                d="M6 6L7 5L8 6L9 5L10 6L11 5L12 6L13 5L14 6" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="0.5"
              />
              
              {/* Side fins */}
              <path 
                d="M4 11L2 9L4 8Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="0.5"
              />
              <path 
                d="M20 11L22 9L20 8Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="0.5"
              />
              
              {/* Bottom fins */}
              <path 
                d="M8 20L6 22L9 21Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="0.5"
              />
              <path 
                d="M16 20L18 22L15 21Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="0.5"
              />
              
              {/* Large mouth/beak - black */}
              <path 
                d="M12 12C15 11 18 11 19 12C21 14 19 17 16 18C13 18 12 15 12 12Z" 
                fill="#000000"
              />
              
              {/* Inner mouth detail - white */}
              <path 
                d="M13 13C15 12 17 13 18 14C19 15 17 16 15 16C13 16 12 15 13 13Z" 
                fill="#FFFFFF"
              />
              
              {/* Left eye arcs */}
              <path d="M7 8C8 9 9 9 10 8" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M7 10C8 11 9 11 10 10" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M7 6C8 7 9 7 10 6" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              
              {/* Right eye arcs */}
              <path d="M14 8C15 9 16 9 17 8" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M14 10C15 11 16 11 17 10" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M14 6C15 7 16 7 17 6" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              
              {/* Sound waves */}
              <path d="M19 7C20 7 20 6 19 6" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M20 5C22 5 22 4 20 4" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
              <path d="M21 3C24 3 24 2 21 2" fill="none" stroke="#000000" strokeWidth="0.75" strokeLinecap="round" />
            </svg>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary text-xs px-2 py-1 rounded-full shadow-sm whitespace-nowrap font-medium">
              Ask Diego
            </span>
          </div>
        </button>
      )}
    </>
  );
}

export default App;
