import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { 
  IconBarChart, 
  IconUsers, 
  IconActivity, 
  IconBook, 
  IconArrowRight, 
  IconCheck,
  IconLightbulb
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useUIState } from '@/hooks/use-ui-state';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardNew() {
  const { user } = useAuth();
  const { themeMode } = useUIState();

  // Initialize animations on component mount
  useEffect(() => {
    // Refresh AOS animations for dynamic content
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);
  
  // Animation variants
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
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Define types for the data
  interface Stats {
    roleplayCount: number;
    testCount: number;
    completedPIs: number;
    totalPIs: number;
    writtenCount: number;
    piCount: number;
    streak: number;
    totalPoints: number;
  }
  
  interface Activity {
    id: string;
    type: "roleplay" | "test" | "pi" | "written";
    title: string;
    description: string;
    score?: number;
    points?: number;
    date: string;
  }
  
  interface LearningItem {
    id: string;
    type: "roleplay" | "written" | "pi" | "test";
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
  const { data: dailyChallenge, isLoading: challengeLoading } = useQuery<Challenge>({
    queryKey: ["/api/daily-challenge"],
    enabled: !!user
  });

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle={
          <span className="flex items-center gap-2">
            {user?.username ? (
              <>
                <span>Welcome back, <span className="font-semibold text-primary">{user.username}</span>!</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                  {user?.subscriptionTier ? (
                    <>
                      {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan
                      <span className="ml-1 inline-flex">
                        {(() => {
                          const tier = user.subscriptionTier || 'standard';
                          const activeStars = tier.toLowerCase() === 'premium' || tier.toLowerCase() === 'pro' 
                            ? 5 
                            : tier.toLowerCase() === 'plus' 
                              ? 3 
                              : 2;
                          
                          return Array(activeStars).fill(0).map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ));
                        })()}
                      </span>
                    </>
                  ) : 'Standard Plan'}
                </span>
              </>
            ) : (
              "Welcome to DECA preparation made easy"
            )}
          </span>
        }
        actions={
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
            <span>New Practice</span>
            <IconArrowRight className="h-4 w-4" />
          </button>
        }
      />

      {/* Daily challenge */}
      {!challengeLoading && dailyChallenge && (
        <motion.div 
          className="mb-8 border rounded-xl overflow-hidden shadow-sm bg-card"
          variants={itemVariants}
          data-aos="fade-up"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <IconLightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Today's Challenge</span>
                </h3>
                <p className="mt-1 text-muted-foreground">{dailyChallenge.description}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {dailyChallenge.points} points
                </div>
                
                <button 
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    dailyChallenge.completed 
                      ? "bg-green-100 text-green-700 cursor-default flex items-center gap-1"
                      : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  )}
                  disabled={dailyChallenge.completed}
                >
                  {dailyChallenge.completed ? (
                    <>
                      <IconCheck className="h-4 w-4" />
                      <span>Completed</span>
                    </>
                  ) : (
                    "Start Challenge"
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-1.5 bg-primary/10 overflow-hidden w-full">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: dailyChallenge.completed ? '100%' : '10%' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Stats Section */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Your Practice Stats</h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Roleplays Completed"
              value={stats?.roleplayCount || 0}
              change={stats?.roleplayCount ? { value: 12, direction: 'up', label: 'vs. last week' } : undefined}
              icon={<IconUsers className="h-4 w-4" />}
              accent="primary"
              loading={statsLoading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="Practice Tests"
              value={stats?.testCount || 0}
              change={stats?.testCount ? { value: 5, direction: 'up', label: 'vs. last week' } : undefined}
              icon={<IconBarChart className="h-4 w-4" />}
              accent="info"
              loading={statsLoading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="PIs Mastered"
              value={`${stats?.completedPIs || 0}/${stats?.totalPIs || 0}`}
              change={
                stats?.totalPIs 
                  ? { 
                      value: Math.round((stats.completedPIs / stats.totalPIs) * 100), 
                      direction: 'up', 
                      label: 'completion' 
                    } 
                  : undefined
              }
              icon={<IconActivity className="h-4 w-4" />}
              accent="success"
              loading={statsLoading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="Current Streak"
              value={stats?.streak || 0}
              change={stats?.streak ? { value: 20, direction: 'up', label: 'this month' } : undefined}
              icon={<IconBook className="h-4 w-4" />}
              accent="warning"
              loading={statsLoading}
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Progress */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Continue Learning</h2>
              <a href="/learning" className="text-sm font-medium text-primary hover:underline flex items-center">
                View all
                <IconArrowRight className="ml-1 h-3 w-3" />
              </a>
            </div>
            
            {learningLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : learningItems && learningItems.length > 0 ? (
              <div className="space-y-4 card-scroll max-h-96 overflow-y-auto pr-2">
                {learningItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full mr-2",
                            item.type === 'roleplay' && "bg-blue-100 text-blue-700",
                            item.type === 'written' && "bg-purple-100 text-purple-700",
                            item.type === 'pi' && "bg-green-100 text-green-700",
                            item.type === 'test' && "bg-amber-100 text-amber-700",
                          )}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">{item.category}</span>
                        </div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.description}</p>
                      </div>
                      
                      <button className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition-colors">
                        Continue
                      </button>
                    </div>
                    
                    {item.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{item.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <a href="/learning" className="block text-center py-3 border rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                  View all learning materials
                </a>
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-card text-center">
                <p className="text-muted-foreground mb-4">No learning items in progress</p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                  Start Learning
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <a href="/history" className="text-sm font-medium text-primary hover:underline flex items-center">
                View all
                <IconArrowRight className="ml-1 h-3 w-3" />
              </a>
            </div>
            
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3 card-scroll max-h-80 overflow-y-auto pr-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        activity.type === 'roleplay' && "bg-blue-100 text-blue-700",
                        activity.type === 'test' && "bg-amber-100 text-amber-700",
                        activity.type === 'pi' && "bg-green-100 text-green-700",
                        activity.type === 'written' && "bg-purple-100 text-purple-700",
                      )}>
                        {activity.type === 'roleplay' && <IconUsers className="h-5 w-5" />}
                        {activity.type === 'test' && <IconBarChart className="h-5 w-5" />}
                        {activity.type === 'pi' && <IconActivity className="h-5 w-5" />}
                        {activity.type === 'written' && <IconBook className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">{activity.title}</p>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1">
                          {activity.score !== undefined && (
                            <span className="text-sm font-medium mr-3">
                              Score: {activity.score}%
                            </span>
                          )}
                          
                          {activity.points !== undefined && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              +{activity.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-card text-center h-[300px] flex flex-col items-center justify-center">
                <div className="mb-3 text-muted-foreground">
                  <IconActivity className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No activity yet</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Complete your first practice activity to see your progress here</p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                  Start Practicing
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}