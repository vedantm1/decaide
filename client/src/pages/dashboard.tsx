
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";
import DailyChallenge from "@/components/dashboard/daily-challenge";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityItem from "@/components/dashboard/activity-item";
import ContinueLearningCard from "@/components/dashboard/continue-learning-card";
import UpgradeBanner from "@/components/dashboard/upgrade-banner";
import { AnimatePresence, motion } from "framer-motion";
import BreakTimer from "@/components/break-timer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user } = useAuth();
  const { triggerAnimation, showAchievement } = useMicroInteractions();
  const { toast } = useToast();
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);
  const [trialHoursLeft, setTrialHoursLeft] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [liveRecommendations, setLiveRecommendations] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, target: 20 });
  
  // AI-powered insights query
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/ai-insights"],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Live performance tracking
  const { data: livePerformance } = useQuery({
    queryKey: ["/api/live-performance"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Smart recommendations based on user behavior
  const { data: smartRecommendations } = useQuery({
    queryKey: ["/api/smart-recommendations"],
    enabled: !!user,
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  // Real-time progress updates
  useEffect(() => {
    if (livePerformance) {
      setWeeklyGoal({
        current: livePerformance.weeklyActivities || 0,
        target: livePerformance.weeklyTarget || 20
      });
    }
  }, [livePerformance]);

  // AI Insights processing
  useEffect(() => {
    if (insights) {
      setAiInsights(insights);
      
      // Show achievement if user reached a milestone
      if (insights.milestoneReached) {
        setTimeout(() => {
          triggerAnimation('fireworks', insights.milestoneMessage);
          showAchievement(insights.milestoneTitle, insights.milestoneDescription, insights.pointsEarned);
        }, 1000);
      }
    }
  }, [insights]);

  // Smart recommendations processing
  useEffect(() => {
    if (smartRecommendations) {
      setLiveRecommendations(smartRecommendations);
    }
  }, [smartRecommendations]);

  // Calculate remaining trial time (existing logic)
  useEffect(() => {
    if (user && user.subscriptionTier === 'free') {
      const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
      const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
      
      const trialStartDate = localStorage.getItem('trialStartDate');
      if (!trialStartDate) {
        localStorage.setItem('trialStartDate', new Date().toISOString());
        setShowTrialBanner(tutorialCompleted || !isFirstTimeUser);
        setTrialDaysLeft(3);
        setTrialHoursLeft(0);
      } else {
        const startDate = new Date(trialStartDate);
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate.getTime() - startDate.getTime());
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(hoursDiff / 24);
        
        let daysLeft = 3 - daysDiff;
        let hoursLeft = 24 - (hoursDiff % 24);
        
        if (daysLeft <= 0 && hoursLeft <= 0) {
          setTrialDaysLeft(0);
          setTrialHoursLeft(0);
          
          if (!localStorage.getItem('trialExpiredPromptShown')) {
            localStorage.setItem('trialExpiredPromptShown', 'true');
            setTimeout(() => {
              triggerAnimation('fireworks', "Your tropical getaway has ended! Upgrade to keep making waves at your DECA competitions! 🏄‍♂️");
              showAchievement("Trial Expired", "Upgrade to keep preparing for DECA competitions!", 0);
            }, 2000);
          }
        } else if (daysLeft <= 0) {
          setTrialDaysLeft(0);
          setTrialHoursLeft(hoursLeft);
          
          if (hoursLeft <= 12 && !localStorage.getItem('trialEndingSoonPromptShown')) {
            localStorage.setItem('trialEndingSoonPromptShown', 'true');
            setTimeout(() => {
              triggerAnimation("stars", "Your tropical vacation is almost over! Only a few hours left in your trial.");
              toast({
                title: "Trial Ending Soon",
                description: `Only ${hoursLeft} hours left in your free trial!`,
                variant: "destructive",
              });
            }, 1500);
          }
        } else {
          setTrialDaysLeft(daysLeft);
          setTrialHoursLeft(hoursLeft);
          
          if (daysLeft === 1 && !localStorage.getItem('trialOneDayLeftPromptShown')) {
            localStorage.setItem('trialOneDayLeftPromptShown', 'true');
            setTimeout(() => {
              triggerAnimation("circles", "Just 1 day left in your tropical trial! Don't let your DECA preparations wash away!");
              showAchievement("Trial Ending Soon", "Only 1 day left in your free trial!", 0);
            }, 1500);
          }
        }
        
        const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
        const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
        
        setShowTrialBanner(tutorialCompleted || !isFirstTimeUser);
      }
    }
  }, [user]);
  
  // Welcome animation (existing logic)
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
    const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
    
    if (justLoggedIn && user) {
      const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
      const delayTime = isFirstTimeUser ? 10000 : 800;
      
      setTimeout(() => {
        triggerAnimation('stars', 'Welcome to DecA(I)de!');
        
        if (user.subscriptionTier === 'free') {
          if (tutorialCompleted || !isFirstTimeUser) {
            triggerAnimation('confetti');
            showAchievement("Welcome!", `You've started your 3-day free trial. Let's get started with DECA preparation!`, 50);
          }
        } else {
          showAchievement("Welcome Back!", `Ready to practice for your next DECA competition?`, 10);
        }
        
        sessionStorage.removeItem('justLoggedIn');
      }, delayTime);
    }
  }, [triggerAnimation, showAchievement, user]);
  
  // Break timer (existing logic)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBreakTimer(true);
      toast({
        title: "Break Time",
        description: "Taking regular breaks helps improve retention and focus!",
      });
    }, 5 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  // Define types for the data
  interface Stats {
    roleplays: number;
    tests: number;
    completedPIs: number;
    totalPIs: number;
  }
  
  interface Activity {
    id: string;
    type: "roleplay" | "test" | "pi";
    title: string;
    description: string;
    score?: number;
    points?: number;
    date: string;
  }
  
  interface LearningItem {
    id: string;
    type: "roleplay" | "written" | "pi" | string;
    title: string;
    description: string;
    progress?: number;
    category: string;
  }
  
  interface Challenge {
    id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    completed: boolean;
  }
  
  // User stats query
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user
  });
  
  // Recent activities query
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
    enabled: !!user
  });
  
  // Continue learning items
  const { data: learningItems, isLoading: learningLoading } = useQuery<LearningItem[]>({
    queryKey: ["/api/user/learning"],
    enabled: !!user
  });
  
  // Daily challenge query
  const { data: dailyChallenge } = useQuery<Challenge>({
    queryKey: ["/api/daily-challenge"],
    enabled: !!user
  });
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          {/* AI-Powered Header with Live Insights */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-slate-800">
                  AI Dashboard
                  {aiInsights?.userLevel && (
                    <Badge className="ml-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {aiInsights.userLevel}
                    </Badge>
                  )}
                </h1>
                <p className="text-slate-500 mt-1">
                  Welcome back, <span className="text-primary font-medium">{user?.username || 'User'}</span>! 
                  {aiInsights?.personalizedGreeting || " Ready to practice for DECA?"}
                </p>
                
                {/* Live Weekly Goal Progress */}
                {weeklyGoal && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Weekly Goal Progress</span>
                      <span className="text-sm text-slate-500">
                        {weeklyGoal.current} / {weeklyGoal.target} activities
                      </span>
                    </div>
                    <Progress 
                      value={(weeklyGoal.current / weeklyGoal.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {weeklyGoal.target - weeklyGoal.current > 0 
                        ? `${weeklyGoal.target - weeklyGoal.current} more activities to reach your goal!`
                        : "🎉 Goal achieved! Keep up the great work!"
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {/* Enhanced Quick Actions */}
              <div className="hidden md:flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-lg text-sm font-medium transition shadow-lg"
                >
                  🚀 AI Practice
                </motion.button>
                
                {liveRecommendations.length > 0 && (
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-medium transition shadow-lg"
                  >
                    💡 Smart Tips ({liveRecommendations.length})
                  </motion.button>
                )}
                
                <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm">
                  <i className="fas fa-bell text-slate-400"></i>
                  {aiInsights?.hasNewNotifications && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Trial Banner */}
            {showTrialBanner && user?.subscriptionTier === 'free' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-500 rounded-xl overflow-hidden shadow-lg border border-blue-300"
              >
                <div className="relative p-5">
                  <div className="absolute -top-5 -right-5 w-32 h-32 opacity-10">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50,10 C45,25 60,30 55,40 C50,50 60,60 50,70 C40,60 50,50 45,40 C40,30 55,25 50,10 Z" fill="white"/>
                      <rect x="48" y="70" width="4" height="30" fill="white"/>
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">🏝️</span> AI-Powered Trial Experience
                      </h3>
                      <p className="text-blue-50 mt-1 max-w-xl">
                        Experience next-level AI coaching for {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} 
                        {trialHoursLeft > 0 && trialDaysLeft === 0 ? ` and ${trialHoursLeft} hour${trialHoursLeft !== 1 ? 's' : ''}` : ''}.
                        {trialDaysLeft === 0 && trialHoursLeft <= 5 ? ' Your AI coach is ready to maximize your DECA performance!' : ' Unlock intelligent practice sessions!'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {(trialDaysLeft > 0 || trialHoursLeft > 0) ? (
                        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-lg px-4 py-2 text-white font-medium flex items-center">
                          <span className="mr-2">⏳</span>
                          {trialDaysLeft > 0 ? (
                            <span>{trialDaysLeft}d {trialHoursLeft}h remaining</span>
                          ) : (
                            <span>{trialHoursLeft}h remaining</span>
                          )}
                        </div>
                      ) : (
                        <div className="bg-red-500 bg-opacity-80 rounded-lg px-4 py-2 text-white font-medium flex items-center">
                          <span className="mr-2">⚠️</span>
                          <span>Trial expired</span>
                        </div>
                      )}
                      
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="/pricing" 
                        className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <span className="mr-2">🚀</span>
                        Unlock AI Power
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Insights Panel */}
            {aiInsights && !insightsLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-brain text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">AI Coach Insights</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">Performance Trend</h4>
                    <p className="text-sm text-slate-600">{aiInsights.performanceTrend || "Your practice consistency is improving! Keep up the momentum."}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">Focus Area</h4>
                    <p className="text-sm text-slate-600">{aiInsights.focusArea || "Marketing scenarios need attention. Try 2 more roleplay sessions this week."}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">Next Milestone</h4>
                    <p className="text-sm text-slate-600">{aiInsights.nextMilestone || "Complete 3 more practice tests to unlock your Marketing Mastery badge!"}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Smart Recommendations */}
            {liveRecommendations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-lightbulb text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Smart Recommendations</h3>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">AI-Powered</Badge>
                </div>
                
                <div className="space-y-3">
                  {liveRecommendations.slice(0, 3).map((rec: any, index: number) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-700">{rec.title || `Recommendation ${index + 1}`}</h4>
                          <p className="text-sm text-slate-500">{rec.description || "Personalized suggestion based on your activity"}</p>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md text-sm font-medium"
                      >
                        Try Now
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Daily Challenge Card */}
            {stats && dailyChallenge && (
              <DailyChallenge challenge={{
                id: "daily-1",
                title: "AI-Enhanced Practice Session",
                description: "Complete an AI-guided roleplay scenario with real-time feedback.",
                points: 50,
                category: "roleplay",
                completed: false
              }} />
            )}
          </header>
          
          {/* Enhanced Practice Stats with Real-time Updates */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-slate-800">Live Performance Analytics</h2>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <i className="fas fa-circle text-green-500 text-xs mr-1 animate-pulse"></i>
                Real-time
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <StatsCard 
                  title="AI Roleplays" 
                  count={stats?.roleplays || 0} 
                  icon="fa-robot" 
                  color="primary" 
                  percentage={livePerformance?.roleplayGrowth || 60} 
                  isLoading={statsLoading}
                  subtitle={`+${livePerformance?.roleplayIncrease || 0} this week`}
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <StatsCard 
                  title="Smart Tests" 
                  count={stats?.tests || 0} 
                  icon="fa-brain" 
                  color="secondary" 
                  percentage={livePerformance?.testGrowth || 40} 
                  isLoading={statsLoading}
                  subtitle={`${livePerformance?.averageScore || 0}% avg score`}
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <StatsCard 
                  title="PIs Mastered" 
                  count={stats?.completedPIs || 0} 
                  total={stats?.totalPIs || 0} 
                  icon="fa-trophy" 
                  color="accent" 
                  percentage={stats?.totalPIs ? Math.round((stats.completedPIs / stats.totalPIs) * 100) : 0} 
                  isLoading={statsLoading}
                  subtitle={`${livePerformance?.masteryLevel || 'Beginner'} level`}
                />
              </motion.div>
            </div>
          </section>
          
          {/* Recent Activity & Continue Learning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-slate-800">AI-Enhanced Activity Feed</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Live Updates</Badge>
                  <a href="#" className="text-primary text-sm font-medium">View All</a>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-200">
                  {activitiesLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    activities.map((activity: any) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <ActivityItem activity={{
                          ...activity,
                          aiEnhanced: true,
                          confidenceScore: Math.floor(Math.random() * 30) + 70, // Mock AI confidence
                        }} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-rocket text-white text-xl"></i>
                      </div>
                      <p className="text-slate-500 mb-2">Ready to start your AI-powered journey?</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        Begin AI Practice
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-slate-800">AI Recommendations</h2>
                <a href="#" className="text-primary text-sm font-medium">See More</a>
              </div>
              
              <div className="space-y-4">
                {learningLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : learningItems && learningItems.length > 0 ? (
                  learningItems.map((item: any) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ContinueLearningCard item={{
                        ...item,
                        aiRecommended: true,
                        aiReason: "Based on your recent performance patterns",
                      }} />
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-lightbulb text-white"></i>
                    </div>
                    <p className="text-slate-500 mb-3">AI is analyzing your progress...</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-medium"
                    >
                      Get AI Suggestions
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Upgrade Plan Banner */}
          {user?.subscriptionTier !== "pro" && (
            <UpgradeBanner currentTier={user?.subscriptionTier || "standard"} />
          )}
          
          {/* Enhanced Footer */}
          <footer className="mt-12 border-t border-slate-200 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="relative w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-base">D</span>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    AI
                  </motion.div>
                </div>
                <span className="font-heading font-bold text-base text-slate-800">
                  DecA<span className="text-primary">(I)</span>de
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full ml-2">
                    AI-Powered
                  </span>
                </span>
              </div>
              
              <div className="text-center md:text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">© 2025 DecA(I)de. Powered by AI.</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Intelligence meets preparation. 🚀</div>
              </div>
            </div>
          </footer>
        </div>
      </main>
      
      {/* Break Timer Modal */}
      <AnimatePresence>
        {showBreakTimer && (
          <BreakTimer onClose={() => setShowBreakTimer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
