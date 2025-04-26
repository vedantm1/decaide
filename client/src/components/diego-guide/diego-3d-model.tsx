import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Diego3DModelProps {
  modelPath?: string;
  scale?: number;
  autoRotate?: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'confused';
  className?: string;
}

export default function Diego3DModel({
  modelPath = '/models/diego.glb',
  scale = 1,
  autoRotate = true,
  emotion = 'neutral',
  className
}: Diego3DModelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState({
    name: 'Diego Dolphin 3D Model',
    size: '~1.3MB',
    format: 'glTF Binary (.glb)',
    path: modelPath
  });
  
  // Simulating model loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animation properties based on emotion
  const getAnimationProps = () => {
    switch(emotion) {
      case 'happy':
        return {
          y: [0, -10, 0],
          rotate: [0, 5, 0],
          transition: { repeat: Infinity, duration: 1.5 }
        };
      case 'thinking':
        return {
          rotate: [0, -5, 0, 5, 0],
          transition: { repeat: Infinity, duration: 3 }
        };
      case 'excited':
        return {
          y: [0, -15, 0],
          rotate: [0, -8, 8, -8, 0],
          transition: { repeat: Infinity, duration: 1 }
        };
      case 'confused':
        return {
          rotate: [0, 8, 0],
          transition: { repeat: Infinity, duration: 2 }
        };
      default: // neutral
        return {
          y: [0, -5, 0],
          transition: { repeat: Infinity, duration: 2 }
        };
    }
  };

  return (
    <div className={`${className || ''} w-full h-full min-h-[300px] relative bg-gradient-to-b from-primary/5 to-background rounded-lg overflow-hidden`}>
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading 3D model...</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-xs aspect-square">
            {/* Placeholder for 3D model */}
            <motion.div 
              className="w-full h-full flex items-center justify-center"
              animate={getAnimationProps()}
            >
              <div className="relative">
                {/* Simplified Diego dolphin representation */}
                <div className="relative bg-primary/90 w-40 h-40 rounded-[70%_70%_50%_50%] transform rotate-[20deg]">
                  {/* Eyes */}
                  <div className="absolute top-10 left-8 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                  
                  {/* Mouth */}
                  <motion.div 
                    className="absolute bottom-10 left-14 w-16 h-4 border-b-4 border-primary-foreground rounded-b-full"
                    animate={{ 
                      scaleY: emotion === 'happy' || emotion === 'excited' ? [1, 1.3, 1] : [1, 0.8, 1],
                      transition: { repeat: Infinity, duration: 2 } 
                    }}
                  ></motion.div>
                  
                  {/* Fin */}
                  <div className="absolute top-12 right-0 w-12 h-16 bg-primary/90 rounded-[100%_0%_100%_0%] transform -rotate-20"></div>
                  
                  {/* Tail */}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-20 h-20 bg-primary/90 rounded-[70%_0%_0%_100%] transform -rotate-45"
                    animate={{ 
                      rotate: [-45, -35, -45],
                      transition: { repeat: Infinity, duration: 1.5 }
                    }}
                  ></motion.div>
                </div>
                
                {/* Water splash effect */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-200/30 via-blue-300/30 to-blue-200/30 rounded-full"
                  animate={{ 
                    scaleX: [1, 1.1, 1], 
                    opacity: [0.3, 0.5, 0.3],
                    transition: { repeat: Infinity, duration: 2 } 
                  }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full max-w-xs mt-6 p-4 bg-card rounded-lg border border-border">
            <h3 className="font-semibold text-center mb-2">3D Model Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {modelInfo.name}</p>
              <p><span className="text-muted-foreground">Format:</span> {modelInfo.format}</p>
              <p><span className="text-muted-foreground">Size:</span> {modelInfo.size}</p>
              <p><span className="text-muted-foreground">Path:</span> {modelInfo.path}</p>
              <p><span className="text-muted-foreground">Current emotion:</span> {emotion}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center max-w-xs">
            <p>This is a placeholder for the 3D model viewer. The actual 3D model is available but requires compatibility fixes.</p>
          </div>
        </div>
      )}
    </div>
  );
}