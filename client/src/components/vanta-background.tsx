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

// This fixes the TypeScript error related to importing Vanta
declare global {
  interface Window {
    VANTA: {
      WAVES: (options: any) => VantaWavesEffect;
    }
  }
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
        
        // Using direct script tag approach instead of import
        // First check if VANTA is already available (from script tags)
        if (window.VANTA) {
          const effect = window.VANTA.WAVES({
            el: backgroundRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: isDarkMode ? 0x292929 : 0xa7a2a2,
            shininess: 0.00,
            waveHeight: 28.00,
            waveSpeed: 1.50,
            zoom: 0.65
          });
          
          setVantaEffect(effect);
          console.log("Vanta effect initialized with color:", isDarkMode ? "0x292929 (dark)" : "0xa7a2a2 (light)");
          return;
        }
        
        // Fallback to dynamic import if window.VANTA is not available
        try {
          // Import the THREE.js library first
          await import('three');
          
          // Use script tags approach to load Vanta
          const threeScript = document.createElement('script');
          threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
          threeScript.async = true;
          
          threeScript.onload = () => {
            const vantaScript = document.createElement('script');
            vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js';
            vantaScript.async = true;
            
            vantaScript.onload = () => {
              if (window.VANTA && backgroundRef.current) {
                const effect = window.VANTA.WAVES({
                  el: backgroundRef.current,
                  THREE: THREE,
                  mouseControls: true,
                  touchControls: true,
                  gyroControls: false,
                  minHeight: 200.00,
                  minWidth: 200.00,
                  scale: 1.00,
                  scaleMobile: 1.00,
                  color: isDarkMode ? 0x292929 : 0xa7a2a2,
                  shininess: 0.00,
                  waveHeight: 28.00,
                  waveSpeed: 1.50,
                  zoom: 0.65
                });
                
                setVantaEffect(effect);
                console.log("Vanta effect initialized with color:", isDarkMode ? "0x292929 (dark)" : "0xa7a2a2 (light)");
              }
            };
            
            document.head.appendChild(vantaScript);
          };
          
          document.head.appendChild(threeScript);
        } catch (importError) {
          console.error("Failed to import Vanta:", importError);
        }
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