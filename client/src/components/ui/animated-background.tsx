import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useUIState } from '@/hooks/use-ui-state';

// Import Vanta with dynamic import to prevent SSR issues
declare global {
  interface Window {
    VANTA: {
      WAVES: (config: any) => any;
    };
  }
}

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  const { isDarkMode } = useUIState();
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [isVantaLoaded, setIsVantaLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load the Vanta.js script
    const loadVantaScript = async () => {
      // Check if Vanta.js is already loaded
      if (window.VANTA) {
        setIsVantaLoaded(true);
        return;
      }

      try {
        // Load Vanta.js
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
        script.async = true;
        script.onload = () => {
          setIsVantaLoaded(true);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error("Failed to load Vanta.js:", error);
      }
    };

    loadVantaScript();

    return () => {
      // Clean up any script tags if component unmounts before loading completes
    };
  }, []);

  useEffect(() => {
    // Initialize or destroy the Vanta effect when loaded or theme changes
    if (!vantaRef.current || !isVantaLoaded || !window.VANTA) return;

    if (vantaEffect) {
      vantaEffect.destroy();
    }

    // Configure the Vanta effect based on theme
    setVantaEffect(
      window.VANTA.WAVES({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: isDarkMode ? 0x292929 : 0xa2a2a7,
        shininess: 0.00,
        waveHeight: 28.00,
        waveSpeed: 1.50,
        zoom: 0.65
      })
    );

    // Cleanup function
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [isDarkMode, isVantaLoaded]);

  return (
    <div
      ref={vantaRef}
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export default AnimatedBackground;