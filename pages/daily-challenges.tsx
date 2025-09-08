import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Play,
  Award
} from "lucide-react";

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  type: string;
  target: number;
  points: number;
  decitsReward: number;
  difficulty: string;
  category: string;
  isActive: boolean;
  userProgress?: {
    progress: number;
    isCompleted: boolean;
  };
}

const difficultyColors = {
  easy: "from-green-400 to-green-600",
  medium: "from-yellow-400 to-yellow-600",
  hard: "from-red-400 to-red-600",
  expert: "from-purple-400 to-purple-600"
};

const categoryIcons = {
  testing: "fas fa-clipboard-check",
  roleplay: "fas fa-people-arrows",
  study: "fas fa-book-open",
  streak: "fas fa-fire",
  performance: "fas fa-chart-line",
  mastery: "fas fa-crown"
};

export default function DailyChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["/api/daily-challenge"],
    enabled: !!user
  });

  const completeChallengeMutation = useMutation({
    mutationFn: (data: { challengeId: number; progress: number }) =>
      apiRequest(`/api/daily-challenge/complete`, {
        method: "POST",
        body: data
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/achievements/check"] });
      
      toast({
        title: "Challenge Completed! 🎉",
        description: `You've earned ${data.decitsReward} DECITS and ${data.points} points!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Get progress percentage for a challenge
  const getProgressPercentage = (target: number, currentProgress: number) => {
    return Math.min((currentProgress / target) * 100, 100);
  };

  const isCompleted = challenge?.userProgress?.isCompleted || false;
  const progressValue = challenge?.userProgress?.progress || 0;

  const handleCompleteChallenge = () => {
    if (!challenge) return;
    
    completeChallengeMutation.mutate({
      challengeId: challenge.id,
      progress: challenge.target // Complete the challenge
    });
  };

  const handleUpdateProgress = (progress: number) => {
    if (!challenge) return;
    
    completeChallengeMutation.mutate({
      challengeId: challenge.id,
      progress: progress
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Daily Challenge
            </h1>
            <p className="text-slate-600">Complete today's challenge to earn bonus DECITS!</p>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </motion.div>
          ) : challenge ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Challenge Card */}
              <Card className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      {challenge.title}
                    </CardTitle>
                    <Badge variant={challenge.difficulty === 'easy' ? 'default' : challenge.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-lg">{challenge.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Progress</span>
                      <span className="text-sm font-bold text-slate-800">
                        {progressValue} / {challenge.target}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(challenge.target, progressValue)} 
                      className="h-3"
                    />
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Rewards Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Points</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{challenge.points}</span>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">DECITS</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{challenge.decitsReward}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {!isCompleted ? (
                      <>
                        <Button 
                          onClick={() => handleUpdateProgress(Math.min(progressValue + 25, challenge.target))}
                          variant="outline"
                          className="flex-1"
                          disabled={completeChallengeMutation.isPending}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Update Progress
                        </Button>
                        <Button 
                          onClick={handleCompleteChallenge}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={completeChallengeMutation.isPending}
                        >
                          {completeChallengeMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Complete Challenge
                        </Button>
                      </>
                    ) : (
                      <div className="w-full bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-semibold">Challenge Completed!</p>
                        <p className="text-green-600 text-sm">Great job! Come back tomorrow for a new challenge.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Challenge Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Challenge Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Type:</span>
                      <p className="text-slate-800 capitalize">{challenge.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Category:</span>
                      <p className="text-slate-800 capitalize">{challenge.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Target:</span>
                      <p className="text-slate-800">{challenge.target}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Difficulty:</span>
                      <p className="text-slate-800 capitalize">{challenge.difficulty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Challenge Available</h3>
              <p className="text-slate-500">Check back later for new challenges!</p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}