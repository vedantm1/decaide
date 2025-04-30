import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type AnimationMode = 'full' | 'reduced' | 'none';
type SidebarState = 'expanded' | 'collapsed';

interface UIStateContextType {
  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  
  // Layout
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  isMobile: boolean;
  
  // Animation preferences
  animationMode: AnimationMode;
  setAnimationMode: (mode: AnimationMode) => void;
  
  // UI Preferences
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
}

const defaultContext: UIStateContextType = {
  themeMode: 'system',
  setThemeMode: () => {},
  isDarkMode: false,
  sidebarState: 'expanded',
  setSidebarState: () => {},
  isMobile: false,
  animationMode: 'full',
  setAnimationMode: () => {},
  fontScale: 1,
  setFontScale: () => {},
  highContrastMode: false,
  setHighContrastMode: () => {},
};

const UIStateContext = createContext<UIStateContextType>(defaultContext);

export const UIStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'system';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Layout state
  const [sidebarState, setSidebarStateValue] = useState<SidebarState>(() => {
    if (typeof window === 'undefined') return 'expanded';
    const saved = localStorage.getItem('sidebar-state');
    return (saved as SidebarState) || 'expanded';
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Animation preferences
  const [animationMode, setAnimationModeState] = useState<AnimationMode>(() => {
    if (typeof window === 'undefined') return 'full';
    const saved = localStorage.getItem('animation-mode');
    return (saved as AnimationMode) || 'full';
  });
  
  // UI Preferences
  const [fontScale, setFontScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem('font-scale');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [highContrastMode, setHighContrastModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('high-contrast-mode');
    return saved === 'true';
  });
  
  // Persist theme preference to localStorage
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', mode);
    }
  };
  
  // Persist sidebar state to localStorage
  const setSidebarState = (state: SidebarState) => {
    setSidebarStateValue(state);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-state', state);
    }
  };
  
  // Persist animation mode to localStorage
  const setAnimationMode = (mode: AnimationMode) => {
    setAnimationModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('animation-mode', mode);
    }
  };
  
  // Persist font scale to localStorage
  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('font-scale', scale.toString());
      document.documentElement.style.fontSize = `${scale * 100}%`;
    }
  };
  
  // Persist high contrast mode to localStorage
  const setHighContrastMode = (enabled: boolean) => {
    setHighContrastModeState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('high-contrast-mode', enabled.toString());
      if (enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  };
  
  // Detect system theme preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const isDark = 
        themeMode === 'dark' || 
        (themeMode === 'system' && mediaQuery.matches);
      
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      
      // Dispatch a custom event for Vanta background to update
      const themeChangeEvent = new CustomEvent('theme-change', {
        detail: { isDarkMode: isDark }
      });
      window.dispatchEvent(themeChangeEvent);
    };
    
    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);
  
  // Initialize font scale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.fontSize = `${fontScale * 100}%`;
    }
  }, [fontScale]);
  
  // Initialize high contrast mode
  useEffect(() => {
    if (typeof window !== 'undefined' && highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    }
  }, [highContrastMode]);
  
  // Detect mobile devices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const value = {
    themeMode,
    setThemeMode,
    isDarkMode,
    sidebarState,
    setSidebarState,
    isMobile,
    animationMode,
    setAnimationMode,
    fontScale,
    setFontScale,
    highContrastMode,
    setHighContrastMode,
  };
  
  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => useContext(UIStateContext);