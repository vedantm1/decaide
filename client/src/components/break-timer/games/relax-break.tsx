import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const breathInstructions = [
  { id: 'breathe-in', text: 'Breathe In', duration: 4 },
  { id: 'hold', text: 'Hold', duration: 2 },
  { id: 'breathe-out', text: 'Breathe Out', duration: 4 },
  { id: 'rest', text: 'Rest', duration: 2 },
];

export default function RelaxBreak() {
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [timer, setTimer] = useState(breathInstructions[0].duration);
  const [cycle, setCycle] = useState(1);
  const [playing, setPlaying] = useState(true);
  
  const currentInstruction = breathInstructions[currentInstructionIndex];
  
  useEffect(() => {
    if (!playing) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Move to next instruction
          const nextIndex = (currentInstructionIndex + 1) % breathInstructions.length;
          setCurrentInstructionIndex(nextIndex);
          
          // If we've completed a full cycle
          if (nextIndex === 0) {
            setCycle(prev => prev + 1);
          }
          
          return breathInstructions[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentInstructionIndex, playing]);
  
  const togglePlaying = () => setPlaying(prev => !prev);
  
  // Calculate circle size for breathing animation
  const getCircleSize = () => {
    switch (currentInstruction.id) {
      case 'breathe-in':
        return 100 - ((timer / currentInstruction.duration) * 60);
      case 'hold':
        return 100;
      case 'breathe-out':
        return 40 + ((timer / currentInstruction.duration) * 60);
      default:
        return 40;
    }
  };
  
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-lg text-center font-medium text-primary-700">
        <span>Breathing Exercise</span>
        <div className="text-sm text-muted-foreground mt-1">Cycle {cycle} of 5</div>
      </div>
      
      <div className="relative flex items-center justify-center h-40">
        <motion.div
          className="absolute rounded-full bg-primary-100 border-2 border-primary-300"
          animate={{
            width: `${getCircleSize()}%`,
            height: `${getCircleSize()}%`,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="z-10 text-2xl font-medium text-primary-800"
          key={currentInstruction.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentInstruction.text}
        </motion.div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-sm text-muted-foreground mb-2">
          Follow the expanding and contracting circle
        </div>
        <button 
          onClick={togglePlaying}
          className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
        >
          {playing ? (
            <>
              <span className="i-fas-pause text-xs" /> Pause
            </>
          ) : (
            <>
              <span className="i-fas-play text-xs" /> Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}