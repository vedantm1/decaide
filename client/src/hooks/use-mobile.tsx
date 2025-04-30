import { useState, useEffect } from 'react';

/**
 * Hook that detects if the current viewport is a mobile device
 * based on a breakpoint width.
 * 
 * @param breakpoint The maximum width in pixels to be considered a mobile device
 * @returns Boolean indicating if the current viewport is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window === 'undefined') return;
    
    // Set initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set on mount
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);
  
  return isMobile;
}