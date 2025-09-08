import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Brain, 
  Award, 
  Activity,
  BarChart3,
  Users,
  Zap,
  Trophy,
  Star,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Timer,
  Lightbulb
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Chart colors
const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981", 
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  indigo: "#6366F1"
};

export default function ComprehensiveAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch comprehensive user analytics data
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/comprehensive-stats", timeRange],
    enabled: !!user
  });

  const { data: performanceAnalytics, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/user/performance-analytics", timeRange],
    enabled: !!user
  });

  const { data: studyPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: ["/api/user/study-patterns", timeRange],
    enabled: !!user
  });

  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/user/category-breakdown"],
    enabled: !!user
  });

  const { data: learningInsights, isLoading: learningLoading } = useQuery({
    queryKey: ["/api/user/learning-insights"],
    enabled: !!user
  });

  const { data: personalizedRecommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/user/personalized-recommendations"],
    enabled: !!user
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatScore = (score: number): string => {
    return `${score.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-slate-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-slate-600";
  };

  if (statsLoading || performanceLoading || patternsLoading) {
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
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Comprehensive Analytics</h1>
            <p className="text-slate-600">Track your learning progress and performance insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Stats */}
        {userStats && userStats.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Study Time</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatTime(userStats.overview.totalStudyTime || 0)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {getTrendIcon(userStats.overview.improvement || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(userStats.overview.improvement || 0)}`}>
                    {(userStats.overview.improvement || 0) > 0 ? '+' : ''}{(userStats.overview.improvement || 0).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Test Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatScore(userStats.overview.averageTestScore || 0)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {getTrendIcon(userStats.overview.improvement || 0)}
                  <span className={`text-sm font-medium ${getTrendColor(userStats.overview.improvement || 0)}`}>
                    {(userStats.overview.improvement || 0) > 0 ? '+' : ''}{(userStats.overview.improvement || 0).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Consistency Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(userStats.overview.consistencyScore || 0).toFixed(0)}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2">
                  <Progress value={userStats.overview.consistencyScore || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Mastery Level</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {userStats.overview.masteryLevel || 'Novice'}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Learning Velocity: {(userStats.overview.learningVelocity || 0).toFixed(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="patterns">Study Patterns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Activity Overview */}
            {userStats?.trends?.dailyActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userStats.trends.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="studyTime" 
                        stackId="1"
                        stroke={COLORS.primary} 
                        fill={COLORS.primary} 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Category Performance */}
            {userStats?.trends?.categoryProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userStats.trends.categoryProgress.map((category: any) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm font-bold">{category.averageScore.toFixed(1)}%</span>
                        </div>
                        <Progress value={category.averageScore} className="h-2" />
                        <div className="text-xs text-slate-500">
                          {category.testCount} tests taken
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Trends */}
            {performanceAnalytics?.scoreTrends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceAnalytics.scoreTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke={COLORS.primary} 
                        strokeWidth={2}
                        dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Category Performance */}
            {performanceAnalytics?.categoryPerformance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(performanceAnalytics.categoryPerformance).map(([category, data]: [string, any]) => ({
                      category,
                      averageScore: data.total / data.count,
                      testCount: data.count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            {/* Study Patterns */}
            {studyPatterns && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Study Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Session Length</span>
                        <span className="text-sm font-bold">{formatTime(studyPatterns.sessionTypes?.averageSessionLength || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Peak Study Hour</span>
                        <span className="text-sm font-bold">{studyPatterns.preferredTimes?.peakHour || 0}:00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Sessions</span>
                        <span className="text-sm font-bold">{studyPatterns.sessionTypes?.totalSessions || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Study Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Streak</span>
                        <span className="text-sm font-bold">{studyPatterns.studyStreaks?.currentStreak || 0} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Longest Streak</span>
                        <span className="text-sm font-bold">{studyPatterns.studyStreaks?.longestStreak || 0} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Learning Insights */}
            {userStats?.insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.insights.map((insight: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.type === 'positive' 
                            ? 'border-green-500 bg-green-50' 
                            : insight.type === 'suggestion'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-yellow-500 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {insight.type === 'positive' ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : insight.type === 'suggestion' ? (
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-semibold text-slate-800">{insight.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{insight.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {userStats?.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.recommendations.map((recommendation: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          recommendation.priority === 'high' 
                            ? 'border-red-200 bg-red-50' 
                            : recommendation.priority === 'medium'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                            {recommendation.priority}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-slate-800">{recommendation.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{recommendation.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}