import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/notification-provider';
import { Trophy, Target, Clock, Zap, ChevronRight, Calendar, Award, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyChallengeTask {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: 'roleplay' | 'test' | 'pi' | 'written';
}

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  tasks: DailyChallengeTask[];
  totalPoints: number;
  earnedPoints: number;
  expiresAt: Date;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function EnhancedDailyChallenge() {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const { data: challenge, isLoading } = useQuery<DailyChallenge>({
    queryKey: ['/api/daily-challenge'],
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/daily-challenge/complete/${taskId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-challenge'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Show completion animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Show notification
      addNotification({
        type: 'success',
        title: 'Task Completed!',
        message: `+${data.pointsEarned} points earned`,
        duration: 5000,
        icon: <Award className="h-5 w-5 text-yellow-500" />
      });
      
      // Check if daily challenge is fully completed
      if (data.challengeCompleted) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 }
          });
          
          addNotification({
            type: 'achievement',
            title: 'Daily Challenge Completed!',
            message: `Congratulations! You've earned ${data.totalPoints} points today!`,
            duration: 7000,
            icon: <Trophy className="h-5 w-5 text-yellow-500" />,
            persistent: true
          });
        }, 500);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading || !challenge) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeRemaining = new Date(challenge.expiresAt).getTime() - new Date().getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  const completionPercentage = challenge.totalPoints > 0 
    ? (challenge.earnedPoints / challenge.totalPoints) * 100 
    : 0;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800'
  };

  const taskIcons = {
    roleplay: '🎭',
    test: '📝',
    pi: '📊',
    written: '✍️'
  };

  return (
    <Card className="w-full relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Today's Challenge</CardTitle>
          </div>
          <Badge className={difficultyColors[challenge.difficulty]} variant="secondary">
            {challenge.difficulty}
          </Badge>
        </div>
        
        <CardDescription className="text-base">
          {challenge.description}
        </CardDescription>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {challenge.earnedPoints}/{challenge.totalPoints} points
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {hoursRemaining}h {minutesRemaining}m remaining
              </span>
            </div>
          </div>
          
          {challenge.completed && (
            <Badge variant="default" className="bg-green-500">
              <Trophy className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        <Progress value={completionPercentage} className="h-2 mt-4" />
      </CardHeader>
      
      <CardContent className="relative space-y-3">
        <AnimatePresence>
          {challenge.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-primary/50'
                  }
                `}
                onClick={() => !task.completed && setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">
                      {taskIcons[task.type]}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                      
                      {expandedTask === task.id && !task.completed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              completeMutation.mutate(task.id);
                            }}
                            disabled={completeMutation.isPending}
                          >
                            {completeMutation.isPending ? (
                              'Completing...'
                            ) : (
                              <>
                                Start Task
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={task.completed ? "default" : "outline"}>
                      {task.completed ? (
                        <>
                          <Award className="h-3 w-3 mr-1" />
                          Earned
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          +{task.points}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {challenge.completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center"
          >
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="font-semibold text-yellow-900">
              Awesome job! Come back tomorrow for a new challenge!
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              Keep your streak going to unlock special rewards
            </p>
          </motion.div>
        )}
        
        {!challenge.completed && challenge.earnedPoints > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                You're {Math.round(completionPercentage)}% done! Keep going!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}