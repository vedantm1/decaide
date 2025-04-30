import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type SidebarState = 'expanded' | 'collapsed' | 'hidden';
type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
type AnimationMode = 'reduced' | 'full';
type FontSize = 'small' | 'medium' | 'large';
type ColorScheme = string;
type VisualStyle = 'memphis' | 'minimalist';

interface UIStateContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  visualStyle: VisualStyle;
  setVisualStyle: (style: VisualStyle) => void;
  isDarkMode: boolean;
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  animationMode: AnimationMode;
  setAnimationMode: (mode: AnimationMode) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  saveUIPreferences: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

interface UIStateProviderProps {
  children: React.ReactNode;
}

export function UIStateProvider({ children }: UIStateProviderProps) {
  // Load saved preferences from localStorage or use defaults
  const loadSavedPreferences = () => {
    try {
      const savedPreferences = localStorage.getItem('ui-preferences');
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('Error loading saved UI preferences:', error);
    }
    
    return {
      themeMode: 'system',
      colorScheme: 'aquaBlue',
      visualStyle: 'memphis',
      sidebarState: 'expanded',
      layoutDensity: 'comfortable',
      animationMode: 'full',
      fontSize: 'medium'
    };
  };

  const preferences = loadSavedPreferences();

  // UI state
  const [themeMode, setThemeMode] = useState<ThemeMode>(preferences.themeMode);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferences.colorScheme);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(preferences.visualStyle);
  const [sidebarState, setSidebarState] = useState<SidebarState>(preferences.sidebarState);
  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>(preferences.layoutDensity);
  const [animationMode, setAnimationMode] = useState<AnimationMode>(preferences.animationMode);
  const [fontSize, setFontSize] = useState<FontSize>(preferences.fontSize);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  // Save UI preferences to localStorage
  const saveUIPreferences = () => {
    try {
      localStorage.setItem('ui-preferences', JSON.stringify({
        themeMode,
        colorScheme,
        visualStyle,
        sidebarState,
        layoutDensity,
        animationMode,
        fontSize
      }));
    } catch (error) {
      console.error('Error saving UI preferences:', error);
    }
  };

  // Effect to determine dark mode status
  useEffect(() => {
    const updateDarkModeStatus = () => {
      if (themeMode === 'dark') {
        setIsDarkMode(true);
      } else if (themeMode === 'light') {
        setIsDarkMode(false);
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
    };

    updateDarkModeStatus();

    // Listen for system preference changes if in 'system' mode
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateDarkModeStatus();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [themeMode]);

  // Effect to apply theme changes to the document
  useEffect(() => {
    // Apply dark/light mode
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Apply color scheme
    document.documentElement.className = document.documentElement.className
      .replace(/\btheme-\S+/g, '')
      .trim();
    document.documentElement.classList.add(`theme-${colorScheme}`);
    
    // Apply visual style
    document.documentElement.setAttribute('data-visual-style', visualStyle);
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Apply animation mode
    document.documentElement.setAttribute('data-reduced-motion', animationMode === 'reduced' ? 'true' : 'false');
    
    // Apply layout density
    document.documentElement.setAttribute('data-density', layoutDensity);
    
    // Save the updated preferences
    saveUIPreferences();
  }, [isDarkMode, colorScheme, visualStyle, fontSize, animationMode, layoutDensity]);

  // Effect to detect viewport size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
      setIsDesktop(window.innerWidth >= 1024);
      
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 640 && sidebarState === 'expanded') {
        setSidebarState('collapsed');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarState]);

  // The context value
  const contextValue: UIStateContextType = {
    themeMode,
    setThemeMode,
    colorScheme,
    setColorScheme,
    visualStyle,
    setVisualStyle,
    isDarkMode,
    sidebarState,
    setSidebarState,
    layoutDensity,
    setLayoutDensity,
    animationMode,
    setAnimationMode,
    fontSize,
    setFontSize,
    isMobile,
    isTablet,
    isDesktop,
    saveUIPreferences
  };

  return (
    <UIStateContext.Provider value={contextValue}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}

// Add this to App.tsx to use this context
// import { UIStateProvider } from '@/hooks/use-ui-state';
// 
// function App() {
//   return (
//     <UIStateProvider>
//       {/* Your app content */}
//     </UIStateProvider>
//   );
// }