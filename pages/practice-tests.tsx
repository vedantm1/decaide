import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, ArrowRight, RotateCcw, Brain, Settings, BookOpen, Loader2, Target, Lightbulb, TrendingUp, AlertTriangle, History, Calendar, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { getClusterFromEvent } from "@shared/deca-utils";
import { usePopupManager } from "@/components/popups/popup-manager";
import DecaLoadingScreen from "@/components/loading/deca-loading-screen";

// Form schema for AI test generation
const testSchema = z.object({
  cluster: z.string().min(1, "Please select a cluster"),
  level: z.string().min(1, "Please select a level"),
  questionCount: z.number().min(10).max(100),
});

type TestFormValues = z.infer<typeof testSchema>;

// DECA Clusters (exact names from your requirements)
const DECA_CLUSTERS = [
  "Business Administration Core",
  "Business Management + Administration",
  "Entrepreneurship", 
  "Finance",
  "Hospitality + Tourism",
  "Marketing",
  "Personal Financial Literacy"
];

// Competition levels
const COMPETITION_LEVELS = [
  "District",
  "Association", 
  "ICDC"
];

// Quiz states for managing the interface
type QuizState = 'configuring' | 'loading' | 'active' | 'results' | 'review';

// Page modes for different test types
type PageMode = 'practice' | 'learning';

