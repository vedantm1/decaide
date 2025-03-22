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
  const { triggerAnimation, showMascot } = useMicroInteractions();
  const { toast } = useToast();
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  
  // Trigger welcome animation on first render
  useEffect(() => {
    if (showWelcomeAnimation) {
      // Delay slightly to ensure the animation is seen
      setTimeout(() => {
        triggerAnimation('stars', 'Welcome back!');
        showMascot(`Hey ${user?.username || 'there'}! Ready to practice for DECA today?`, 'bottom-right');
        setShowWelcomeAnimation(false);
      }, 800);
    }
  }, [triggerAnimation, showMascot, user, showWelcomeAnimation]);
  
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
  
  // User stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user
  });
  
  // Recent activities query
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/user/activities"],
    enabled: !!user
  });
  
  // Continue learning items
  const { data: learningItems, isLoading: learningLoading } = useQuery({
    queryKey: ["/api/user/learning"],
    enabled: !!user
  });
  
  // Daily challenge query
  const { data: dailyChallenge } = useQuery({
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
                <p className="text-slate-500 mt-1">Welcome back, {user?.username}! Ready to practice for DECA?</p>
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
            
            {/* Daily Challenge Card */}
            {dailyChallenge && (
              <DailyChallenge challenge={dailyChallenge} />
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
                <div className="text-sm text-slate-500">© 2023 DecA(I)de. All rights reserved.</div>
                <div className="text-xs text-slate-400 mt-1">Who says there is no I in team?</div>
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
