import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Shape {
  id: number;
  type: 'circle' | 'square' | 'triangle' | 'zigzag' | 'wave';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
  duration: number;
}

interface PlayfulBackgroundProps {
  enabled: boolean;
  colorScheme: string;
}

const PlayfulBackground: React.FC<PlayfulBackgroundProps> = ({ enabled, colorScheme }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Get colors directly from CSS variables to ensure perfect theme matching
  const getColors = (): string[] => {
    const getCSSVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    
    // Get primary colors from CSS variables set by the theme controller
    const primary = getCSSVar('--color-primary') || '#3b82f6';
    const secondary = getCSSVar('--color-secondary') || '#60a5fa';
    const accent = getCSSVar('--color-accent') || '#1e40af';
    const medium = getCSSVar('--color-medium') || '#bfdbfe';
    
    // For dark mode, create variations with better contrast
    if (isDarkMode) {
      // Create brighter, more vivid colors for dark mode to stand out
      return [
        primary,
        secondary,
        accent,
        medium,
        // Add brightness variations
        `hsl(${hslFromHex(primary).h}, ${hslFromHex(primary).s}%, ${Math.min(hslFromHex(primary).l + 15, 90)}%)`,
        `hsl(${hslFromHex(secondary).h}, ${hslFromHex(secondary).s}%, ${Math.min(hslFromHex(secondary).l + 20, 90)}%)`
      ];
    }
    
    // Light mode - use theme colors with some variations
    return [
      primary,
      secondary,
      accent,
      medium,
      // Add subtle variations
      `hsl(${hslFromHex(primary).h}, ${Math.max(hslFromHex(primary).s - 10, 30)}%, ${hslFromHex(primary).l}%)`,
      `hsl(${hslFromHex(secondary).h}, ${Math.max(hslFromHex(secondary).s - 15, 30)}%, ${hslFromHex(secondary).l}%)`
    ];
  };
  
  // Helper function to convert hex to HSL
  const hslFromHex = (hex: string) => {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');
    
    // Parse the r, g, b values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find the min and max values to compute the lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
  };

  useEffect(() => {
    // Don't generate shapes if not enabled
    if (!enabled) {
      setShapes([]);
      return;
    }

    // Update window size
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate random shapes
    const colors = getColors();
    const newShapes: Shape[] = [];
    
    // Generate more shapes for a more noticeable effect while maintaining performance
    // Scale with screen size but ensure there are enough shapes for visual impact
    const numShapes = Math.min(20, Math.floor(window.innerWidth / 120));
    
    // Define areas to avoid (reduced to allow more shapes in more areas)
    const avoidAreas = [
      // Only avoid the very center of the content area
      { x1: 40, y1: 25, x2: 60, y2: 75 }, 
      // Essential navigation area
      { x1: 0, y1: 0, x2: 100, y2: 5 },
    ];
    
    // Check if a position is in an area to avoid
    const isInAvoidArea = (x: number, y: number): boolean => {
      for (const area of avoidAreas) {
        if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
          return true;
        }
      }
      return false;
    };
    
    // Generate positions that are not in avoid areas
    for (let i = 0; i < numShapes; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      
      // Try to find a position that's not in an avoid area
      // Maximum 10 attempts to avoid infinite loop
      let attempts = 0;
      while (isInAvoidArea(x, y) && attempts < 10) {
        x = Math.random() * 100;
        y = Math.random() * 100;
        attempts++;
      }
      
      // If we couldn't find a good position after 10 attempts, skip this shape
      if (isInAvoidArea(x, y)) {
        continue;
      }
      
      const shapeTypes: Array<Shape['type']> = ['circle', 'square', 'triangle', 'zigzag', 'wave'];
      newShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        x: x,
        y: y,
        size: 25 + Math.random() * 65, // Larger shapes for more visual impact
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 5,
        duration: 40 + Math.random() * 60 // Much slower animations
      });
    }
    
    setShapes(newShapes);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, colorScheme, isDarkMode]);

  if (!enabled || shapes.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute opacity-15" // Further increased opacity for better visibility
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            backgroundColor: shape.type === 'circle' || shape.type === 'square' ? shape.color : 'transparent',
            borderRadius: shape.type === 'circle' ? '50%' : '0',
            transform: `rotate(${shape.rotation}deg)`,
          }}
          animate={{
            x: [0, 10, -10, 5, -5, 0], // Reduced movement distance
            y: [0, -10, 10, -5, 5, 0], // Reduced movement distance
            rotate: [shape.rotation, shape.rotation + 10, shape.rotation - 10, shape.rotation], // Smaller rotation
            scale: [1, 1.05, 0.95, 1], // More subtle scaling
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: shape.delay,
          }}
        >
          {shape.type === 'triangle' && (
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <polygon points="50,0 100,100 0,100" fill={shape.color} />
            </svg>
          )}
          {shape.type === 'zigzag' && (
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <polyline points="0,50 25,25 50,50 75,25 100,50" stroke={shape.color} strokeWidth="5" fill="none" />
            </svg>
          )}
          {shape.type === 'wave' && (
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <path d="M0,50 C25,20 25,80 50,50 C75,20 75,80 100,50" stroke={shape.color} strokeWidth="5" fill="none" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default PlayfulBackground;