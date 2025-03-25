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

  // Handle user theme preferences from database whenever user loads or changes
  useEffect(() => {
    if (user?.uiTheme) {
      // If user has a color scheme preference in their account, that takes priority
      const newAppearance = {
        ...appearance,
        colorScheme: user.uiTheme
      };
      
      // Note: In the future, we could add visualStyle to the user schema
      // and include it here as well
      
      // Apply the theme and update state
      const updatedTheme = applyTheme(newAppearance);
      setAppearance(updatedTheme);
      
      // Also update localStorage/sessionStorage for consistency
      localStorage.setItem('diegoAppearance', JSON.stringify(updatedTheme));
      sessionStorage.setItem('diegoAppearance', JSON.stringify(updatedTheme));
      
      console.log('Applied user theme from account:', user.uiTheme);
    }
  }, [user]);

  // Re-apply theme whenever appearance settings change
  useEffect(() => {
    applyTheme(appearance);
  }, [appearance]);

  return <>{children}</>;
}