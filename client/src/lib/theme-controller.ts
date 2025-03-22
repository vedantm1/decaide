/**
 * Theme Controller for DecA(I)de
 * This file handles all theme switching functionality
 */

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  visualStyle: 'memphis' | 'minimalist';
}

// Default theme settings
const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  colorScheme: 'aquaBlue',
  fontSize: 'medium',
  visualStyle: 'memphis'
};

// Get the current theme from localStorage or use the default
export function getCurrentTheme(): AppearanceSettings {
  try {
    const savedAppearance = localStorage.getItem('diegoAppearance');
    if (savedAppearance) {
      return { ...defaultAppearance, ...JSON.parse(savedAppearance) };
    }
  } catch (e) {
    console.error('Error parsing saved appearance settings:', e);
  }
  
  return defaultAppearance;
}

// Apply the theme to the document
export function applyTheme(appearance: AppearanceSettings): AppearanceSettings {
  // Save to localStorage first
  localStorage.setItem('diegoAppearance', JSON.stringify(appearance));
  
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
  
  // Debug to console
  console.log(`Applied theme: ${appearance.colorScheme}, dark mode: ${isDarkMode}`);
  
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
  
  // 6. Force a repaint
  const forceRepaint = document.body.offsetHeight;
  
  // 7. Return the updated appearance
  return appearance;
}

// Listen for system theme changes
export function setupSystemThemeListener(callback: (appearance: AppearanceSettings) => void): () => void {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    const currentTheme = getCurrentTheme();
    if (currentTheme.theme === 'system') {
      applyTheme(currentTheme);
      if (callback) callback(currentTheme);
    }
  };
  
  darkModeMediaQuery.addEventListener('change', handleChange);
  
  // Return a cleanup function
  return () => darkModeMediaQuery.removeEventListener('change', handleChange);
}