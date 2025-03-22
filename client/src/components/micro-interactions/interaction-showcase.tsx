import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

export default function InteractionShowcase() {
  const [currentAnimationType, setCurrentAnimationType] = useState<'confetti' | 'stars' | 'circles' | 'fireworks' | 'random'>('random');
  const [streakCount, setStreakCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [showBreakTimerState, setShowBreakTimerState] = useState(false);
  const [showAchievementState, setShowAchievementState] = useState(false);
  
  const { toast } = useToast();
  const { triggerAnimation, showBreakTimer, hideBreakTimer, showAchievement } = useMicroInteractions();
  
  // Handler for playing success animation
  const playAnimation = () => {
    triggerAnimation(currentAnimationType, 
      currentAnimationType !== 'random' 
        ? `${currentAnimationType.charAt(0).toUpperCase() + currentAnimationType.slice(1)} animation completed!` 
        : undefined
    );
  };
  
  // Handler for toggling break timer
  const toggleBreakTimer = () => {
    if (showBreakTimerState) {
      hideBreakTimer();
      setShowBreakTimerState(false);
    } else {
      showBreakTimer();
      setShowBreakTimerState(true);
    }
  };
  
  // Handler for toggling achievement notification
  const toggleAchievement = () => {
    if (showAchievementState) {
      setShowAchievementState(false);
    } else {
      showAchievement("DECA Achievement", "I'm here to help you achieve your DECA goals!", 20);
      triggerAnimation('stars');
      setShowAchievementState(true);
    }
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
      triggerAnimation('fireworks', `${newStreak} Day Streak! Congratulations!`);
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
                  onClick={() => setCurrentAnimationType('confetti')}
                  className={currentAnimationType === 'confetti' ? 'border-primary' : ''}
                >
                  Confetti
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentAnimationType('stars')}
                  className={currentAnimationType === 'stars' ? 'border-primary' : ''}
                >
                  Stars
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentAnimationType('circles')}
                  className={currentAnimationType === 'circles' ? 'border-primary' : ''}
                >
                  Circles
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentAnimationType('fireworks')}
                  className={currentAnimationType === 'fireworks' ? 'border-primary' : ''}
                >
                  Fireworks
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentAnimationType('random')}
                  className={currentAnimationType === 'random' ? 'border-primary' : ''}
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
                {showBreakTimerState ? 'Hide Break Timer' : 'Show Break Timer'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievement Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Notifications</CardTitle>
            <CardDescription>
              Celebrate accomplishments with achievement notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="h-20 flex items-center justify-center">
                  {showAchievementState && (
                    <div className="text-center">
                      <p className="font-medium text-primary">Achievement triggered!</p>
                      <p className="text-sm text-muted-foreground">
                        Check the notification toast that appeared
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Button onClick={toggleAchievement}>
                {showAchievementState ? 'Hide Achievement' : 'Show Achievement'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}