import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useUIState } from '@/hooks/use-ui-state';

// We need to use dynamic import for Vanta to avoid SSR issues
// and to solve Content Security Policy problems
interface VantaWavesEffect {
  destroy: () => void;
}

interface VantaBackgroundProps {
  children?: React.ReactNode;
}

export function VantaBackground({ children }: VantaBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaWavesEffect | null>(null);
  const { isDarkMode } = useUIState();

  useEffect(() => {
    // Clear previous effect if any
    if (vantaEffect) {
      vantaEffect.destroy();
    }

    // Function to load and initialize Vanta
    const loadVanta = async () => {
      try {
        if (!backgroundRef.current) return;
        
        // Dynamically import Vanta
        const VANTA = await import('vanta/dist/vanta.waves.min');
        
        // Initialize Vanta with appropriate color based on theme
        const effect = VANTA.default({
          el: backgroundRef.current,
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
        });
        
        setVantaEffect(effect);
        console.log("Vanta effect initialized with color:", isDarkMode ? "0x292929 (dark)" : "0xa2a2a7 (light)");
      } catch (error) {
        console.error("Failed to load Vanta:", error);
      }
    };

    loadVanta();

    // Clean up effect on unmount
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [isDarkMode]); // Re-initialize when theme changes

  return (
    <div 
      ref={backgroundRef}
      className="fixed inset-0 z-[-1] overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    >
      {children}
    </div>
  );
}

export default VantaBackground;