import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { SUBSCRIPTION_LIMITS } from "@shared/schema";

export default function MyProgressPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query to fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user
  });
  
  // Query to fetch user activities/progress
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/user/activities"],
    enabled: !!user
  });
  
  // Daily streak data (would connect to actual API in production)
  const [streakDays, setStreakDays] = useState<number>(user?.streak || 0);
  
  // Subscription limits
  const subscriptionTier = user?.subscriptionTier || "standard";
  const limits = SUBSCRIPTION_LIMITS[subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS];
  
  // Mock data for charts (would be replaced by actual API data in production)
  const activityData = [
    { name: 'Mon', roleplays: 2, tests: 1, pis: 3 },
    { name: 'Tue', roleplays: 1, tests: 2, pis: 5 },
    { name: 'Wed', roleplays: 3, tests: 0, pis: 2 },
    { name: 'Thu', roleplays: 0, tests: 1, pis: 4 },
    { name: 'Fri', roleplays: 2, tests: 3, pis: 1 },
    { name: 'Sat', roleplays: 1, tests: 0, pis: 3 },
    { name: 'Sun', roleplays: 0, tests: 0, pis: 0 },
  ];
  
  const performanceData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: 82 },
    { name: 'Week 6', score: 89 },
  ];
  
  // Calculate usage percentages
  const calculateUsage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  return (
    <MainLayout>
      <PageHeader
        title="My Progress"
        subtitle="Track your DECA preparation journey and performance"
      />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Study Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xl">
                      {streakDays}
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-foreground">{streakDays} days</p>
                      <p className="text-sm text-muted-foreground">Current streak</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full ${i < streakDays % 7 ? 'bg-primary' : 'bg-muted'}`}
                    ></div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{user?.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Career points</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Level progress</span>
                    <span className="text-foreground font-medium">
                      {user?.points ? user.points % 100 : 0}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: `${user?.points ? user.points % 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Level {Math.floor((user?.points || 0) / 100) + 1}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {statsLoading ? "..." : stats && 'completedPIs' in stats && 'totalPIs' in stats ? 
                        `${Math.round((stats.completedPIs / stats.totalPIs) * 100)}%` : "0%"}
                    </p>
                    <p className="text-sm text-muted-foreground">Tasks completed</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Roleplays</p>
                    <p className="text-lg font-semibold">{stats && 'roleplays' in stats ? stats.roleplays : 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tests</p>
                    <p className="text-lg font-semibold">{stats && 'tests' in stats ? stats.tests : 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PIs</p>
                    <p className="text-lg font-semibold">
                      {stats && 'completedPIs' in stats && 'totalPIs' in stats ? 
                        `${stats.completedPIs}/${stats.totalPIs}` : "0/0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Score</p>
                    <p className="text-lg font-semibold">82%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity Chart */}
          <Card className="mb-8 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="roleplays" name="Roleplays" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="tests" name="Tests" stackId="a" fill="hsl(var(--secondary))" />
                    <Bar dataKey="pis" name="PIs" stackId="a" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activities */}
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activities && Array.isArray(activities) && activities.length > 0 ? (
                <div className="divide-y divide-border">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1
                          ${activity.type === 'roleplay' ? 'bg-primary/10 text-primary' : 
                            activity.type === 'test' ? 'bg-blue-100 text-blue-600' :
                            'bg-accent/10 text-accent'}`}>
                          <i className={`fas ${
                            activity.type === 'roleplay' ? 'fa-people-arrows' : 
                            activity.type === 'test' ? 'fa-clipboard-list' :
                            'fa-star'}`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-foreground font-medium">{activity.title}</h4>
                          <p className="text-muted-foreground text-sm mt-1">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {activity.score && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                Score: {activity.score}%
                              </span>
                            )}
                            {activity.points && (
                              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded font-medium">
                                +{activity.points} Points
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No activities recorded yet. Start practicing!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          {/* Performance Trends */}
          <Card className="mb-8 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      name="Average Score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Skill Breakdown */}
          <Card className="mb-8 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Skill Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">Business Knowledge</span>
                    <span className="text-sm font-medium text-foreground/80">85%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">Presentation Skills</span>
                    <span className="text-sm font-medium text-foreground/80">78%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">Critical Thinking</span>
                    <span className="text-sm font-medium text-foreground/80">92%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">Test Performance</span>
                    <span className="text-sm font-medium text-foreground/80">81%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "81%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">Performance Indicators</span>
                    <span className="text-sm font-medium text-foreground/80">65%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Areas for Improvement */}
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recommended Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background/80 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fas fa-bullseye text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Performance Indicators</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Focus on mastering more performance indicators in the Financial Analysis category.
                      </p>
                      <button className="mt-2 text-sm font-medium text-primary hover:underline">
                        Practice Now →
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-background/80 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fas fa-comment text-secondary"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Presentation Structure</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Work on improving your roleplay presentation structure and closing techniques.
                      </p>
                      <button className="mt-2 text-sm font-medium text-secondary hover:underline">
                        View Guide →
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-background/80 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="fas fa-brain text-accent"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Economics Knowledge</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your test results show opportunities to strengthen economics principles.
                      </p>
                      <button className="mt-2 text-sm font-medium text-accent hover:underline">
                        Take Practice Test →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          {/* Current Subscription */}
          <Card className="mb-8 bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < limits.stars ? "text-accent" : "text-muted-foreground"}>★</span>
                    ))}
                  </div>
                  <span className="ml-2 font-medium text-foreground capitalize">{subscriptionTier} Plan</span>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Monthly Price:</span> 
                    <span className="ml-1 font-medium text-foreground">${limits.price}</span>
                  </div>
                  <button className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded">
                    {subscriptionTier === "premium" ? "Manage Subscription" : "Upgrade"}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Usage This Month</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Roleplay Generations</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats && 'roleplays' in stats ? stats.roleplays : 0}/{limits.roleplays === -1 ? "∞" : limits.roleplays}
                        </span>
                      </div>
                      {limits.roleplays !== -1 && (
                        <div className="w-full h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${calculateUsage(stats && 'roleplays' in stats ? stats.roleplays : 0, limits.roleplays)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Test Generations</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats && 'tests' in stats ? stats.tests : 0}/{limits.tests === -1 ? "∞" : limits.tests}
                        </span>
                      </div>
                      {limits.tests !== -1 && (
                        <div className="w-full h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${calculateUsage(stats && 'tests' in stats ? stats.tests : 0, limits.tests)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">PI Explanations</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats && 'completedPIs' in stats ? stats.completedPIs : 0}/{limits.piExplanations === -1 ? "∞" : limits.piExplanations}
                        </span>
                      </div>
                      {limits.piExplanations !== -1 && (
                        <div className="w-full h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${calculateUsage(Number(stats && 'completedPIs' in stats ? stats.completedPIs : 0), limits.piExplanations)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-4">Compare Plans</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-primary/10 flex items-center justify-center rounded-full mr-2">
                          <span className="text-xs text-primary">★</span>
                        </div>
                        <h4 className="font-medium text-foreground">Standard</h4>
                      </div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">15 roleplay scenarios/month</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">15 monthly test attempts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Basic PI explanations</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-primary rounded-lg p-4 relative">
                      <div className="absolute -top-3 right-4 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Popular</div>
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-primary/10 flex items-center justify-center rounded-full mr-2">
                          <span className="text-xs text-primary">★★★</span>
                        </div>
                        <h4 className="font-medium text-foreground">Plus</h4>
                      </div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">30 roleplay scenarios/month</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">30 monthly test attempts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Advanced PI explanations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Performance analytics</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-primary/10 flex items-center justify-center rounded-full mr-2">
                          <span className="text-xs text-primary">★★★★★</span>
                        </div>
                        <h4 className="font-medium text-foreground">Pro</h4>
                      </div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Unlimited roleplay scenarios</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Unlimited monthly tests</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Premium PI explanations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">Advanced analytics</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary text-xs mr-1.5 mt-0.5">✓</span>
                          <span className="text-muted-foreground">PDF report generation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}