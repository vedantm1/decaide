import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockBlast from './games/block-blast';
import MemoryGame from './games/memory-game';
import RelaxBreak from './games/relax-break';

export interface BreakGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakDuration?: number; // in seconds
}

export default function BreakGameModal({
  isOpen,
  onClose,
  breakDuration = 300, // default 5 minutes
}: BreakGameModalProps) {
  const [activeTab, setActiveTab] = useState('relax');
  const [timeRemaining, setTimeRemaining] = useState(breakDuration);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 rounded-xl bg-card/95 backdrop-blur-sm">
        <header className="p-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg 
              className="h-5 w-5 text-primary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="text-lg font-semibold">Break Time</h2>
          </div>
          
          <motion.div
            className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="relax" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 mx-4 mt-2">
              <TabsTrigger value="relax">Relax</TabsTrigger>
              <TabsTrigger value="memory">Memory Game</TabsTrigger>
              <TabsTrigger value="blocks">Block Blast</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <TabsContent value="relax" className="h-full m-0 p-0">
                    <RelaxBreak />
                  </TabsContent>
                  
                  <TabsContent value="memory" className="h-full m-0 p-0">
                    <MemoryGame />
                  </TabsContent>
                  
                  <TabsContent value="blocks" className="h-full m-0 p-0">
                    <BlockBlast />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
        
        <div className="p-4 pt-2 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Taking breaks improves learning retention and performance!</p>
          <button 
            onClick={onClose}
            className="text-sm font-medium text-primary hover:underline"
          >
            End Break Early
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}