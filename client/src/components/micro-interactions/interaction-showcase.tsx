import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import SuccessAnimation from '../animations/success-animation';
import BreakTimer from '../break-timer';

export default function InteractionShowcase() {
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<'confetti' | 'stars' | 'circles' | 'fireworks' | 'random'>('random');
  const [showMascot, setShowMascot] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  
  const { toast } = useToast();
  
  // Handler for playing success animation
  const playAnimation = () => {
    setTriggerAnimation(true);
  };
  
  // Handler when animation completes
  const handleAnimationComplete = () => {
    setTriggerAnimation(false);
  };
  
  // Handler for toggling break timer
  const toggleBreakTimer = () => {
    setShowBreakTimer(prev => !prev);
  };
  
  // Handler for showing mascot
  const toggleMascot = () => {
    setShowMascot(prev => !prev);
  };
  
  // Handler for incrementing streak
  const incrementStreak = () => {
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    
    // Show streak milestone messages
    if (newStreak % 5 === 0) {
      toast({
        title: `${newStreak} Day Streak!`,
        description: `You've been consistent for ${newStreak} days. Keep it up!`,
        variant: "default",
      });
      
      // Play animation for milestone streaks
      setAnimationType('fireworks');
      setTriggerAnimation(true);
    } else {
      toast({
        title: "Streak Updated",
        description: `Current streak: ${newStreak} days`,
      });
    }
    
    // Award badge at streak 10
    if (newStreak === 10 && !showBadge) {
      setTimeout(() => {
        setShowBadge(true);
        toast({
          title: "New Badge Earned!",
          description: "Commitment Champion: Complete a 10-day streak",
          variant: "default",
        });
      }, 1500);
    }
  };
  
  // Reset streak
  const resetStreak = () => {
    setStreakCount(0);
    setShowBadge(false);
    
    toast({
      title: "Streak Reset",
      description: "Your streak has been reset to 0",
      variant: "destructive",
    });
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Micro-Interaction Showcase</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Animation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Success Animations</CardTitle>
            <CardDescription>
              Celebrate user achievements with dynamic visual feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnimationType('confetti')}
                  className={animationType === 'confetti' ? 'border-primary' : ''}
                >
                  Confetti
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnimationType('stars')}
                  className={animationType === 'stars' ? 'border-primary' : ''}
                >
                  Stars
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnimationType('circles')}
                  className={animationType === 'circles' ? 'border-primary' : ''}
                >
                  Circles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnimationType('fireworks')}
                  className={animationType === 'fireworks' ? 'border-primary' : ''}
                >
                  Fireworks
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAnimationType('random')}
                  className={animationType === 'random' ? 'border-primary' : ''}
                >
                  Random
                </Button>
              </div>
              
              <Button onClick={playAnimation}>
                Trigger Animation
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Streak Counter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Counter</CardTitle>
            <CardDescription>
              Motivate users to maintain consistent learning habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-end gap-2">
                <motion.div 
                  key={streakCount}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl font-bold text-primary">
                    {streakCount}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    day streak
                  </span>
                </motion.div>
                
                {streakCount >= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    🔥
                  </motion.div>
                )}
              </div>
              
              <AnimatePresence>
                {showBadge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    <span>🏆</span> Commitment Champion
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-2 mt-2">
                <Button onClick={incrementStreak}>
                  Increment Streak
                </Button>
                <Button variant="outline" onClick={resetStreak}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Break Timer Section */}
        <Card>
          <CardHeader>
            <CardTitle>Break Timer</CardTitle>
            <CardDescription>
              Encourage healthy study habits with timed breaks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                The break timer system includes three different mini-games to help students reset their minds during study breaks. 
                This feature improves learning retention and prevents burnout.
              </p>
              
              <Button onClick={toggleBreakTimer}>
                {showBreakTimer ? 'Hide Break Timer' : 'Show Break Timer'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Mascot Section */}
        <Card>
          <CardHeader>
            <CardTitle>Diego the Dolphin</CardTitle>
            <CardDescription>
              Friendly mascot provides guidance and personality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <AnimatePresence>
                  {showMascot && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="relative bg-blue-100 p-4 rounded-lg max-w-xs"
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">
                        🐬
                      </div>
                      <div className="mt-10 text-center">
                        <p className="font-medium text-blue-800">Hi, I'm Diego!</p>
                        <p className="text-sm text-blue-700 mt-1">
                          I'm here to help you achieve your DECA goals. Let's work together!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Button onClick={toggleMascot}>
                {showMascot ? 'Hide Diego' : 'Show Diego'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Success Animation component */}
      <SuccessAnimation 
        trigger={triggerAnimation} 
        onComplete={handleAnimationComplete}
        type={animationType}
        message={animationType !== 'random' ? `${animationType.charAt(0).toUpperCase() + animationType.slice(1)} animation completed!` : undefined}
      />
      
      {/* Break Timer component */}
      {showBreakTimer && (
        <BreakTimer onClose={() => setShowBreakTimer(false)} />
      )}
    </div>
  );
}