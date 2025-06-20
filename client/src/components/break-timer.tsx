import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import BreakGameModal from './break-timer/break-game-modal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface BreakTimerProps {
  onClose: () => void;
  duration?: number; // Duration in seconds, default 5 minutes
}

export default function BreakTimer({ onClose, duration = 300 }: BreakTimerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeUntilBreak, setTimeUntilBreak] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [breakSkipped, setBreakSkipped] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  
  // Initialize timer on mount
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && timeUntilBreak > 0) {
      timer = setInterval(() => {
        setTimeUntilBreak(prev => prev - 1);
      }, 1000);
    } else if (timeUntilBreak === 0) {
      // Time for a break
      setIsModalOpen(true);
      setSessionCount(prev => prev + 1);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeUntilBreak]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle session completion
  const handleBreakCompleted = () => {
    setIsModalOpen(false);
    setTimeUntilBreak(25 * 60); // Reset timer for next session
    setIsActive(true);
    setBreakSkipped(false);
    
    // Clear any pending reminders
    if (reminderInterval) {
      clearInterval(reminderInterval);
      setReminderInterval(null);
    }
    
    // Show toast for session completion based on count
    let toastMessage = '';
    
    if (sessionCount === 1) {
      toastMessage = 'First session complete! Keep up the good work.';
    } else if (sessionCount === 3) {
      toastMessage = 'You\'re on a roll! 3 sessions completed.';
    } else if (sessionCount === 5) {
      toastMessage = 'Amazing focus! You\'ve completed 5 sessions today.';
    } else if (sessionCount % 5 === 0) {
      toastMessage = `Incredible discipline! ${sessionCount} sessions completed.`;
    } else {
      toastMessage = 'Break completed. Back to work!';
    }
    
    toast({
      title: `Session ${sessionCount} Complete`,
      description: toastMessage,
    });
  };
  
  // Skip the break
  const handleSkipBreak = () => {
    setIsModalOpen(false);
    setTimeUntilBreak(25 * 60); // Reset timer for next session
    setIsActive(true);
    setBreakSkipped(true);
    
    // Set up reminder interval if break was skipped
    if (!reminderInterval) {
      const interval = setInterval(() => {
        toast({
          title: 'Break Reminder',
          description: 'Taking regular breaks improves retention and focus. Consider a short break soon.',
          duration: 5000,
        });
      }, 5 * 60 * 1000); // Remind every 5 minutes
      
      setReminderInterval(interval);
    }
    
    toast({
      title: 'Break Skipped',
      description: 'Remember that regular breaks improve learning effectiveness.',
      variant: 'destructive',
    });
  };
  
  // Pause timer
  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };
  
  // Reset timer
  const resetTimer = () => {
    setTimeUntilBreak(25 * 60);
    setIsActive(true);
  };
  
  return (
    <>
      <AnimatePresence>
        {!isModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-5 right-5 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-[180px]"
          >
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">Focus Timer</h3>
              <div className="text-xl font-mono font-bold mb-2">
                {formatTime(timeUntilBreak)}
              </div>
              
              {sessionCount > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  Sessions: {sessionCount}
                </div>
              )}
              
              <div className="flex gap-1 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0" 
                  onClick={toggleTimer}
                >
                  {isActive ? "⏸️" : "▶️"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0" 
                  onClick={resetTimer}
                >
                  🔄
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0 text-red-500" 
                  onClick={onClose}
                >
                  ✖️
                </Button>
              </div>
              
              {breakSkipped && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Don't forget to take breaks!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <BreakGameModal 
        isOpen={isModalOpen}
        onClose={handleBreakCompleted}
        breakDuration={duration}
      />
    </>
  );
}