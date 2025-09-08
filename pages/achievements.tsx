import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Star, Zap, TrendingUp, Award, Crown, Medal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  threshold: number;
  points: number;
  iconName: string;
  tier: number;
  isHidden: boolean;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
  progress: number;
  isDisplayed: boolean;
  seasonEarned: string;
  achievement?: Achievement;
}

const tierColors = {
  1: 'from-amber-400 to-amber-600', // Bronze
  2: 'from-gray-300 to-gray-500',   // Silver
  3: 'from-yellow-400 to-yellow-600', // Gold
  4: 'from-purple-400 to-purple-600'  // Platinum
};

const tierNames = {
  1: 'Bronze',
  2: 'Silver', 
  3: 'Gold',
  4: 'Platinum'
};

export function AchievementsPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ['/api/user/achievements/new'],
    enabled: isAuthenticated && !!user?.id
  });

  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
    enabled: isAuthenticated
  });

  const checkAchievementsMutation = useMutation({
    mutationFn: () => apiRequest('/api/user/achievements/check', { method: 'POST' }),
    onSuccess: (newAchievements) => {
      if (newAchievements && newAchievements.length > 0) {
        toast({
          title: "New Achievements Unlocked! 🎉",
          description: `You've earned ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/achievements/new'] });
        queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      }
    }
  });

  const markAsDisplayedMutation = useMutation({
    mutationFn: (achievementId: number) => 
      apiRequest(`/api/user/achievements/${achievementId}/displayed`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/achievements/new'] });
    }
  });

  const earnedAchievements = Array.isArray(userAchievements) ? userAchievements : [];
  const lockedAchievements = Array.isArray(allAchievements) ? allAchievements.filter(
    (achievement: Achievement) => !earnedAchievements.find((earned: UserAchievement) => earned.achievementId === achievement.id)
  ) : [];

  const categorizedAchievements = {
    earned: {
      Performance: earnedAchievements.filter((a: UserAchievement) => a.achievement?.category === 'Performance'),
      Consistency: earnedAchievements.filter((a: UserAchievement) => a.achievement?.category === 'Consistency'),
      Mastery: earnedAchievements.filter((a: UserAchievement) => a.achievement?.category === 'Mastery'),
      Special: earnedAchievements.filter((a: UserAchievement) => a.achievement?.category === 'Special'),
      General: earnedAchievements.filter((a: UserAchievement) => !a.achievement?.category || a.achievement?.category === 'general'),
    },
    locked: {
      Performance: lockedAchievements.filter((a: Achievement) => a.category === 'Performance'),
      Consistency: lockedAchievements.filter((a: Achievement) => a.category === 'Consistency'),
      Mastery: lockedAchievements.filter((a: Achievement) => a.category === 'Mastery'),
      Special: lockedAchievements.filter((a: Achievement) => a.category === 'Special'),
      General: lockedAchievements.filter((a: Achievement) => !a.category || a.category === 'general'),
    }
  };

  const categoryIcons = {
    Performance: <TrendingUp className="h-5 w-5" />,
    Consistency: <Target className="h-5 w-5" />,
    Mastery: <Zap className="h-5 w-5" />,
    Special: <Star className="h-5 w-5" />,
    General: <Award className="h-5 w-5" />
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Trophy': Trophy,
      'Star': Star,
      'Target': Target,
      'Zap': Zap,
      'TrendingUp': TrendingUp,
      'Award': Award,
      'Crown': Crown,
      'Medal': Medal
    };
    return iconMap[iconName] || Award;
  };

  const handleCheckAchievements = () => {
    checkAchievementsMutation.mutate();
  };

  const handleMarkAsDisplayed = (achievementId: number) => {
    markAsDisplayedMutation.mutate(achievementId);
  };

  if (userAchievementsLoading || allAchievementsLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Track your progress and unlock rewards
          </p>
        </motion.div>

        {/* Progress Overview */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{earnedAchievements.length}</div>
                    <div className="text-sm text-slate-600">Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">{lockedAchievements.length}</div>
                    <div className="text-sm text-slate-600">Locked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {allAchievements ? Math.round((earnedAchievements.length / allAchievements.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-slate-600">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {earnedAchievements.reduce((sum, a) => sum + (a.achievement?.points || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600">Total Points</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={handleCheckAchievements}
                    disabled={checkAchievementsMutation.isPending}
                    className="w-full"
                  >
                    {checkAchievementsMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trophy className="h-4 w-4 mr-2" />
                    )}
                    Check for New Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Achievement Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earned">
                Earned ({earnedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="locked">
                Locked ({lockedAchievements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="earned" className="space-y-6">
              {Object.entries(categorizedAchievements.earned).map(([category, achievements]) => (
                achievements.length > 0 && (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        {category} Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((userAchievement: UserAchievement) => {
                          const achievement = userAchievement.achievement;
                          if (!achievement) return null;
                          
                          const IconComponent = getIconComponent(achievement.iconName);
                          
                          return (
                            <motion.div
                              key={userAchievement.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`relative p-4 rounded-lg border-2 bg-gradient-to-br ${tierColors[achievement.tier as keyof typeof tierColors] || tierColors[1]} text-white`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {tierNames[achievement.tier as keyof typeof tierNames]}
                                </Badge>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                              <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span>{achievement.points} pts</span>
                                <span>{new Date(userAchievement.earnedAt).toLocaleDateString()}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </TabsContent>

            <TabsContent value="locked" className="space-y-6">
              {Object.entries(categorizedAchievements.locked).map(([category, achievements]) => (
                achievements.length > 0 && (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        {category} Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((achievement: Achievement) => {
                          const IconComponent = getIconComponent(achievement.iconName);
                          
                          return (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative p-4 rounded-lg border-2 border-slate-200 bg-slate-50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {tierNames[achievement.tier as keyof typeof tierNames]}
                                </Badge>
                                <IconComponent className="h-5 w-5 text-slate-400" />
                              </div>
                              <h3 className="font-bold text-lg mb-1 text-slate-800">{achievement.name}</h3>
                              <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Progress</span>
                                  <span className="text-slate-800 font-medium">0%</span>
                                </div>
                                <Progress value={0} className="h-2" />
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">{achievement.points} pts</span>
                                  <span className="text-slate-600">Locked</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}