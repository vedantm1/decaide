import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Apply theme settings from localStorage or user preferences
  useEffect(() => {
    // Try to load from localStorage first
    const savedAppearance = localStorage.getItem('diegoAppearance');
    let appearance = {
      theme: 'light',
      colorScheme: 'aquaBlue',
      fontSize: 'medium',
      visualStyle: 'memphis'
    };

    if (savedAppearance) {
      try {
        appearance = { ...appearance, ...JSON.parse(savedAppearance) };
      } catch (e) {
        console.error('Error parsing saved appearance settings:', e);
      }
    }

    // If user is logged in, use their preferences
    if (user?.uiTheme) {
      appearance.colorScheme = user.uiTheme;
    }

    // Apply theme (light/dark/system)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = appearance.theme === 'dark' || (appearance.theme === 'system' && prefersDark);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remove all theme classes first
    const themeClasses = [
      'theme-business', 'theme-finance', 'theme-hospitality', 
      'theme-marketing', 'theme-entrepreneurship', 'theme-admin',
      'theme-aquaBlue', 'theme-coralPink', 'theme-mintGreen', 'theme-royalPurple'
    ];
    
    document.documentElement.classList.remove(...themeClasses);
    
    // Apply new color scheme class
    document.documentElement.classList.add(`theme-${appearance.colorScheme}`);
    
    // Apply font size using data attribute
    document.documentElement.setAttribute('data-font-size', appearance.fontSize);
    
    // Apply visual style
    if (appearance.visualStyle === 'memphis') {
      document.documentElement.classList.add('memphis-style');
      document.documentElement.classList.remove('minimalist-style');
    } else {
      document.documentElement.classList.add('minimalist-style');
      document.documentElement.classList.remove('memphis-style');
    }
  }, [user]);

  return <>{children}</>;
}