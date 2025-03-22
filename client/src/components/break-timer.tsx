import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/progress-ring";

interface BreakTimerProps {
  onClose: () => void;
  duration?: number; // Duration in seconds, default 5 minutes
}

export default function BreakTimer({ onClose, duration = 300 }: BreakTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [breakOption, setBreakOption] = useState<string | null>(null);
  
  // Calculate progress percentage
  const progress = ((duration - timeRemaining) / duration) * 100;
  
  // Format time for display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      onClose();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, onClose]);
  
  // Break option selection
  const handleBreakOptionSelect = (option: string) => {
    setBreakOption(option);
  };
  
  // Render different break content based on selected option
  const renderBreakContent = () => {
    if (!breakOption) return null;
    
    switch (breakOption) {
      case "game":
        return (
          <div className="text-center py-4">
            <h4 className="font-medium text-lg text-slate-800 mb-3">Quick Break Game</h4>
            <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center h-44">
              <p className="text-slate-600">Simple game would appear here</p>
            </div>
          </div>
        );
      case "mindfulness":
        return (
          <div className="text-center py-4">
            <h4 className="font-medium text-lg text-slate-800 mb-3">Mindfulness Break</h4>
            <div className="bg-primary-50 rounded-lg p-6 flex flex-col items-center justify-center h-44">
              <p className="text-slate-600 mb-4">Take 5 deep breaths. Focus on your breathing.</p>
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
                <i className="fas fa-lungs text-primary-600 text-xl"></i>
              </div>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="text-center py-4">
            <h4 className="font-medium text-lg text-slate-800 mb-3">Educational Moment</h4>
            <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center h-44">
              <p className="text-slate-600">Short educational video would appear here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center"
        onClick={(e) => {
          // Only close if clicking the background
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 animate-[float_3s_ease-in-out_infinite]">
              <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" fill="#EFF6FF"/>
                <path d="M16,16 Q24,10 32,16 L32,30 Q24,36 16,30 Z" fill="#3B82F6"/>
                <circle cx="21" cy="22" r="2" fill="white"/>
                <circle cx="27" cy="22" r="2" fill="white"/>
                <path d="M20,28 Q24,31 28,28" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-heading">Time for a Break!</h3>
            <p className="text-slate-600 mt-2">You've been working hard! Take 5 minutes to recharge.</p>
            
            <div className="mt-6 mb-4 flex justify-center">
              <ProgressRing progress={progress} radius={50} stroke={4}>
                <span className="text-3xl font-bold text-slate-800">
                  {formatTime(timeRemaining)}
                </span>
              </ProgressRing>
            </div>
            
            {!breakOption ? (
              <div className="grid grid-cols-3 gap-4 mt-8 mb-6">
                <button 
                  className="flex flex-col items-center bg-slate-100 hover:bg-slate-200 p-3 rounded-lg transition-colors"
                  onClick={() => handleBreakOptionSelect("game")}
                >
                  <i className="fas fa-gamepad text-slate-600 text-xl mb-2"></i>
                  <span className="text-xs text-slate-700 font-medium">Quick Game</span>
                </button>
                <button 
                  className="flex flex-col items-center bg-slate-100 hover:bg-slate-200 p-3 rounded-lg transition-colors"
                  onClick={() => handleBreakOptionSelect("mindfulness")}
                >
                  <i className="fas fa-brain text-slate-600 text-xl mb-2"></i>
                  <span className="text-xs text-slate-700 font-medium">Mind Break</span>
                </button>
                <button 
                  className="flex flex-col items-center bg-slate-100 hover:bg-slate-200 p-3 rounded-lg transition-colors"
                  onClick={() => handleBreakOptionSelect("video")}
                >
                  <i className="fas fa-video text-slate-600 text-xl mb-2"></i>
                  <span className="text-xs text-slate-700 font-medium">Watch Video</span>
                </button>
              </div>
            ) : (
              renderBreakContent()
            )}
            
            <Button 
              className="w-full mt-4"
              variant={breakOption ? "outline" : "default"}
              onClick={onClose}
            >
              {breakOption ? "Back to Break Options" : "Skip Break & Continue"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
