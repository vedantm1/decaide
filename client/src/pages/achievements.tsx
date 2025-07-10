import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementCard, AchievementProgress } from '@/components/achievements/achievement-notification';
import { Trophy, Target, Star, Zap, TrendingUp } from 'lucide-react';

export function AchievementsPage() {
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: userAchievements } = useQuery({
    queryKey: [`/api/user/${user?.id}/achievements`],
    enabled: !!user?.id
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const earnedAchievements = userAchievements || [];
  const lockedAchievements = allAchievements?.filter(
    (achievement: any) => !earnedAchievements.find((earned: any) => earned.achievementId === achievement.id)
  ) || [];

  const categorizedAchievements = {
    earned: {
      Performance: earnedAchievements.filter((a: any) => a.category === 'Performance'),
      Consistency: earnedAchievements.filter((a: any) => a.category === 'Consistency'),
      Mastery: earnedAchievements.filter((a: any) => a.category === 'Mastery'),
      Special: earnedAchievements.filter((a: any) => a.category === 'Special'),
    },
    locked: {
      Performance: lockedAchievements.filter((a: any) => a.category === 'Performance'),
      Consistency: lockedAchievements.filter((a: any) => a.category === 'Consistency'),
      Mastery: lockedAchievements.filter((a: any) => a.category === 'Mastery'),
      Special: lockedAchievements.filter((a: any) => a.category === 'Special'),
    }
  };

  const categoryIcons = {
    Performance: <TrendingUp className="h-5 w-5" />,
    Consistency: <Target className="h-5 w-5" />,
    Mastery: <Zap className="h-5 w-5" />,
    Special: <Star className="h-5 w-5" />
  };

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
                <AchievementProgress userId={user.id} />
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

            <TabsContent value="earned" className="space-y-6 mt-6">
              {Object.entries(categorizedAchievements.earned).map(([category, achievements]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    {category} ({achievements.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {achievements.map((achievement: any) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                  {achievements.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No {category.toLowerCase()} achievements earned yet
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="locked" className="space-y-6 mt-6">
              {Object.entries(categorizedAchievements.locked).map(([category, achievements]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    {category} ({achievements.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {achievements.map((achievement: any) => (
                      <div key={achievement.id} className="opacity-60">
                        <AchievementCard achievement={{
                          ...achievement,
                          earnedAt: null
                        }} />
                      </div>
                    ))}
                  </div>
                  {achievements.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      All {category.toLowerCase()} achievements earned!
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}