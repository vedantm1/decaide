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

export default function Dashboard() {
  const { user } = useAuth();
  const { triggerAnimation, showAchievement } = useMicroInteractions();
  const { toast } = useToast();
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);
  const [trialHoursLeft, setTrialHoursLeft] = useState(0);
  
  // Calculate remaining trial time
  useEffect(() => {
    if (user && user.subscriptionTier === 'free') {
      // Check if the tutorial has been completed
      const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
      // Check if this is a new user
      const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
      
      // Check if trial start date exists in localStorage, if not, set it
      const trialStartDate = localStorage.getItem('trialStartDate');
      if (!trialStartDate) {
        localStorage.setItem('trialStartDate', new Date().toISOString());
        // Only show banner if tutorial is completed or not a new user
        setShowTrialBanner(tutorialCompleted || !isFirstTimeUser);
        setTrialDaysLeft(3);
        setTrialHoursLeft(0);
      } else {
        // Calculate time elapsed since trial started
        const startDate = new Date(trialStartDate);
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate.getTime() - startDate.getTime());
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(hoursDiff / 24);
        
        // Calculate days and hours left
        let daysLeft = 3 - daysDiff;
        let hoursLeft = 24 - (hoursDiff % 24);
        
        if (daysLeft <= 0 && hoursLeft <= 0) {
          // Trial has expired
          setTrialDaysLeft(0);
          setTrialHoursLeft(0);
          
          // Show upgrade prompt if this is first visit after expiry
          if (!localStorage.getItem('trialExpiredPromptShown')) {
            localStorage.setItem('trialExpiredPromptShown', 'true');
            setTimeout(() => {
              triggerAnimation('fireworks', "Your tropical getaway has ended! Upgrade to keep making waves at your DECA competitions! 🏄‍♂️");
              showAchievement("Trial Expired", "Upgrade to keep preparing for DECA competitions!", 0);
            }, 2000);
          }
        } else if (daysLeft <= 0) {
          // Less than a day left
          setTrialDaysLeft(0);
          setTrialHoursLeft(hoursLeft);
          
          // Show "less than a day left" notification if not shown already
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
          
          // Remind user when 1 day left
          if (daysLeft === 1 && !localStorage.getItem('trialOneDayLeftPromptShown')) {
            localStorage.setItem('trialOneDayLeftPromptShown', 'true');
            setTimeout(() => {
              triggerAnimation("circles", "Just 1 day left in your tropical trial! Don't let your DECA preparations wash away!");
              showAchievement("Trial Ending Soon", "Only 1 day left in your free trial!", 0);
            }, 1500);
          }
        }
        
        // For first-time users, only show banner after tutorial is completed
        const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
        const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
        
        // Only show the banner if tutorial completed or this isn't first time user
        setShowTrialBanner(tutorialCompleted || !isFirstTimeUser);
      }
    }
  }, [user]);
  
  // Trigger welcome animation only on first login
  useEffect(() => {
    // Check if the user just logged in (flag set in auth hook)
    const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
    // Check if the tutorial has been completed
    const tutorialCompleted = localStorage.getItem('diegoTutorialCompleted') === 'true';
    
    if (justLoggedIn && user) {
      // Only show welcome messages if tutorial is already completed or this isn't first time
      const isFirstTimeUser = localStorage.getItem('isFirstTimeUser') !== 'false';
      
      // Delay longer if this is a first-time user to allow tutorial to start first
      const delayTime = isFirstTimeUser ? 10000 : 800;
      
      setTimeout(() => {
        triggerAnimation('stars', 'Welcome to DecA(I)de!');
        
        if (user.subscriptionTier === 'free') {
          // Welcome new trial user with a tropical theme - show only if tutorial completed or not first time
          if (tutorialCompleted || !isFirstTimeUser) {
            triggerAnimation('confetti');
            showAchievement("Welcome!", `You've started your 3-day free trial. Let's get started with DECA preparation!`, 50);
          }
        } else {
          showAchievement("Welcome Back!", `Ready to practice for your next DECA competition?`, 10);
        }
        
        // Remove the login flag so animation doesn't show again until next login
        sessionStorage.removeItem('justLoggedIn');
      }, delayTime);
    }
  }, [triggerAnimation, showAchievement, user]);
  
  // Set a timer to show the break dialog after 5 minutes for demo purposes
  // (would be 25 minutes in production)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBreakTimer(true);
      toast({
        title: "Break Time",
        description: "Taking regular breaks helps improve retention and focus!",
      });
    }, 5 * 60 * 1000); // 5 minutes for demo purposes
    
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
          {/* Dashboard Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                  Welcome back, <span className="text-primary font-medium">{user?.username || 'User'}</span>! Ready to practice for DECA?
                </p>
              </div>
              
              {/* Practice Quick Actions */}
              <div className="hidden md:flex items-center gap-3">
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition">
                  New Practice
                </button>
                {user?.subscriptionTier === "standard" && (
                  <a href="/pricing" className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition flex items-center gap-1">
                    <i className="fas fa-arrow-circle-up text-white"></i>
                    <span>Upgrade</span>
                  </a>
                )}
                <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                  <i className="fas fa-bell text-slate-400"></i>
                </div>
              </div>
            </div>
            
            {/* Free Trial Banner - Tropical Theme */}
            {showTrialBanner && user?.subscriptionTier === 'free' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl overflow-hidden shadow-lg border border-blue-300"
              >
                <div className="relative p-5">
                  {/* Palm tree decoration */}
                  <div className="absolute -top-5 -right-5 w-32 h-32 opacity-10">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50,10 C45,25 60,30 55,40 C50,50 60,60 50,70 C40,60 50,50 45,40 C40,30 55,25 50,10 Z" fill="white"/>
                      <rect x="48" y="70" width="4" height="30" fill="white"/>
                    </svg>
                  </div>
                  
                  {/* Wave decoration */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">🏝️</span> Your Tropical Trial Experience
                      </h3>
                      <p className="text-blue-50 mt-1 max-w-xl">
                        Enjoy full access to all DecA(I)de features for {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} 
                        {trialHoursLeft > 0 && trialDaysLeft === 0 ? ` and ${trialHoursLeft} hour${trialHoursLeft !== 1 ? 's' : ''}` : ''}.
                        {trialDaysLeft === 0 && trialHoursLeft <= 5 ? ' Hurry, your trial is almost over!' : ' Dive into all our features!'}
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
                      
                      <a 
                        href="/pricing" 
                        className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <span className="mr-2">🌊</span>
                        Upgrade Now
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Daily Challenge Card */}
            {stats && dailyChallenge && (
              <DailyChallenge challenge={{
                id: "daily-1",
                title: "Practice a Roleplay Scenario",
                description: "Complete a practice roleplay scenario for your event type.",
                points: 25,
                category: "roleplay",
                completed: false
              }} />
            )}
          </header>
          
          {/* Practice Stats */}
          <section className="mb-8">
            <h2 className="text-lg font-heading font-bold text-slate-800 mb-4">Your Practice Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard 
                title="Roleplays" 
                count={stats?.roleplays || 0} 
                icon="fa-people-arrows" 
                color="primary" 
                percentage={60} 
                isLoading={statsLoading} 
              />
              <StatsCard 
                title="Practice Tests" 
                count={stats?.tests || 0} 
                icon="fa-clipboard-check" 
                color="secondary" 
                percentage={40} 
                isLoading={statsLoading} 
              />
              <StatsCard 
                title="PIs Mastered" 
                count={stats?.completedPIs || 0} 
                total={stats?.totalPIs || 0} 
                icon="fa-bullseye" 
                color="accent" 
                percentage={stats?.totalPIs ? Math.round((stats.completedPIs / stats.totalPIs) * 100) : 0} 
                isLoading={statsLoading} 
              />
            </div>
          </section>
          
          {/* Recent Activity & Continue Learning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-slate-800">Recent Activity</h2>
                <a href="#" className="text-primary text-sm font-medium">View All</a>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-200">
                  {activitiesLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    activities.map((activity: any) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-slate-500">No recent activities. Start practicing!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-slate-800">Continue Learning</h2>
                <a href="#" className="text-primary text-sm font-medium">See More</a>
              </div>
              
              <div className="space-y-4">
                {learningLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : learningItems && learningItems.length > 0 ? (
                  learningItems.map((item: any) => (
                    <ContinueLearningCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500">No items to continue. Start something new!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Upgrade Plan Banner */}
          {user?.subscriptionTier !== "pro" && (
            <UpgradeBanner currentTier={user?.subscriptionTier || "standard"} />
          )}
          
          {/* Footer */}
          <footer className="mt-12 border-t border-slate-200 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-base">D</span>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    AI
                  </span>
                </div>
                <span className="font-heading font-bold text-base text-slate-800">DecA<span className="text-primary">(I)</span>de</span>
              </div>
              
              <div className="text-center md:text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">© 2025 DecA(I)de. All rights reserved.</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Who says there is no I in team?</div>
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
