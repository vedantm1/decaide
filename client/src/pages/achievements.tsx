import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Trophy, Star, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch user achievements
  const { data: userAchievements, isLoading: loadingUserAchievements } = useQuery({
    queryKey: ["/api/user/achievements"],
  });

  // Fetch all available achievements
  const { data: allAchievements, isLoading: loadingAllAchievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  // Fetch user stats for progress
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const isLoading = loadingUserAchievements || loadingAllAchievements;

  // Calculate achievement statistics
  const stats = {
    earned: userAchievements?.length || 0,
    total: allAchievements?.length || 0,
    points: userAchievements?.reduce((sum: number, ua: any) => 
      sum + (allAchievements?.find((a: any) => a.id === ua.achievementId)?.points || 0), 0
    ) || 0,
    percentage: allAchievements?.length 
      ? Math.round((userAchievements?.length || 0) / allAchievements.length * 100)
      : 0
  };

  // Merge achievement data with user progress
  const mergedAchievements = allAchievements?.map((achievement: any) => {
    const userAchievement = userAchievements?.find((ua: any) => ua.achievementId === achievement.id);
    const isEarned = !!userAchievement;
    
    // Calculate progress for unearned achievements
    let progress = 0;
    if (!isEarned && userStats) {
      switch (achievement.type) {
        case 'streak':
          progress = userStats.currentStreak || 0;
          break;
        case 'roleplay_complete':
          progress = userStats.roleplayCount || 0;
          break;
        case 'test_score':
          if (achievement.threshold <= 50) {
            progress = userStats.testCount || 0;
          } else {
            progress = userStats.highestTestScore || 0;
          }
          break;
        case 'performance_indicator':
          progress = userStats.completedPIs || 0;
          break;
        case 'written_event':
          progress = userStats.writtenEventCount || 0;
          break;
        case 'daily_challenge':
          progress = userStats.dailyChallengesCompleted || 0;
          break;
      }
    }

    return {
      ...achievement,
      earnedAt: userAchievement?.earnedAt,
      isEarned,
      progress
    };
  });

  // Filter achievements by category
  const filteredAchievements = selectedCategory === "all" 
    ? mergedAchievements 
    : mergedAchievements?.filter((a: any) => 
        selectedCategory === "earned" ? a.isEarned : a.type === selectedCategory
      );

  // Achievement categories
  const categories = [
    { value: "all", label: "All Achievements", icon: Trophy },
    { value: "earned", label: "Earned", icon: Star },
    { value: "streak", label: "Streaks", icon: Zap },
    { value: "roleplay_complete", label: "Roleplay", icon: Target },
    { value: "test_score", label: "Tests", icon: Target },
    { value: "performance_indicator", label: "Performance", icon: Target },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and unlock rewards as you master DECA skills
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">{stats.earned}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{stats.points}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold">{stats.percentage}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{stats.earned}/{stats.total}</span>
                </div>
                <Progress value={stats.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Gallery</CardTitle>
            <CardDescription>
              Earn achievements by completing challenges and reaching milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-6">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.value}
                    value={category.value}
                    className="flex items-center gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-40" />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredAchievements?.length === 0 ? (
                      <div className="col-span-2 text-center py-12">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No achievements found in this category
                        </p>
                      </div>
                    ) : (
                      filteredAchievements?.map((achievement: any, index: number) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <AchievementCard
                            achievement={achievement}
                            isEarned={achievement.isEarned}
                            showProgress={!achievement.isEarned}
                          />
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tier Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Achievement Tiers</CardTitle>
            <CardDescription>
              Achievements come in different tiers based on difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-700">
                  Bronze Tier
                </Badge>
                <span className="text-sm text-muted-foreground">Entry level achievements</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  Silver Tier
                </Badge>
                <span className="text-sm text-muted-foreground">Intermediate challenges</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                  Gold Tier
                </Badge>
                <span className="text-sm text-muted-foreground">Master level accomplishments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}