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
    if (user?.uiTheme && user.uiTheme !== appearance.colorScheme) {
      const newAppearance = {
        ...appearance,
        colorScheme: user.uiTheme
      };
      setAppearance(newAppearance);
      applyTheme(newAppearance);
    }
  }, [user]);

  // Re-apply theme whenever appearance settings change
  useEffect(() => {
    applyTheme(appearance);
  }, [appearance]);

  return <>{children}</>;
}