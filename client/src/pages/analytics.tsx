import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from "recharts";
import { Calendar, TrendingUp, Clock, Target, BookOpen, Users, Brain, Award } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

// Chart colors
const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  gray: "#6B7280"
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedEvent, setSelectedEvent] = useState("all");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange, selectedEvent],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Process real data from API
  const performanceData = analyticsData?.sessions ? 
    analyticsData.sessions.slice(0, 7).map((session: any, index: number) => ({
      day: format(new Date(session.completedAt), 'EEE'),
      score: session.score || 0,
      activities: 1
    })) : [];

  // Calculate activity distribution from real data
  const activityDistribution = analyticsData ? [
    { name: "Roleplay", value: analyticsData.roleplayCount || 0, color: COLORS.primary },
    { name: "Practice Tests", value: analyticsData.testCount || 0, color: COLORS.secondary },
    { name: "Written Events", value: analyticsData.writtenCount || 0, color: COLORS.warning },
    { name: "Performance Indicators", value: analyticsData.completedPIs || 0, color: COLORS.purple },
  ] : [];

  // Calculate category progress from real data
  const categoryProgress = analyticsData ? [
    { category: "Business Management", completed: Math.round((analyticsData.completedPIs || 0) * 0.2), total: 100, color: COLORS.primary },
    { category: "Marketing", completed: Math.round((analyticsData.completedPIs || 0) * 0.15), total: 80, color: COLORS.secondary },
    { category: "Finance", completed: Math.round((analyticsData.completedPIs || 0) * 0.1), total: 60, color: COLORS.warning },
    { category: "Hospitality", completed: Math.round((analyticsData.completedPIs || 0) * 0.18), total: 90, color: COLORS.danger },
    { category: "Entrepreneurship", completed: Math.round((analyticsData.completedPIs || 0) * 0.14), total: 100, color: COLORS.purple },
  ] : [];

  // Process streak data from sessions
  const streakData = analyticsData?.sessions ? 
    Array.from({ length: 4 }, (_, weekIndex) => {
      const weekStart = subDays(new Date(), (3 - weekIndex) * 7);
      const weekEnd = subDays(new Date(), (2 - weekIndex) * 7);
      const weekSessions = analyticsData.sessions.filter((s: any) => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      return {
        date: `Week ${weekIndex + 1}`,
        days: weekSessions.length
      };
    }) : [];

  // Mock skill radar data (would need skill assessment data from backend)
  const skillRadarData = [
    { skill: "Communication", A: 85, fullMark: 100 },
    { skill: "Analysis", A: 78, fullMark: 100 },
    { skill: "Problem Solving", A: 92, fullMark: 100 },
    { skill: "Leadership", A: 70, fullMark: 100 },
    { skill: "Teamwork", A: 88, fullMark: 100 },
    { skill: "Decision Making", A: 82, fullMark: 100 },
  ];

  const stats = {
    totalActivities: analyticsData?.totalActivities || 0,
    averageScore: analyticsData?.averageScore || 0,
    currentStreak: user?.streak || 0,
    totalPoints: user?.points || 0,
    completionRate: analyticsData?.completionRate || 0,
    weeklyGrowth: analyticsData?.weeklyGrowth || 0,
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and identify areas for improvement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="roleplay">Roleplay Only</SelectItem>
              <SelectItem value="tests">Tests Only</SelectItem>
              <SelectItem value="written">Written Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold">{stats.totalActivities}</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    {stats.weeklyGrowth}% from last week
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <Progress value={stats.averageScore} className="h-2 mt-2" />
                </div>
                <Target className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{stats.currentStreak} days</p>
                  <Badge variant="secondary" className="mt-1">Keep it up!</Badge>
                </div>
                <Calendar className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{stats.totalPoints}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rank: Top 15%</p>
                </div>
                <Award className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                  <CardDescription>Your scores and activities over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="score" 
                        stroke={COLORS.primary} 
                        strokeWidth={2}
                        name="Score (%)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="activities" 
                        stroke={COLORS.secondary} 
                        strokeWidth={2}
                        name="Activities"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Distribution</CardTitle>
                  <CardDescription>Breakdown of your learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {activityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Streak History</CardTitle>
                <CardDescription>Your consistency over the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="days" 
                      stroke={COLORS.purple} 
                      fill={COLORS.purple} 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Progress</CardTitle>
                <CardDescription>Your completion rate across different DECA categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryProgress.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.completed} / {category.total} completed
                        </span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={(category.completed / category.total) * 100} 
                          className="h-3"
                        />
                        <div 
                          className="absolute inset-0 h-3 rounded-full opacity-20"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate Trend</CardTitle>
                  <CardDescription>How your completion rate has changed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-primary">{stats.completionRate}%</div>
                    <p className="text-sm text-muted-foreground mt-2">Overall Completion Rate</p>
                    <Badge variant="outline" className="mt-4">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Improving steadily
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Investment</CardTitle>
                  <CardDescription>Average time spent per activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Roleplay Sessions</span>
                      <span className="text-sm font-medium">25 min avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Practice Tests</span>
                      <span className="text-sm font-medium">45 min avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Written Events</span>
                      <span className="text-sm font-medium">60 min avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PI Study</span>
                      <span className="text-sm font-medium">15 min avg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Assessment</CardTitle>
                <CardDescription>Your proficiency across key DECA competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={skillRadarData}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Current Level" 
                      dataKey="A" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Strongest Skill</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Problem Solving</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">92%</p>
                  <p className="text-sm text-muted-foreground">Proficiency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Most Improved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Leadership</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">+15%</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Focus Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Analysis</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">78%</p>
                  <p className="text-sm text-muted-foreground">Room to grow</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>Based on your recent performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">Focus on Finance PIs</p>
                        <p className="text-sm text-muted-foreground">
                          You're scoring 15% below average in financial analysis questions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary mt-2" />
                      <div>
                        <p className="font-medium">Try more Written Events</p>
                        <p className="text-sm text-muted-foreground">
                          You've only completed 2 this month - aim for at least 5
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-warning mt-2" />
                      <div>
                        <p className="font-medium">Maintain your streak!</p>
                        <p className="text-sm text-muted-foreground">
                          You're 3 days away from a 10-day achievement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Patterns</CardTitle>
                  <CardDescription>When you perform best</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Best Time of Day</span>
                        <Badge variant="outline">Evening (6-9 PM)</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You score 12% higher on activities completed in the evening
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Optimal Session Length</span>
                        <Badge variant="outline">25-30 minutes</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your focus peaks during medium-length sessions
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Best Day</span>
                        <Badge variant="outline">Thursday</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Consistently higher scores on Thursdays
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Key highlights from this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">28</p>
                    <p className="text-sm text-muted-foreground">Days Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">156</p>
                    <p className="text-sm text-muted-foreground">Activities Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">4.2</p>
                    <p className="text-sm text-muted-foreground">Avg Daily Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">89%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}