import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DashboardNew from "@/pages/dashboard-new";
import AuthNew from "@/pages/auth-new";
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
import { UIStateProvider } from "@/hooks/use-ui-state";
import ThemeProvider from "@/lib/theme-provider";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

function Router({ useNewDesign }: { useNewDesign: boolean }) {
  return (
    <Switch>
      <ProtectedRoute path="/" component={useNewDesign ? DashboardNew : Dashboard} />
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
      <Route path="/auth" component={useNewDesign ? AuthNew : AuthNew} />
      <Route path="/new" component={DashboardNew} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Toggle between old and new design
  const [useNewDesign, setUseNewDesign] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Default to new design or check URL parameter for design preference
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('design') === 'new' || localStorage.getItem('use-new-design') === 'true';
  });
  
  // Use the theme system instead of hardcoded background
  useEffect(() => {
    // Clean up previous background to use theme system
    document.body.style.background = '';
    
    // Apply default theme
    document.documentElement.classList.add('theme-aquaBlue');
    document.documentElement.setAttribute('data-visual-style', 'memphis');
    document.documentElement.setAttribute('data-density', 'comfortable');
    
    // Log theme applied
    console.log('Applied theme: aquaBlue, dark mode:', document.documentElement.classList.contains('dark'));
    
    // Add keyboard shortcut for toggling design
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+D to toggle design
      if (e.altKey && e.shiftKey && e.key === 'D') {
        setUseNewDesign(prev => {
          const newValue = !prev;
          localStorage.setItem('use-new-design', newValue.toString());
          return newValue;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.documentElement.classList.remove('theme-aquaBlue');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIStateProvider>
          <ThemeProvider>
            <MicroInteractionsProvider>
              <div className={`app-container fade-in ${useNewDesign ? 'new-design' : ''}`}>
                <AnimatePresence mode="wait">
                  <Router useNewDesign={useNewDesign} />
                </AnimatePresence>
                <Toaster />
                
                {/* Design Toggle */}
                <div className="fixed bottom-4 right-4 z-50">
                  <button
                    onClick={() => {
                      setUseNewDesign(prev => {
                        const newValue = !prev;
                        localStorage.setItem('use-new-design', newValue.toString());
                        return newValue;
                      });
                    }}
                    className="bg-primary hover:bg-primary/90 text-white text-xs rounded-full p-2 shadow-lg"
                    style={{ opacity: 0.7 }}
                    title="Toggle UI Design (Alt+Shift+D)"
                  >
                    {useNewDesign ? 'Classic UI' : 'New UI'}
                  </button>
                </div>
              </div>
            </MicroInteractionsProvider>
          </ThemeProvider>
        </UIStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
