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
import { UIStateProvider } from "@/hooks/use-ui-state";
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
        <UIStateProvider>
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
        </UIStateProvider>
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
              {/* Main body - ghost-like shape with flat bottom */}
              <path 
                d="M4 20L4 10C4 5.5 8 2 12 2C16 2 20 5.5 20 10L20 20Z" 
                fill="#1AB7EA"
                stroke="#000000"
                strokeWidth="1.5"
              />
              
              {/* Side fins - simple triangular shapes */}
              <path 
                d="M4 12L1 10L4 8Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="1.5"
              />
              
              <path 
                d="M20 12L23 10L20 8Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="1.5"
              />
              
              {/* Bottom fins */}
              <path 
                d="M8 20L5 23L10 22Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="1.5"
              />
              
              <path 
                d="M16 20L19 23L14 22Z" 
                fill="#1AB7EA" 
                stroke="#000000" 
                strokeWidth="1.5"
              />
              
              {/* Ridges/spikes on back */}
              <path 
                d="M4 6L5 5L6 6L7 5L8 6L9 5L10 6L11 5L12 6L13 5L14 6L15 5L16 6L17 5L18 6L19 5L20 6" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="1.5"
              />
              
              {/* Large beak/snout - the distinctive feature */}
              <path 
                d="M10 10C13 9 16 9 19 10C22 12 20 16 17 17C14 18 11 16 10 14Z" 
                fill="#000000"
                stroke="#000000"
                strokeWidth="0.5"
              />
              
              {/* Inner mouth detail - white */}
              <path 
                d="M12 12C14 11 16 11 18 12C20 13 19 15 17 15.5C15 16 13 15 12 13.5Z" 
                fill="#FFFFFF"
              />
              
              {/* Left eye arcs - exactly as in reference */}
              <path d="M6 7C7 8 8 8 9 7" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 9C7 10 8 10 9 9" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 11C7 12 8 12 9 11" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Right eye arcs - exactly as in reference */}
              <path d="M14 7C15 8 16 8 17 7" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 9C15 10 16 10 17 9" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 11C15 12 16 12 17 11" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Sound waves - curved lines exactly as in reference */}
              <path d="M20 8C21 8 21 7 20 7" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M21 6C22.5 6 22.5 5 21 5" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M22 4C24 4 24 3 22 3" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
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
