import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getCurrentTheme, applyTheme, setupSystemThemeListener } from './theme-controller';

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  visualStyle: 'memphis' | 'minimalist';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState<AppearanceSettings>(getCurrentTheme());

  // Initialize theme once on mount
  useEffect(() => {
    // Apply the current theme immediately
    applyTheme(appearance);
    
    // Setup system theme listener
    const cleanup = setupSystemThemeListener((updatedTheme) => {
      setAppearance(updatedTheme);
    });
    
    return cleanup;
  }, []); // Empty dependency array - only run on mount

  // Handle user theme preferences
  useEffect(() => {
    if (user) {
      let shouldUpdate = false;
      const newAppearance = { ...appearance };

      // Update colorScheme (color theme)
      if (user.uiTheme && user.uiTheme !== appearance.colorScheme) {
        newAppearance.colorScheme = user.uiTheme;
        shouldUpdate = true;
      }

      // Update theme (light/dark mode)
      if (user.theme && user.theme !== appearance.theme) {
        newAppearance.theme = user.theme as 'light' | 'dark' | 'system';
        shouldUpdate = true;
      }

      // Update visual style (memphis/minimalist)
      if (user.colorScheme && user.colorScheme !== appearance.visualStyle) {
        newAppearance.visualStyle = user.colorScheme as 'memphis' | 'minimalist';
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        setAppearance(newAppearance);
        applyTheme(newAppearance);
      }
    }
  }, [user]);

  // Re-apply theme whenever appearance settings change
  useEffect(() => {
    applyTheme(appearance);
  }, [appearance]);

  return <>{children}</>;
}