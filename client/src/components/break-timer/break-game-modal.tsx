import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// Mini games for the break timer
import MemoryGame from "./games/memory-game";
import BlockBlast from "./games/block-blast";
import RelaxBreak from "./games/relax-break";

export interface BreakGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakDuration?: number; // in seconds
}

export default function BreakGameModal({
  isOpen,
  onClose,
  breakDuration = 300 // 5 minutes default
}: BreakGameModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(breakDuration);
  const [selectedTab, setSelectedTab] = useState<string>("relax");
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, timeRemaining]);
  
  useEffect(() => {
    if (timeRemaining === 0) {
      onClose();
    }
  }, [timeRemaining, onClose]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = (timeRemaining / breakDuration) * 100;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-heading">Time for a Brain Break!</DialogTitle>
          <DialogDescription className="text-center">
            Research shows regular breaks improve productivity and information retention.
            Take 5 minutes to reset your mind.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Time Remaining</span>
            <motion.span 
              key={timeRemaining}
              initial={{ scale: 1.2, color: "#2563EB" }}
              animate={{ scale: 1, color: "#64748B" }}
              className="font-mono font-bold"
            >
              {formatTime(timeRemaining)}
            </motion.span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="relax">Relaxation</TabsTrigger>
            <TabsTrigger value="memory">Memory Game</TabsTrigger>
            <TabsTrigger value="blockblast">Block Blast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="relax" className="h-[300px]">
            <RelaxBreak />
          </TabsContent>
          
          <TabsContent value="memory" className="h-[300px]">
            <MemoryGame />
          </TabsContent>
          
          <TabsContent value="blockblast" className="h-[300px]">
            <BlockBlast />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedTab === 'relax' ? (
                <span>Breathe deeply and relax your mind</span>
              ) : (
                <span>Games help reset mental focus</span>
              )}
            </div>
            <Button onClick={onClose}>
              I'm Ready to Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}