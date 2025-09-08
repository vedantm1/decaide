import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Clock, 
  Target, 
  Award, 
  Flame, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Calendar,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Star,
  Zap,
  Trophy,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  A24StaggerContainer, 
  A24StaggerItem, 
  A24HoverCard, 
  A24GlassCard,
  A24FadeIn,
  A24ProgressRing,
  A24Button,
  A24TextReveal
} from "@/components/animations/a24-style-animations";
import { AchievementCard3D } from "@/components/gamification/3d-achievement-card";
import { ChallengeCard3D } from "@/components/gamification/3d-challenge-card";
import { AdvancedAnalytics } from "@/components/learning-insights/advanced-analytics";

// Live queries for dashboard data
const useDashboardData = () => {
  const statsQuery = useQuery({ queryKey: ["/api/user/stats"] });
  const activitiesQuery = useQuery({ queryKey: ["/api/user/activities"] });
  const learningItemsQuery = useQuery({ queryKey: ["/api/user/learning"] });
  const dailyChallengeQuery = useQuery({ queryKey: ["/api/daily-challenge"] });
  const achievementsQuery = useQuery({ queryKey: ["/api/user/achievements/new"] });
  const allAchievementsQuery = useQuery({ queryKey: ["/api/achievements"] });
  const categoryBreakdownQuery = useQuery({ queryKey: ["/api/user/category-breakdown"] });

  return {
    statsQuery,
    activitiesQuery,
    learningItemsQuery,
    dailyChallengeQuery,
    achievementsQuery,
    allAchievementsQuery,
    categoryBreakdownQuery,
  } as const;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    statsQuery,
    activitiesQuery,
    learningItemsQuery,
    dailyChallengeQuery,
    achievementsQuery,
    allAchievementsQuery,
    categoryBreakdownQuery,
  } = useDashboardData();
  const [activeTab, setActiveTab] = useState("overview");
  const [studySession, setStudySession] = useState({
    isActive: false,
    startTime: null as Date | null,
    duration: 0,
    isPaused: false
  });

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  // Study session controls
  const startSession = () => {
    setStudySession({
      isActive: true,
      startTime: new Date(),
      duration: 0,
      isPaused: false
    });
  };

  const pauseSession = () => {
    setStudySession(prev => ({ ...prev, isPaused: true }));
  };

  const resumeSession = () => {
    setStudySession(prev => ({ ...prev, isPaused: false }));
  };

  const endSession = () => {
    setStudySession({
      isActive: false,
      startTime: null,
      duration: 0,
      isPaused: false
    });
  };

  // Update session duration
  useEffect(() => {
    if (studySession.isActive && !studySession.isPaused) {
      const interval = setInterval(() => {
        setStudySession(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [studySession.isActive, studySession.isPaused]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Derive UI data from queries with sensible fallbacks
  const studyTimeToday = (statsQuery.data as any)?.totalStudyTime ?? 0;
  const averageScore = (statsQuery.data as any)?.averageTestScore ?? 0;
  const achievementsUnlocked = ((achievementsQuery.data as any[])?.length ?? 0) + 0;
  const totalAchievements = (allAchievementsQuery.data as any[])?.length ?? 0;
  const streak = (statsQuery.data as any)?.streak ?? 0;
  const totalPoints = (statsQuery.data as any)?.totalPoints ?? 0;
  const level = (statsQuery.data as any)?.level ?? 1;
  const experience = (statsQuery.data as any)?.experience ?? 0;
  const nextLevelExp = level * 1000;

  const recentActivities = Array.isArray(activitiesQuery.data) ? activitiesQuery.data : [];
  const performanceCategories = Array.isArray(categoryBreakdownQuery.data)
    ? (categoryBreakdownQuery.data as any[]).map((c: any) => ({ name: c.category, score: c.averageScore, trend: 'up' }))
    : [];

  return (
    <MainLayout>
      <A24StaggerContainer className="space-y-8">
        <A24StaggerItem>
          <PageHeader
            title={`Welcome back, ${user?.username || 'Learner'}`}
            subtitle="Track your progress and continue your DECA journey"
          />
        </A24StaggerItem>

        <A24StaggerItem>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-background/40 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Progress
              </TabsTrigger>
              <TabsTrigger value="gamification" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Achievements
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <A24StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <A24StaggerItem>
                  <A24HoverCard>
                        <StatCard
                          title="Study Time"
                          value={formatTime(studyTimeToday)}
                      icon={<Clock className="h-4 w-4" />}
                          change={{ value: 0, direction: 'up', label: 'vs last period' }}
                    />
                  </A24HoverCard>
                </A24StaggerItem>
                
                <A24StaggerItem>
                  <A24HoverCard>
                        <StatCard
                          title="Average Score"
                          value={`${averageScore}%`}
                      icon={<Target className="h-4 w-4" />}
                          change={{ value: 0, direction: 'up', label: 'vs last week' }}
                    />
                  </A24HoverCard>
                </A24StaggerItem>
                
                <A24StaggerItem>
                  <A24HoverCard>
                        <StatCard
                          title="Achievements"
                          value={`${achievementsUnlocked}/${totalAchievements}`}
                      icon={<Award className="h-4 w-4" />}
                          change={{ value: 0, direction: 'up', label: 'this week' }}
                    />
                  </A24HoverCard>
                </A24StaggerItem>
                
                <A24StaggerItem>
                  <A24HoverCard>
                        <StatCard
                          title="Study Streak"
                          value={`${streak} days`}
                      icon={<Flame className="h-4 w-4" />}
                          change={{ value: 0, direction: 'up', label: 'vs last week' }}
                    />
                  </A24HoverCard>
                </A24StaggerItem>
              </A24StaggerContainer>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <A24StaggerItem>
                  <A24GlassCard>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {recentActivities.map((activity: any, index: number) => (
                        <motion.div
                           key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                               <p className="font-medium text-foreground">{activity.title}</p>
                               <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                             {activity.score ?? 0}%
                          </Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </A24GlassCard>
                </A24StaggerItem>

                <A24StaggerItem>
                  <A24GlassCard>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Weekly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {performanceCategories.slice(0,7).map((cat: any, index: number) => (
                          <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{cat.name}</span>
                              <span className="font-medium">{Math.round(cat.score)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <motion.div
                                className="bg-primary h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(cat.score)}%` }}
                                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </A24GlassCard>
                </A24StaggerItem>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <A24StaggerItem>
                  <A24GlassCard>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Category Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {performanceCategories.map((category: any, index: number) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{category.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {category.trend === 'up' ? 'Improving' : 'Needs attention'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{Math.round(category.score)}%</p>
                            <div className="flex items-center space-x-1">
                              {category.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </A24GlassCard>
                </A24StaggerItem>

                <A24StaggerItem>
                  <A24GlassCard>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Study Session</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <A24ProgressRing
                          progress={Math.min((experience / nextLevelExp) * 100, 100)}
                          size={120}
                          strokeWidth={8}
                          className="mx-auto"
                        />
                        <div className="mt-4 space-y-2">
                          <p className="text-2xl font-bold">Level {level}</p>
                          <p className="text-sm text-muted-foreground">
                            {experience} / {nextLevelExp} XP
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Current Session</p>
                          <p className="text-3xl font-bold text-primary">
                            {formatTime(studySession.duration)}
                          </p>
                        </div>

                        <div className="flex justify-center space-x-2">
                          {!studySession.isActive ? (
                            <A24Button onClick={startSession} className="px-6 py-2">
                              <Play className="h-4 w-4 mr-2" />
                              Start Session
                            </A24Button>
                          ) : (
                            <>
                              {studySession.isPaused ? (
                                <A24Button onClick={resumeSession} className="px-6 py-2">
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </A24Button>
                              ) : (
                                <A24Button onClick={pauseSession} className="px-6 py-2">
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </A24Button>
                              )}
                              <A24Button onClick={endSession} variant="secondary" className="px-6 py-2">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                End
                              </A24Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </A24GlassCard>
                </A24StaggerItem>
              </div>
            </TabsContent>

            <TabsContent value="gamification" className="space-y-6">
              <A24StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(achievementsQuery.data as any[] | undefined)?.map((ua: any, index: number) => (
                  <A24StaggerItem key={`${ua.achievementId}-${index}`}>
                    <AchievementCard3D
                      achievement={{
                        id: String(ua.achievementId || ua.id),
                        name: ua.achievement?.name || 'Achievement',
                        description: ua.achievement?.description || '',
                        icon: 'Trophy',
                        category: ua.achievement?.category || 'General',
                        tier: ((ua.achievement?.tier || 1) === 1 ? 'bronze' : (ua.achievement?.tier === 2 ? 'silver' : (ua.achievement?.tier === 3 ? 'gold' : 'platinum'))) as 'bronze' | 'silver' | 'gold' | 'platinum',
                        points: ua.achievement?.points || 0,
                        isUnlocked: true,
                        progress: 100,
                        maxProgress: 100,
                        rarity: 'rare'
                      }}
                    />
                  </A24StaggerItem>
                ))}
              </A24StaggerContainer>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <A24StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyChallengeQuery.data ? (
                  <A24StaggerItem key={(dailyChallengeQuery.data as any).id}>
                    <ChallengeCard3D
                      challenge={{
                        id: String((dailyChallengeQuery.data as any).id),
                        title: (dailyChallengeQuery.data as any).title,
                        description: (dailyChallengeQuery.data as any).description,
                        type: (((dailyChallengeQuery.data as any).type || 'daily') as 'daily' | 'weekly' | 'monthly' | 'special'),
                        category: (dailyChallengeQuery.data as any).category || 'General',
                        target: (dailyChallengeQuery.data as any).target || 0,
                        progress: (dailyChallengeQuery.data as any).userProgress?.progress || 0,
                        reward: {
                          points: (dailyChallengeQuery.data as any).points || 0,
                          decits: (dailyChallengeQuery.data as any).decitsReward || 0,
                          experience: ((dailyChallengeQuery.data as any).points || 0) * 2
                        },
                        isCompleted: !!(dailyChallengeQuery.data as any).userProgress?.isCompleted,
                        expiresAt: new Date(new Date((dailyChallengeQuery.data as any).date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
                        difficulty: (((dailyChallengeQuery.data as any).difficulty || 'medium') as 'easy' | 'medium' | 'hard' | 'expert')
                      }}
                    />
                  </A24StaggerItem>
                ) : null}
              </A24StaggerContainer>
            </TabsContent>
          </Tabs>
        </A24StaggerItem>
      </A24StaggerContainer>
    </MainLayout>
  );
}