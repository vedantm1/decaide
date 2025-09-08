import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardNew from "@/pages/dashboard-new";
import AuthNew from "@/pages/auth-new";
import { RoleplayPage } from "@/pages/roleplay";
import PerformanceIndicatorsPage from "@/pages/performance-indicators";
import PracticeTestsPage from "@/pages/practice-tests";
import { WrittenEventsPage } from "@/pages/written-events";

import ComprehensiveAnalyticsPage from "@/pages/comprehensive-analytics";
import SettingsPage from "@/pages/settings";
import PricingPage from "@/pages/pricing";
import WhyDecadePage from "@/pages/why-decade";
import InteractionShowcasePage from "@/pages/interaction-showcase";
import { AchievementsPage } from "@/pages/achievements";
import GamesPage from "@/pages/games";

import Store from "@/pages/store";

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
import { AchievementNotificationManager } from "@/components/achievements/achievement-notification";
import { PopupManagerProvider } from "@/components/popups/popup-manager";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { initializeTheme } from "@/lib/theme-controller";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardNew} />
      <ProtectedRoute path="/roleplay" component={RoleplayPage} />
      <ProtectedRoute path="/performance-indicators" component={PerformanceIndicatorsPage} />
      <ProtectedRoute path="/tests" component={PracticeTestsPage} />
      <ProtectedRoute path="/written-events" component={WrittenEventsPage} />
      <ProtectedRoute path="/progress" component={ComprehensiveAnalyticsPage} />

      <ProtectedRoute path="/comprehensive-analytics" component={ComprehensiveAnalyticsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/games" component={GamesPage} />
      <ProtectedRoute path="/store" component={Store} />
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
  // Initialize theme system
  useEffect(() => {
    // Initialize theme
    initializeTheme();
    
    // Log theme applied
    console.log('Theme system initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIStateProvider>
          <ThemeProvider>
            <MicroInteractionsProvider>
              <NotificationProvider>
                <PopupManagerProvider>
                  <OnboardingProvider>
                    {/* Vanta background effect now handled via index.html */}
                    <div className="app-container fade-in new-design">
                      <AchievementNotificationManager />

                      <AnimatePresence mode="wait">
                        <Router />
                      </AnimatePresence>
                      <Toaster />
                    </div>
                  </OnboardingProvider>
                </PopupManagerProvider>
              </NotificationProvider>
            </MicroInteractionsProvider>
          </ThemeProvider>
        </UIStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
