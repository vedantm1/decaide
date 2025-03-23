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
import DiegoManager from "@/components/diego-guide/diego-manager";
import WelcomeBanner from "@/components/welcome-banner";
import ThemeProvider from "@/lib/theme-provider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayfulBackground from "@/components/playful-background";

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
  const [visualStyle, setVisualStyle] = useState('memphis');
  const [colorScheme, setColorScheme] = useState('aquaBlue');
  
  // Check localStorage on mount to get user preferences
  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearance');
    if (savedAppearance) {
      try {
        const parsed = JSON.parse(savedAppearance);
        setVisualStyle(parsed.visualStyle || 'memphis');
        setColorScheme(parsed.colorScheme || 'aquaBlue');
      } catch (e) {
        console.error('Failed to parse appearance settings', e);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <MicroInteractionsProvider>
            <DiegoGuideProvider>
              <Router />
              <Toaster />
              <WelcomeBanner />
              <PlayfulBackground enabled={visualStyle === 'memphis'} colorScheme={colorScheme} />
              <DiegoManager />
            </DiegoGuideProvider>
          </MicroInteractionsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Diego guide and other components managed through diego-manager.tsx

export default App;
