import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  visualStyle: 'memphis' | 'minimalist';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    colorScheme: 'aquaBlue',
    fontSize: 'medium',
    visualStyle: 'memphis'
  });

  // Load appearance settings once when component mounts
  useEffect(() => {
    // Try to load from localStorage first
    const savedAppearance = localStorage.getItem('diegoAppearance');
    let newAppearance = { ...appearance };

    if (savedAppearance) {
      try {
        newAppearance = { ...newAppearance, ...JSON.parse(savedAppearance) };
      } catch (e) {
        console.error('Error parsing saved appearance settings:', e);
      }
    }

    // If user is logged in, use their preferences for color scheme
    if (user?.uiTheme) {
      newAppearance.colorScheme = user.uiTheme;
    }

    setAppearance(newAppearance);
  }, [user]);

  // Apply the appearance settings whenever they change
  useEffect(() => {
    // 1. Handle dark/light/system mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = appearance.theme === 'dark' || (appearance.theme === 'system' && prefersDark);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 2. Remove all theme classes first to prevent conflicts
    const themeClasses = [
      'theme-business', 'theme-finance', 'theme-hospitality', 
      'theme-marketing', 'theme-entrepreneurship', 'theme-admin',
      'theme-aquaBlue', 'theme-coralPink', 'theme-mintGreen', 'theme-royalPurple'
    ];
    
    document.documentElement.classList.remove(...themeClasses);
    
    // 3. Apply new color scheme class
    document.documentElement.classList.add(`theme-${appearance.colorScheme}`);
    
    // 4. Apply font size using data attribute
    document.documentElement.setAttribute('data-font-size', appearance.fontSize);
    
    // 5. Apply visual style
    if (appearance.visualStyle === 'memphis') {
      document.documentElement.classList.add('memphis-style');
      document.documentElement.classList.remove('minimalist-style');
    } else {
      document.documentElement.classList.add('minimalist-style');
      document.documentElement.classList.remove('memphis-style');
    }

    // 6. Listen for system color scheme changes if in system mode
    if (appearance.theme === 'system') {
      const systemThemeListener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeMediaQuery.addEventListener('change', systemThemeListener);

      return () => {
        darkModeMediaQuery.removeEventListener('change', systemThemeListener);
      };
    }
  }, [appearance]);

  return <>{children}</>;
}