export default function PracticeTestsPage() {
  const { toast } = useToast();
  const { showTestCreationPopup, hidePopup } = usePopupManager();
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [pageMode, setPageMode] = useState<PageMode>('practice');
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [topicPracticeQuestions, setTopicPracticeQuestions] = useState<any[]>([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [topicMastery, setTopicMastery] = useState<any[]>([]);
  const [enhancedInsights, setEnhancedInsights] = useState<any[]>([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([]);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<string>('medium');
  const [activeTopic, setActiveTopic] = useState<string>('');
  
  // Inline quiz states - consolidated
  const [inlineQuizIndex, setInlineQuizIndex] = useState(0);
  const [inlineQuizAnswers, setInlineQuizAnswers] = useState<Record<number, string>>({});
  const [inlineQuizState, setInlineQuizState] = useState<'active' | 'results' | 'review'>('active');
  const [inlineQuizResults, setInlineQuizResults] = useState<any>(null);

  // Fetch user data to get selected event  
  const { data: user, error: userError } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });
  
  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('✅ User loaded in practice tests:', user);
    }
    if (userError) {
      console.error('❌ User error in practice tests:', userError);
    }
  }, [user, userError]);

  // Fetch test history and weak topics for learning
  const { data: history } = useQuery({
    queryKey: ['/api/test/history'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: topics } = useQuery({
    queryKey: ['/api/test/weak-topics'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Enhanced personalized learning queries
  const { data: topicMasteryData } = useQuery({
    queryKey: ['/api/user/topic-mastery'],
    enabled: !!user
  });

  const { data: enhancedInsightsData } = useQuery({
    queryKey: ['/api/user/enhanced-insights'],
    enabled: !!user
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ['/api/user/personalized-recommendations'],
    enabled: !!user
  });

  // Update state when data is fetched
  useEffect(() => {
    if (history && Array.isArray(history)) {
      setTestHistory(history);
    }
    if (topics && Array.isArray(topics)) {
      setWeakTopics(topics);
    }
  }, [history, topics]);
  
  // Get default cluster from user's selected event
  const getDefaultCluster = () => {
    if (user && user.selectedEvent) {
      const userCluster = getClusterFromEvent(user.selectedEvent);
      // Map the cluster names to match the dropdown options
      const clusterMapping: { [key: string]: string } = {
        'Business Administration Core': 'Business Administration Core',
        'Business Management & Administration': 'Business Management + Administration',
        'Entrepreneurship': 'Entrepreneurship',
        'Finance': 'Finance',
        'Hospitality & Tourism': 'Hospitality + Tourism',
        'Marketing': 'Marketing'
      };
      return clusterMapping[userCluster] || 'Marketing';
    }
    return 'Marketing';
  };

  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      cluster: getDefaultCluster(),
      level: "District",
      questionCount: 10,
    },
  });
  
  // Watch for form values
  const selectedCluster = watch("cluster");
  const selectedLevel = watch("level");
  const questionCount = watch("questionCount");
  
  // Personalized Learning Test Generation
  const handlePersonalizedTest = async (topic: string, questionCount: number = 8) => {
    // Show DECA loading screen
    setLoadingText(`Generating Your Personalized ${topic} Practice Test`);
    setShowLoadingScreen(true);
    
    setQuizState('loading');
    setError('');
    
    try {
      const quizResult = await apiRequest('/api/test/personalized', 'POST', {
        topic,
        questionCount,
        level: selectedLevel
      });
      
      setQuizData({
        ...quizResult,
        metadata: {
          ...quizResult.metadata,
          testType: 'learning_quiz',
          focusArea: topic
        }
      });
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizState('active');
      
      // Hide the loading screen
      setShowLoadingScreen(false);
      
      toast({
        title: "Personalized Learning Quiz Generated",
        description: `Ready to practice ${topic}! Focus on your weak areas.`,
      });

    } catch (error) {
      console.error('Error generating personalized test:', error);
      setError('Failed to generate personalized learning quiz. Please try again.');
      setQuizState('configuring');
      
      // Hide the loading screen
      setShowLoadingScreen(false);
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate personalized quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  // AI Test Generation Function
  const handleStartTest = async (data: TestFormValues) => {
    // Show DECA loading screen
    setLoadingText(`Generating Your AI Practice Test`);
    setShowLoadingScreen(true);
    
    setQuizState('loading');
    setError('');
    
    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster: data.cluster,
          level: data.level,
          questionCount: data.questionCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate test');
      }

      const quizData = await response.json();
      setQuizData(quizData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizState('active');
      
      // Hide the loading screen
      setShowLoadingScreen(false);
      
      toast({
        title: "Test Generated Successfully",
        description: `Your ${data.cluster} practice test with ${data.questionCount} questions is ready!`,
      });
    } catch (error: any) {
      console.error('Test generation error:', error);
      setError(error.message);
      setQuizState('configuring');
      
      // Hide the loading screen
      setShowLoadingScreen(false);
      
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Form submission handler
  const onSubmit = (data: TestFormValues) => {
    handleStartTest(data);
  };
  
  // Quiz navigation and interaction functions
  const handleOptionSelect = (questionId: number, selectedOption: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: selectedOption
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const showResults = () => {
    setQuizState('results');
  };

  // Function to submit and save test results to database
  const submitTestResults = async () => {
    if (!quizData || !user) return;

    try {
      const { correct, total, percentage } = calculateScore();
      
      // Use apiRequest which automatically handles authentication
      const result = await apiRequest('/api/test/result', 'POST', {
        cluster: selectedCluster,
        level: selectedLevel,
        questions: quizData.questions,
        userAnswers: userAnswers,
        score: percentage,
        timeSpent: 0
      });

      console.log('Test results saved successfully:', result);
      
      // Refresh learning data by refetching with authenticated requests
      try {
        const historyResponse = await apiRequest('/api/test/history');
        const topicsResponse = await apiRequest('/api/test/weak-topics');
        
        setTestHistory(historyResponse);
        setWeakTopics(topicsResponse);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
      }
      
      toast({
        title: "Test Completed!",
        description: `Your score of ${percentage}% has been saved to your learning history.`,
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      toast({
        title: "Test Completed",
        description: "Your test is complete, but there was an issue saving your results.",
        variant: "destructive"
      });
    }
  };

  // Function to view detailed test results
  const viewTestDetails = async (test: any) => {
    try {
      setSelectedTest(test);
      const results = await apiRequest(`/api/test/history/${test.id}/results`);
      setTestResults(results);
    } catch (error) {
      console.error('Error loading test details:', error);
      toast({
        title: "Error",
        description: "Failed to load test details.",
        variant: "destructive"
      });
    }
  };

  // Function to start topic practice - generate inline personalized quiz
  const startTopicPractice = async (topic: string) => {
    try {
      // Show explanation first
      setSelectedTopic({ topic });
      
      // Generate personalized quiz inline
      toast({
        title: "Generating Quiz",
        description: `Creating personalized questions for ${topic}...`,
      });
      
      const quizResult = await apiRequest('/api/test/personalized', 'POST', {
        topic,
        questionCount: 5, // Smaller quiz for inline experience
        level: 'District' // Use District level for personalized practice
      });
      
      // Set the quiz data for inline display
      setTopicPracticeQuestions(quizResult.questions || []);
      
      // Reset inline quiz state
      setInlineQuizIndex(0);
      setInlineQuizAnswers({});
      setInlineQuizState('active');
      setInlineQuizResults(null);
      
      toast({
        title: "Quiz Ready!",
        description: `5 personalized questions for ${topic} are ready below the tips.`,
      });
      
    } catch (error) {
      console.error('Error starting topic practice:', error);
      toast({
        title: "Error", 
        description: "Failed to generate personalized quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const restartQuiz = () => {
    setQuizData(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizState('configuring');
  };

  // Calculate score for results
  const calculateScore = () => {
    if (!quizData?.questions) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    let debugInfo: any[] = [];
    
    quizData.questions.forEach((question: any) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answer;
      const isCorrect = userAnswer === correctAnswer;
      
      debugInfo.push({
        questionId: question.id,
        userAnswer,
        correctAnswer,
        isCorrect,
        stem: question.stem.substring(0, 50) + "..."
      });
      
      if (isCorrect) {
        correct++;
      }
    });
    
    const total = quizData.questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    // Debug logging
    console.log("Scoring Debug Info:", {
      correct,
      total,
      percentage,
      userAnswers,
      answerKey: quizData.answer_key,
      detailedScoring: debugInfo
    });
    
    return { correct, total, percentage };
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Practice Tests
            </h2>
            <p className="text-muted-foreground">
              Generate unlimited practice tests with authentic DECA questions powered by AI
            </p>
            
            {/* Selected Event Display */}
            {user && user.selectedEvent && user.selectedCluster && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-primary">Your DECA Event</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {user.selectedEvent}
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {user.selectedCluster} Cluster
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Practice tests will focus on your selected cluster
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Mode Toggle */}
            <div className="flex justify-center">
              <div className="bg-muted p-1 rounded-lg inline-flex">
                <Button
                  variant={pageMode === 'practice' ? 'default' : 'ghost'}
                  onClick={() => setPageMode('practice')}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Practice Tests
                </Button>
                <Button
                  variant={pageMode === 'learning' ? 'default' : 'ghost'}
                  onClick={() => setPageMode('learning')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Learning ({testHistory.length} tests taken)
                </Button>
              </div>
            </div>
          </motion.div>

          {/* User Event Info Card */}
          {user && 'selectedEvent' in user && user.selectedEvent && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Selected Event
                </CardTitle>
                <CardDescription>
                  Tests will be generated based on your DECA event selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user && 'selectedEvent' in user ? user.selectedEvent : 'No event selected'}</p>
                    <p className="text-sm text-muted-foreground">
                      {user && 'selectedCluster' in user ? user.selectedCluster : 'No cluster'} Career Cluster
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Learning Mode - Test History and Analysis */}
          {pageMode === 'learning' && (
            <div className="space-y-6">
              {/* Test History Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Your Test History
                  </CardTitle>
                  <CardDescription>
                    Review all your past practice tests and see detailed results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testHistory.length > 0 ? (
                    <div className="space-y-4">
                      {testHistory.map((test, index) => (
                        <Card key={test.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h4 className="font-medium">{test.testTitle}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(test.completedAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {test.correctAnswers}/{test.totalQuestions}
                                  </span>
                                  <Badge className={
                                    test.score >= 80 ? 'bg-green-500 hover:bg-green-600' :
                                    test.score >= 60 ? 'bg-yellow-500 hover:bg-yellow-600' : 
                                    'bg-red-500 hover:bg-red-600'
                                  }>
                                    {test.score}%
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewTestDetails(test)}
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Tests Taken Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start taking practice tests to see your history and track progress
                      </p>
                      <Button onClick={() => setPageMode('practice')}>
                        <Brain className="h-4 w-4 mr-2" />
                        Take Your First Test
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weak Areas Analysis */}
              {weakTopics.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Areas for Improvement
                    </CardTitle>
                    <CardDescription>
                      Topics where you've gotten questions wrong - focus here to improve your scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {weakTopics.map((topicData, index) => (
                        <Card key={index} className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                                  {topicData.topic || 'General'}
                                </h4>
                                <Badge variant="outline" className="border-amber-300 text-amber-700">
                                  {Math.round((topicData.wrongCount / topicData.totalCount) * 100)}% wrong
                                </Badge>
                              </div>
                              <p className="text-sm text-amber-600 dark:text-amber-400">
                                {topicData.wrongCount} wrong out of {topicData.totalCount} questions
                              </p>
                              <Button
                                size="sm"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                onClick={() => startTopicPractice(topicData.topic)}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                Practice This Topic
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Test Details Modal - Full Review Interface */}
          {selectedTest && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Test Review: {selectedTest.testTitle}
                    </CardTitle>
                    <CardDescription>
                      Completed on {new Date(selectedTest.completedAt).toLocaleDateString()} • 
                      Score: {selectedTest.score}% ({selectedTest.correctAnswers}/{selectedTest.totalQuestions})
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTest(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-6">
                    {/* Overall Score Display */}
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {selectedTest.score}%
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {selectedTest.correctAnswers} out of {selectedTest.totalQuestions} correct
                      </p>
                    </div>

                    {/* Question by Question Review */}
                    {testResults.map((result, index) => {
                      const isCorrect = result.isCorrect;
                      
                      return (
                        <div key={result.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-full p-2 mt-1 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                              <span className={`font-semibold text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-lg font-medium leading-relaxed">
                                  {result.questionText}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{result.topic}</Badge>
                                  {isCorrect ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                      Correct
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                                      Incorrect
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className={`p-3 rounded-lg border ${isCorrect ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20' : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950/20'}`}>
                                  <p className={`font-medium text-sm mb-1 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>Your Answer:</p>
                                  <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.userAnswer}
                                  </p>
                                </div>
                                
                                {!isCorrect && (
                                  <div className="p-3 rounded-lg border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20">
                                    <p className="font-medium text-sm text-green-700 dark:text-green-300 mb-1">Correct Answer:</p>
                                    <p className="font-medium text-green-600">
                                      {result.correctAnswer}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="p-3 rounded-lg bg-gray-800 dark:bg-gray-900 border border-gray-700">
                                <p className="font-medium text-sm text-gray-300 mb-2">Explanation:</p>
                                <p className="text-sm text-gray-200 leading-relaxed">
                                  {result.explanation || `The correct answer demonstrates effective ${result.topic} principles, which is essential for business success.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading test details...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Topic Practice Modal */}
          {selectedTopic && (
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" />
                      Practice Topic: {selectedTopic.topic}
                    </CardTitle>
                    <CardDescription>
                      Focused practice questions to improve your understanding of this topic
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTopic.topic ? (
                  <div className="space-y-6">
                    {/* Topic Explanation */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                      <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-3">
                        About {selectedTopic.topic}
                      </h3>
                      <div className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        {(() => {
                          const getTopicContent = (topic: string) => {
                            const topicGuides = {
                              'Financial Analysis': {
                                intro: "I see that Financial Analysis questions have been challenging. That's very common! These questions require both math and interpretation, but with the right approach, you can turn them into easy points.",
                                explanation: "On a test, Financial Analysis questions are designed to see if you can quickly read a scenario or data table and make a precise calculation or a correct interpretation. Unlike a role-play where you tell a broad story, a test demands accuracy. You'll likely be given excerpts from financial statements (like an Income Statement or Balance Sheet) and be asked to do one of two things: 1) Calculate a specific metric (like profit margin or a key ratio), or 2) Interpret what a given financial figure means for the company's health.",
                                tips: [
                                  {
                                    title: "Create a \"Formula Dump\" Sheet.",
                                    content: "The second your test begins, use your scratch paper to write down the 5-7 key financial formulas you've memorized (e.g., Gross Profit Margin, Net Profit Margin, Current Ratio). Getting them out of your head and onto paper reduces mental load and prevents simple mistakes when you're under pressure."
                                  },
                                  {
                                    title: "Identify the Question's Goal First.",
                                    content: "Before you start calculating, read the question carefully and ask yourself: \"What is this question really asking for?\" Is it about profitability (margins), liquidity (ability to pay bills), or solvency (long-term stability)? Identifying the goal helps you immediately select the correct formula and ignore irrelevant numbers designed to be distractors."
                                  },
                                  {
                                    title: "Beware of Tricky Wording.",
                                    content: "Test questions often include extra information to confuse you. For example, a problem might give you data for Revenue, COGS, and Operating Expenses, but only ask for the Gross Profit Margin. Highlight the exact terms in the question to ensure you're pulling the right numbers for your calculation."
                                  }
                                ]
                              },
                              'Marketing': {
                                intro: "Marketing questions can seem broad, but they follow predictable patterns. Master the core concepts and you'll quickly identify what each question is really testing.",
                                explanation: "Marketing test questions focus on the 4 P's (Product, Price, Place, Promotion) and customer behavior. You'll encounter scenarios about market research, target audiences, pricing strategies, and promotional campaigns. The key is recognizing which marketing concept the question is targeting.",
                                tips: [
                                  {
                                    title: "Memorize the 4 P's Framework.",
                                    content: "Product (features, quality, design), Price (strategies, psychology), Place (distribution channels), and Promotion (advertising, sales promotion, PR). Most questions will test one of these areas specifically."
                                  },
                                  {
                                    title: "Identify the Target Market First.",
                                    content: "Before answering any marketing question, ask: \"Who is the customer?\" Age, income, lifestyle, and values all influence marketing decisions. The right answer often depends on understanding the target audience."
                                  },
                                  {
                                    title: "Look for Keywords.",
                                    content: "Words like 'brand awareness' point to promotion, 'market penetration' suggests pricing strategy, and 'distribution' indicates place. These keywords help you quickly categorize what the question is asking."
                                  }
                                ]
                              },
                              'Customer Relations': {
                                intro: "Customer Relations questions test your ability to handle real-world customer situations professionally and effectively.",
                                explanation: "These questions present customer service scenarios where you must choose the best response to complaints, inquiries, or problems. Success comes from understanding customer psychology and professional communication principles.",
                                tips: [
                                  {
                                    title: "Always Acknowledge First.",
                                    content: "Whether the customer is right or wrong, start by acknowledging their concern. Phrases like \"I understand your frustration\" or \"Thank you for bringing this to my attention\" show empathy before solving the problem."
                                  },
                                  {
                                    title: "Focus on Solutions, Not Blame.",
                                    content: "Never argue with customers or make excuses. Instead, immediately move to \"Here's what I can do to help.\" Even if the customer caused the problem, your job is to fix it professionally."
                                  },
                                  {
                                    title: "Know When to Escalate.",
                                    content: "If a customer demands something beyond your authority (refunds, policy exceptions), don't say \"I can't.\" Instead say \"Let me get my manager who can better assist you with that request.\""
                                  }
                                ]
                              },
                              'Economics': {
                                intro: "Economics questions test your understanding of basic economic principles like supply and demand, market structures, and business cycles.",
                                explanation: "These questions often present scenarios about price changes, market conditions, or economic indicators. You need to apply economic concepts to predict outcomes or explain business decisions in different economic environments.",
                                tips: [
                                  {
                                    title: "Master Supply and Demand Basics.",
                                    content: "When supply increases and demand stays the same, prices fall. When demand increases and supply stays the same, prices rise. This fundamental relationship explains most pricing scenarios you'll encounter."
                                  },
                                  {
                                    title: "Understand Market Types.",
                                    content: "Perfect competition (many sellers, identical products), monopoly (one seller), oligopoly (few large sellers). Each market type affects pricing power and business strategy differently."
                                  },
                                  {
                                    title: "Connect to Real Business Impact.",
                                    content: "Don't just memorize theory. Ask \"How would this economic change affect a business?\" Rising interest rates make borrowing expensive, inflation affects pricing strategies, recession changes consumer spending."
                                  }
                                ]
                              },
                              'Human Resources Management': {
                                intro: "HR questions focus on managing people effectively - from hiring and training to motivation and conflict resolution.",
                                explanation: "These questions test your knowledge of employment law, motivation theories, training methods, and performance management. You'll encounter scenarios about hiring decisions, employee problems, and workplace policies.",
                                tips: [
                                  {
                                    title: "Know Employment Law Basics.",
                                    content: "Understand what questions are illegal in interviews (age, marital status, religion), what constitutes discrimination, and basic workplace rights. Many questions test legal vs. illegal HR practices."
                                  },
                                  {
                                    title: "Apply Motivation Theories.",
                                    content: "Maslow's hierarchy (basic needs first), Herzberg's two-factor theory (hygiene vs. motivators), and McGregor's Theory X/Y. Match the right motivational approach to different employee situations."
                                  },
                                  {
                                    title: "Document Everything.",
                                    content: "In HR scenarios involving performance issues or conflicts, the correct answer often involves proper documentation. \"Put it in writing\" and \"follow company policy\" are usually good choices."
                                  }
                                ]
                              },
                              'Operations': {
                                intro: "Operations questions test your understanding of how businesses run efficiently - from supply chains to quality control to process improvement.",
                                explanation: "These questions cover production planning, inventory management, quality assurance, and workflow optimization. You'll analyze scenarios about manufacturing, service delivery, and operational efficiency.",
                                tips: [
                                  {
                                    title: "Think Systems, Not Tasks.",
                                    content: "Operations is about how all the pieces fit together. When one part of the operation changes, consider the ripple effects on other departments, suppliers, and customers."
                                  },
                                  {
                                    title: "Focus on Efficiency Metrics.",
                                    content: "Key measures include productivity (output per input), quality rates (defects per unit), and cycle time (how long processes take). Most operations questions ask you to improve one of these metrics."
                                  },
                                  {
                                    title: "Balance Cost with Quality.",
                                    content: "Rarely is the cheapest option the best choice in operations. Look for answers that optimize the balance between cost, quality, and speed rather than minimizing just one factor."
                                  }
                                ]
                              },
                              'Strategic Management': {
                                intro: "Strategic Management questions test your ability to think like a CEO - making long-term decisions that affect the entire organization.",
                                explanation: "These questions involve SWOT analysis, competitive strategy, market positioning, and strategic planning. You'll evaluate business situations and choose the best long-term direction for companies.",
                                tips: [
                                  {
                                    title: "Always Consider Competition.",
                                    content: "Strategic decisions happen in competitive markets. Ask: \"How will competitors respond to this strategy?\" and \"What competitive advantage does this create or protect?\""
                                  },
                                  {
                                    title: "Think Long-term Impact.",
                                    content: "Strategic questions often have options that look good short-term but hurt long-term (like cutting R&D to boost profits). Consider the 3-5 year implications of each choice."
                                  },
                                  {
                                    title: "Use SWOT Framework.",
                                    content: "Identify Strengths (internal advantages), Weaknesses (internal problems), Opportunities (external possibilities), and Threats (external challenges). Match strategies to leverage strengths and opportunities."
                                  }
                                ]
                              },
                              'Business Law': {
                                intro: "Business Law questions test your knowledge of legal concepts that affect business operations, from contracts to employment law to intellectual property.",
                                explanation: "These questions often present legal scenarios where you must identify violations, recommend proper procedures, or choose the legally compliant option. Focus on understanding basic business legal principles.",
                                tips: [
                                  {
                                    title: "Know Contract Essentials.",
                                    content: "Valid contracts need: offer, acceptance, consideration (exchange of value), legal purpose, and competent parties. If any element is missing, the contract may not be enforceable."
                                  },
                                  {
                                    title: "Understand Liability Types.",
                                    content: "Personal liability (individual responsibility), corporate liability (company responsibility), and limited liability (protection for owners). Different business structures offer different liability protection."
                                  },
                                  {
                                    title: "When in Doubt, Consult Legal.",
                                    content: "Many correct answers involve \"consult with legal counsel\" or \"follow company legal policies.\" Business law questions often test whether you know when to seek professional legal advice."
                                  }
                                ]
                              },
                              'Communication Skills': {
                                intro: "Communication questions test your ability to convey information clearly, listen effectively, and adapt your message to different audiences.",
                                explanation: "These questions cover verbal and written communication, presentation skills, and interpersonal communication. You'll encounter scenarios about meetings, emails, presentations, and difficult conversations.",
                                tips: [
                                  {
                                    title: "Consider Your Audience.",
                                    content: "Adjust your communication style based on who you're talking to. Technical details for engineers, financial summaries for executives, clear instructions for new employees. Match the message to the audience."
                                  },
                                  {
                                    title: "Listen First, Then Respond.",
                                    content: "In communication scenarios involving conflicts or misunderstandings, the correct answer often involves active listening - asking clarifying questions and confirming understanding before responding."
                                  },
                                  {
                                    title: "Choose the Right Channel.",
                                    content: "Email for documentation, phone for quick discussions, face-to-face for sensitive topics, presentations for large groups. Different messages require different communication methods."
                                  }
                                ]
                              },
                              'Information Management': {
                                intro: "Information Management questions test your understanding of how businesses collect, store, analyze, and use data to make better decisions.",
                                explanation: "These questions cover data security, information systems, database management, and analytics. You'll analyze scenarios about data collection methods, storage solutions, and information privacy.",
                                tips: [
                                  {
                                    title: "Data Security First.",
                                    content: "Always consider security implications. Customer data needs protection, financial information requires restricted access, and passwords should be strong. Security is usually the top priority in information management."
                                  },
                                  {
                                    title: "Quality Over Quantity.",
                                    content: "More data isn't always better. Focus on collecting accurate, relevant, and timely information rather than just gathering everything possible. Bad data leads to bad decisions."
                                  },
                                  {
                                    title: "Make Data Actionable.",
                                    content: "Information is only valuable if it leads to better decisions. Look for answers that connect data collection and analysis to specific business improvements or strategic insights."
                                  }
                                ]
                              }
                            };

                            const content = topicGuides[topic];
                            if (!content) {
                              return (
                                <div className="space-y-4">
                                  <p className="font-semibold">Hey! Let's get you ready for your test.</p>
                                  <p>I see that {topic} questions have been challenging. This topic covers fundamental concepts that are essential for DECA competitions and business success.</p>
                                  <div>
                                    <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">The Explanation</h4>
                                    <p>Focus on understanding the core principles and how they apply in real business situations. Practice identifying key concepts and connecting them to practical scenarios.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">Strategic Tips for Your Test</h4>
                                    <div className="space-y-3 ml-4">
                                      <div>
                                        <p className="font-medium">Read Questions Carefully.</p>
                                        <p>Take time to understand what each question is really asking. Look for keywords that indicate which specific concept is being tested.</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Connect to Real Examples.</p>
                                        <p>Think about how these concepts apply in actual businesses. Real-world examples help you remember principles and apply them correctly.</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Practice Consistently.</p>
                                        <p>Regular review of key concepts and practice with similar questions will help build your confidence and speed on test day.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                <p className="font-semibold">Hey! Let's get you ready for your test.</p>
                                <p>{content.intro}</p>
                                
                                <div>
                                  <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">The Explanation</h4>
                                  <p>{content.explanation}</p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">Strategic Tips for Your Test</h4>
                                  <p className="mb-2">When you encounter these questions on the exam, use these strategies:</p>
                                  
                                  <div className="space-y-3 ml-4">
                                    {content.tips.map((tip, index) => (
                                      <div key={index}>
                                        <p className="font-medium">{tip.title}</p>
                                        <p>{tip.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          };

                          return getTopicContent(selectedTopic.topic);
                        })()}
                      </div>
                      {selectedTopic.difficulty && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Difficulty: {selectedTopic.difficulty}
                          </Badge>
                          {selectedTopic.failureRate && (
                            <Badge variant="secondary" className="text-xs">
                              Your accuracy: {100 - selectedTopic.failureRate}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Interactive Quiz Interface */}
                    {topicPracticeQuestions.length > 0 && (
                      <div className="border rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Personalized Practice Quiz</h3>
                          <Badge variant="outline">
                            Question {inlineQuizIndex + 1} of {topicPracticeQuestions.length}
                          </Badge>
                        </div>

                        {inlineQuizState === 'active' && (
                          <>
                            {/* Current Question */}
                            <div className="space-y-4">
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-lg leading-relaxed">
                                  {topicPracticeQuestions[inlineQuizIndex]?.stem}
                                </p>
                              </div>

                              {/* Answer Options */}
                              <div className="space-y-3">
                                {Object.entries(topicPracticeQuestions[inlineQuizIndex]?.options || {}).map(([key, option]) => (
                                  <div
                                    key={key}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                                      inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id] === key
                                        ? 'border-primary bg-primary/20 shadow-lg ring-2 ring-primary/30'
                                        : 'border-muted hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
                                    }`}
                                    onClick={() => {
                                      setInlineQuizAnswers(prev => ({
                                        ...prev,
                                        [topicPracticeQuestions[inlineQuizIndex]?.id]: key
                                      }));
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                        inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id] === key
                                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                          : 'border-muted-foreground bg-background'
                                      }`}>
                                        <span className="text-sm font-bold">{key}</span>
                                      </div>
                                      <span className={`flex-1 transition-colors duration-200 ${
                                        inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id] === key
                                          ? 'text-primary font-medium'
                                          : ''
                                      }`}>{option as string}</span>
                                      {inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id] === key && (
                                        <div className="text-primary">
                                          <CheckCircle className="h-5 w-5" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setInlineQuizIndex(Math.max(0, inlineQuizIndex - 1))}
                                disabled={inlineQuizIndex === 0}
                              >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Previous
                              </Button>

                              <div className="flex gap-2">
                                {inlineQuizIndex < topicPracticeQuestions.length - 1 ? (
                                  <Button
                                    onClick={() => setInlineQuizIndex(inlineQuizIndex + 1)}
                                    disabled={!inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id]}
                                  >
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      // Calculate results
                                      let correct = 0;
                                      const results = topicPracticeQuestions.map((question) => {
                                        const userAnswer = inlineQuizAnswers[question.id];
                                        const isCorrect = userAnswer === question.answer;
                                        if (isCorrect) correct++;
                                        return {
                                          question,
                                          userAnswer,
                                          isCorrect
                                        };
                                      });
                                      
                                      setInlineQuizResults({
                                        correct,
                                        total: topicPracticeQuestions.length,
                                        percentage: Math.round((correct / topicPracticeQuestions.length) * 100),
                                        results
                                      });
                                      setInlineQuizState('results');
                                    }}
                                    disabled={!inlineQuizAnswers[topicPracticeQuestions[inlineQuizIndex]?.id]}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Submit Quiz
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Results State */}
                        {inlineQuizState === 'results' && inlineQuizResults && (
                          <div className="space-y-6">
                            {/* Score Display */}
                            <div className="text-center p-6 bg-muted/50 rounded-lg">
                              <div className="text-4xl font-bold text-primary mb-2">
                                {inlineQuizResults.percentage}%
                              </div>
                              <p className="text-lg text-muted-foreground">
                                {inlineQuizResults.correct} out of {inlineQuizResults.total} correct
                              </p>
                              <div className="mt-4">
                                <Badge className={inlineQuizResults.percentage >= 80 ? 'bg-green-500' : inlineQuizResults.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                                  {inlineQuizResults.percentage >= 80 ? 'Excellent!' : inlineQuizResults.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-4">
                              <Button
                                onClick={() => setInlineQuizState('review')}
                                variant="outline"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Review Answers
                              </Button>
                              <Button
                                onClick={() => {
                                  setInlineQuizIndex(0);
                                  setInlineQuizAnswers({});
                                  setInlineQuizState('active');
                                  setInlineQuizResults(null);
                                }}
                                variant="outline"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Retake Quiz
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Review State */}
                        {inlineQuizState === 'review' && inlineQuizResults && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-medium">Answer Review</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInlineQuizState('results')}
                              >
                                Back to Results
                              </Button>
                            </div>

                            {inlineQuizResults.results.map((result: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className={`rounded-full p-2 mt-1 ${result.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <span className={`font-semibold text-sm ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <p className="font-medium">{result.question.stem}</p>
                                    
                                    <div className="space-y-2">
                                      {Object.entries(result.question.options).map(([key, option]) => (
                                        <div
                                          key={key}
                                          className={`p-2 rounded border ${
                                            result.question.answer === key
                                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                                              : result.userAnswer === key && !result.isCorrect
                                              ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                                              : 'bg-background'
                                          }`}
                                        >
                                          <span className="font-medium mr-2">{key}.</span>
                                          {option as string}
                                          {result.question.answer === key && (
                                            <Badge className="ml-2 bg-green-500">Correct</Badge>
                                          )}
                                          {result.userAnswer === key && !result.isCorrect && (
                                            <Badge variant="destructive" className="ml-2">Your Answer</Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {result.question.explanation && (
                                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                                        <p className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">Explanation:</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                          {result.question.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {topicPracticeQuestions.length === 0 && (
                      <div className="flex justify-center gap-4">
                        <Button 
                          variant="default" 
                          className="px-8"
                          onClick={() => handlePersonalizedTest(selectedTopic.topic, 8)}
                          disabled={quizState === 'loading'}
                        >
                          {quizState === 'loading' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            'Try Some Practice Questions'
                          )}
                        </Button>
                        <Button onClick={() => setSelectedTopic(null)} className="px-8" variant="outline">
                          Close
                        </Button>
                      </div>
                    )}

                    {topicPracticeQuestions.length > 0 && inlineQuizState === 'results' && (
                      <div className="flex justify-center">
                        <Button onClick={() => setSelectedTopic(null)} className="px-8" variant="outline">
                          Close Practice
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating practice questions...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configuration State */}
          {pageMode === 'practice' && quizState === 'configuring' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configure Your AI Practice Test
                </CardTitle>
                <CardDescription>
                  Customize your practice test settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cluster" className="text-foreground/80">DECA Cluster</Label>
                    <Select 
                      defaultValue={selectedCluster}
                      onValueChange={(value) => setValue("cluster", value)}
                    >
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Select DECA cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {DECA_CLUSTERS.map((cluster) => (
                          <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cluster && (
                      <p className="text-destructive text-sm mt-1">{errors.cluster.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-foreground/80">Competition Level</Label>
                    <Select 
                      defaultValue={selectedLevel}
                      onValueChange={(value) => setValue("level", value)}
                    >
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Select competition level" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPETITION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-destructive text-sm mt-1">{errors.level.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">
                      Number of Questions: {questionCount}
                    </Label>
                    <Slider
                      value={[questionCount as number]}
                      onValueChange={(value) => setValue("questionCount", value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10</span>
                      <span>100</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating AI Test...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Start Practice Test
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {pageMode === 'practice' && quizState === 'loading' && (
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Generating Your AI Practice Test</h3>
                <p className="text-muted-foreground">
                  Creating {questionCount} authentic DECA questions for {selectedCluster} at {selectedLevel} level...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Quiz State */}
          {pageMode === 'practice' && quizState === 'active' && quizData && (
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Question {currentQuestionIndex + 1} of {quizData.questions.length}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{quizData.metadata?.cluster || selectedCluster}</Badge>
                    <Badge variant="outline">{quizData.metadata?.level || selectedLevel}</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={restartQuiz}
                  className="shrink-0"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress 
                  value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} 
                  className="w-full"
                />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium leading-relaxed">
                        {quizData.questions[currentQuestionIndex].stem}
                      </h3>
                      {quizData.questions[currentQuestionIndex].instructional_area && (
                        <Badge variant="outline" className="mt-2">
                          {quizData.questions[currentQuestionIndex].instructional_area}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <RadioGroup 
                    value={userAnswers[quizData.questions[currentQuestionIndex].id] || ""}
                    onValueChange={(value) => handleOptionSelect(quizData.questions[currentQuestionIndex].id, value)}
                    className="space-y-3"
                  >
                    {Object.entries(quizData.questions[currentQuestionIndex].options).map(([key, option]) => (
                      <div key={key} className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer transform hover:scale-[1.01] ${
                        userAnswers[quizData.questions[currentQuestionIndex].id] === key
                          ? 'border-primary bg-primary/20 shadow-lg ring-2 ring-primary/30'
                          : 'border-muted hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
                      }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          userAnswers[quizData.questions[currentQuestionIndex].id] === key
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-muted-foreground bg-background'
                        }`}>
                          <span className="text-sm font-bold">{key}</span>
                        </div>
                        <RadioGroupItem value={key} id={`option-${key}`} className="sr-only" />
                        <Label htmlFor={`option-${key}`} className={`flex-1 cursor-pointer text-base leading-relaxed transition-colors duration-200 ${
                          userAnswers[quizData.questions[currentQuestionIndex].id] === key
                            ? 'text-primary font-medium'
                            : ''
                        }`}>
                          {option as string}
                        </Label>
                        {userAnswers[quizData.questions[currentQuestionIndex].id] === key && (
                          <div className="text-primary">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === quizData.questions.length - 1 ? (
                    <Button onClick={() => {
                      submitTestResults();
                      showResults();
                    }} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Finish Test
                    </Button>
                  ) : (
                    <Button 
                      onClick={goToNextQuestion}
                      disabled={!userAnswers[quizData.questions[currentQuestionIndex].id]}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results State */}
          {pageMode === 'practice' && quizState === 'results' && quizData && (
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <CheckCircle className="h-6 w-6" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  {quizData.metadata?.cluster || selectedCluster} • {quizData.metadata?.level || selectedLevel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {calculateScore().percentage}%
                  </div>
                  <p className="text-xl text-muted-foreground">
                    {calculateScore().correct} out of {calculateScore().total} correct
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {calculateScore().correct}
                    </div>
                    <p className="text-sm text-green-600">Correct</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {calculateScore().total - calculateScore().correct}
                    </div>
                    <p className="text-sm text-red-600">Incorrect</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={restartQuiz} className="flex-1">
                    Take Another Test
                  </Button>
                  <Button variant="outline" onClick={() => setQuizState('review')} className="flex-1">
                    Review Answers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review State */}
          {pageMode === 'practice' && quizState === 'review' && quizData && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Answer Review
                </CardTitle>
                <CardDescription>
                  Review your answers with correct solutions and explanations
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quizData.questions.map((question: any, index: number) => {
                  const userAnswer = userAnswers[question.id];
                  const correctAnswer = question.answer;
                  const isCorrect = userAnswer === correctAnswer;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 mt-1 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <span className={`font-semibold text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-medium leading-relaxed">
                              {question.stem}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{question.instructional_area}</Badge>
                              <Badge variant="secondary">{question.difficulty}</Badge>
                              {isCorrect ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Correct
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                                  Incorrect
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {Object.entries(question.options).map(([key, option]) => {
                              const isUserChoice = userAnswer === key;
                              const isCorrectChoice = correctAnswer === key;
                              
                              return (
                                <div 
                                  key={key} 
                                  className={`p-3 rounded-lg border ${
                                    isCorrectChoice 
                                      ? 'bg-green-500/10 border-green-500/20' 
                                      : isUserChoice 
                                        ? 'bg-red-500/10 border-red-500/20' 
                                        : 'bg-muted/30 border-muted'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`font-medium ${
                                      isCorrectChoice 
                                        ? 'text-green-600' 
                                        : isUserChoice 
                                          ? 'text-red-600' 
                                          : 'text-muted-foreground'
                                    }`}>
                                      {key}.
                                    </span>
                                    <span className="flex-1">{option as string}</span>
                                    {isCorrectChoice && (
                                      <span className="text-green-600 text-sm font-medium">✓ Correct Answer</span>
                                    )}
                                    {isUserChoice && !isCorrectChoice && (
                                      <span className="text-red-600 text-sm font-medium">Your Answer</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="font-medium text-blue-600 mb-2">Explanation:</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {quizData.answer_explanations?.[question.id] || question.rationale || `The correct answer is ${correctAnswer}. This question tests knowledge of ${question.instructional_area} at the ${question.difficulty} level. Understanding this concept is essential for DECA competition success.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => setQuizState('results')} variant="outline" className="flex-1">
                    Back to Results
                  </Button>
                  <Button onClick={restartQuiz} className="flex-1">
                    Take Another Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </motion.div>
      </div>

      {/* DECA Loading Screen */}
      <DecaLoadingScreen
        isVisible={showLoadingScreen}
        loadingText={loadingText}
        onComplete={() => setShowLoadingScreen(false)}
        estimatedDuration={15000}
      />
    </MainLayout>
  );
}