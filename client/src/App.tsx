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
import AchievementsPage from "@/pages/achievements";
import AnalyticsPage from "@/pages/analytics";

import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
// Import removed - now using direct script tags in index.html
// import VantaBackground from "@/components/vanta-background";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { MicroInteractionsProvider } from "@/hooks/use-micro-interactions";
import { UIStateProvider } from "@/hooks/use-ui-state";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import ThemeProvider from "@/lib/theme-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardNew} />
      <ProtectedRoute path="/roleplay" component={RoleplayPage} />
      <ProtectedRoute path="/performance-indicators" component={PerformanceIndicatorsPage} />
      <ProtectedRoute path="/tests" component={PracticeTestsPage} />
      <ProtectedRoute path="/written-events" component={WrittenEventsPage} />
      <ProtectedRoute path="/progress" component={MyProgressPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/interactions" component={InteractionShowcasePage} />
      <Route path="/why-decade" component={WhyDecadePage} />
      <Route path="/auth" component={AuthNew} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
    
    return () => {
      document.documentElement.classList.remove('theme-aquaBlue');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIStateProvider>
          <ThemeProvider>
            <MicroInteractionsProvider>
              <NotificationProvider>
                <OnboardingProvider>
                  {/* Vanta background effect now handled via index.html */}
                  <div className="app-container fade-in new-design">
                    <AnimatePresence mode="wait">
                      <Router />
                    </AnimatePresence>
                    <Toaster />
                  </div>
                </OnboardingProvider>
              </NotificationProvider>
            </MicroInteractionsProvider>
          </ThemeProvider>
        </UIStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
