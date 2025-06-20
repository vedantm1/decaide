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

// Get the current theme from sessionStorage (user session) or localStorage (device) or use the default
export function getCurrentTheme(): AppearanceSettings {
  try {
    // First check sessionStorage (user-specific for current session)
    const sessionAppearance = sessionStorage.getItem('diegoAppearance');
    if (sessionAppearance) {
      return { ...defaultAppearance, ...JSON.parse(sessionAppearance) };
    }
    
    // Then fallback to localStorage (device-specific)
    const savedAppearance = localStorage.getItem('diegoAppearance');
    if (savedAppearance) {
      // Copy to sessionStorage for future use
      sessionStorage.setItem('diegoAppearance', savedAppearance);
      return { ...defaultAppearance, ...JSON.parse(savedAppearance) };
    }
  } catch (e) {
    console.error('Error parsing saved appearance settings:', e);
  }
  
  return defaultAppearance;
}

// Apply the theme to the document
export function applyTheme(appearance: AppearanceSettings): AppearanceSettings {
  // Save to sessionStorage (user session specific)
  sessionStorage.setItem('diegoAppearance', JSON.stringify(appearance));
  
  // Also save to localStorage for device persistence 
  // This is a fallback for users who aren't logged in
  localStorage.setItem('diegoAppearance', JSON.stringify(appearance));
  
  // Dispatch a custom event to notify other components about theme changes
  const themeChangeEvent = new CustomEvent('themechange', { detail: appearance });
  window.dispatchEvent(themeChangeEvent);
  
  // 1. Handle dark/light/system mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkMode = appearance.theme === 'dark' || (appearance.theme === 'system' && prefersDark);
  
  // Define DECA color systems
  const colorSystems = {
    business: {
      primary: '#F59E0B', // amber-500
      secondary: '#FCD34D', // amber-300
      accent: '#B45309', // amber-800
      light: '#FFFBEB', // amber-50
      medium: '#FEF3C7', // amber-100
      dark: '#D97706', // amber-600
      contrast: '#1F2937', // gray-800
      badge: '#F59E0B'
    },
    finance: {
      primary: '#10B981', // emerald-500
      secondary: '#6EE7B7', // emerald-300
      accent: '#047857', // emerald-800
      light: '#ECFDF5', // emerald-50
      medium: '#D1FAE5', // emerald-100
      dark: '#059669', // emerald-600
      contrast: '#1F2937', // gray-800
      badge: '#10B981'
    },
    hospitality: {
      primary: '#3B82F6', // blue-500
      secondary: '#93C5FD', // blue-300
      accent: '#1E40AF', // blue-800
      light: '#EFF6FF', // blue-50
      medium: '#DBEAFE', // blue-100
      dark: '#2563EB', // blue-600
      contrast: '#1F2937', // gray-800
      badge: '#3B82F6'
    },
    marketing: {
      primary: '#EF4444', // red-500
      secondary: '#FCA5A5', // red-300
      accent: '#B91C1C', // red-800
      light: '#FEF2F2', // red-50
      medium: '#FEE2E2', // red-100
      dark: '#DC2626', // red-600
      contrast: '#1F2937', // gray-800
      badge: '#EF4444'
    },
    entrepreneurship: {
      primary: '#6B7280', // gray-500
      secondary: '#D1D5DB', // gray-300
      accent: '#374151', // gray-800
      light: '#F9FAFB', // gray-50
      medium: '#F3F4F6', // gray-100
      dark: '#4B5563', // gray-600
      contrast: '#1F2937', // gray-800
      badge: '#6B7280'
    },
    admin: {
      primary: '#4F46E5', // indigo-600
      secondary: '#A5B4FC', // indigo-300
      accent: '#3730A3', // indigo-800
      light: '#EEF2FF', // indigo-50
      medium: '#E0E7FF', // indigo-100
      dark: '#4338CA', // indigo-700
      contrast: '#1F2937', // gray-800
      badge: '#4F46E5'
    },
    // Default aqua blue theme
    aquaBlue: {
      primary: '#06B6D4', // cyan-500
      secondary: '#67E8F9', // cyan-300
      accent: '#0E7490', // cyan-800
      light: '#ECFEFF', // cyan-50
      medium: '#CFFAFE', // cyan-100
      dark: '#0891B2', // cyan-600
      contrast: '#1F2937', // gray-800
      badge: '#06B6D4'
    },
    coralPink: {
      primary: '#F472B6', // pink-400
      secondary: '#FBCFE8', // pink-200
      accent: '#BE185D', // pink-700
      light: '#FDF2F8', // pink-50
      medium: '#FCE7F3', // pink-100
      dark: '#DB2777', // pink-600
      contrast: '#1F2937', // gray-800
      badge: '#F472B6'
    },
    mintGreen: {
      primary: '#34D399', // emerald-400
      secondary: '#A7F3D0', // emerald-200
      accent: '#065F46', // emerald-800
      light: '#ECFDF5', // emerald-50
      medium: '#D1FAE5', // emerald-100
      dark: '#10B981', // emerald-500
      contrast: '#1F2937', // gray-800
      badge: '#34D399'
    },
    royalPurple: {
      primary: '#8B5CF6', // violet-500
      secondary: '#C4B5FD', // violet-300
      accent: '#5B21B6', // violet-800
      light: '#F5F3FF', // violet-50
      medium: '#EDE9FE', // violet-100
      dark: '#7C3AED', // violet-600
      contrast: '#1F2937', // gray-800
      badge: '#8B5CF6'
    }
  };

  // Get colors based on selected scheme (or default if not found)
  const colors = colorSystems[appearance.colorScheme as keyof typeof colorSystems] || colorSystems.aquaBlue;
  
  // Apply all color variables
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Set text color only, not background - let the Vanta background show through
    document.body.style.color = 'hsl(210 40% 98%)';
    
    // Remove any inline background styles to ensure translucency works
    document.body.style.backgroundColor = '';
    
    // Clear any explicitly set background colors to maintain translucency
    const mainElement = document.querySelector('main');
    if (mainElement) {
      (mainElement as HTMLElement).style.backgroundColor = '';
    }
    
    // Remove inline background colors to ensure translucency
    document.querySelectorAll('.bg-slate-50').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    // Ensure all cards and content areas maintain translucency
    document.querySelectorAll('.card, [class*="card"], .bg-card, [class*="bg-background"]').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    // In dark mode, adjust some colors for better contrast
    document.documentElement.style.setProperty('--color-light', colors.dark);
    document.documentElement.style.setProperty('--color-contrast', '#ffffff');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Set text color only, not background - let the Vanta background show through
    document.body.style.color = 'hsl(222.2 47.4% 11.2%)';
    
    // Remove any inline background styles to ensure translucency works
    document.body.style.backgroundColor = '';
    
    // Clear any explicitly set background colors to maintain translucency
    const mainElement = document.querySelector('main');
    if (mainElement) {
      (mainElement as HTMLElement).style.backgroundColor = '';
    }
    
    // Remove inline background colors to ensure translucency
    document.querySelectorAll('.bg-slate-50').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    // Ensure all cards and content areas maintain translucency
    document.querySelectorAll('.card, [class*="card"], .bg-card, [class*="bg-background"]').forEach(el => {
      (el as HTMLElement).style.backgroundColor = '';
    });
    
    document.documentElement.style.setProperty('--color-contrast', colors.contrast);
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