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

  // Colors for light and dark mode
  const getColors = (): string[] => {
    const baseColors: Record<string, string[]> = {
      'aquaBlue': ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
      'coralPink': ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'],
      'mintGreen': ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
      'royalPurple': ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    };
    
    // Get colors based on color scheme, default to aquaBlue if scheme not found
    const schemeColors = baseColors[colorScheme as keyof typeof baseColors] || baseColors.aquaBlue;
    
    // For dark mode, return less saturated, darker colors
    if (isDarkMode) {
      return schemeColors.map(color => {
        // Convert to complementary colors for dark mode to create contrast
        return color.replace('#', '#33');
      });
    }
    
    return schemeColors;
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
    
    // Generate only a few shapes to avoid performance issues and distraction
    const numShapes = Math.min(8, Math.floor(window.innerWidth / 200));
    
    for (let i = 0; i < numShapes; i++) {
      const shapeTypes: Array<Shape['type']> = ['circle', 'square', 'triangle', 'zigzag', 'wave'];
      newShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 60,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 5,
        duration: 20 + Math.random() * 40
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
          className="absolute opacity-10"
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
            x: [0, 20, -20, 10, -10, 0],
            y: [0, -20, 20, -10, 10, 0],
            rotate: [shape.rotation, shape.rotation + 20, shape.rotation - 20, shape.rotation],
            scale: [1, 1.1, 0.9, 1],
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