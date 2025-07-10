
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, ArrowRight, RotateCcw, Brain, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Form schema for AI test generation
const testSchema = z.object({
  cluster: z.string().min(1, "Please select a cluster"),
  level: z.string().min(1, "Please select a level"),
  questionCount: z.number().min(10).max(100),
  adaptiveMode: z.boolean().default(true),
  targetDifficulty: z.string().default("adaptive"),
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

// Difficulty levels for adaptive mode
const DIFFICULTY_LEVELS = [
  { value: "adaptive", label: "🧠 AI Adaptive", description: "AI adjusts difficulty based on your performance" },
  { value: "beginner", label: "🌱 Beginner", description: "Foundation concepts and basic scenarios" },
  { value: "intermediate", label: "🎯 Intermediate", description: "Mixed difficulty with practical applications" },
  { value: "advanced", label: "🚀 Advanced", description: "Competition-level challenging questions" },
];

// Quiz states for managing the interface
type QuizState = 'configuring' | 'loading' | 'active' | 'results' | 'review';

export default function PracticeTestsPage() {
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [realTimeStats, setRealTimeStats] = useState({
    currentStreak: 0,
    accuracy: 0,
    avgResponseTime: 0,
    difficultyLevel: 'intermediate'
  });
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<string>('');
  
  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      cluster: "Marketing",
      level: "District",
      questionCount: 25,
      adaptiveMode: true,
      targetDifficulty: "adaptive",
    },
  });
  
  // Watch for form values
  const selectedCluster = watch("cluster");
  const selectedLevel = watch("level");
  const questionCount = watch("questionCount");
  const adaptiveMode = watch("adaptiveMode");
  const targetDifficulty = watch("targetDifficulty");
  
  // Track question timing for adaptive AI
  useEffect(() => {
    if (quizState === 'active') {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, quizState]);
  
  // AI-Enhanced Test Generation Function
  const handleStartTest = async (data: TestFormValues) => {
    setQuizState('loading');
    setError('');
    
    try {
      const response = await fetch('/api/generate-adaptive-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster: data.cluster,
          level: data.level,
          questionCount: data.questionCount,
          adaptiveMode: data.adaptiveMode,
          targetDifficulty: data.targetDifficulty,
          userProfile: {
            // Include user's historical performance
            previousScores: [], // This would come from user data
            preferredLearningStyle: 'visual',
            weakAreas: [],
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate adaptive test');
      }

      const quizData = await response.json();
      setQuizData(quizData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizState('active');
      setRealTimeStats({
        currentStreak: 0,
        accuracy: 0,
        avgResponseTime: 0,
        difficultyLevel: quizData.startingDifficulty || 'intermediate'
      });
      
      toast({
        title: "🚀 AI Test Generated",
        description: `Adaptive ${data.cluster} test ready! AI will adjust difficulty based on your performance.`,
      });
    } catch (error: any) {
      console.error('Test generation error:', error);
      setError(error.message);
      setQuizState('configuring');
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
  
  // Enhanced option selection with AI analysis
  const handleOptionSelect = async (questionId: number, selectedOption: string) => {
    const responseTime = Date.now() - questionStartTime;
    
    setUserAnswers({
      ...userAnswers,
      [questionId]: selectedOption
    });
    
    // If adaptive mode is enabled, send real-time feedback to AI
    if (adaptiveMode && quizData) {
      try {
        const currentQuestion = quizData.questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.answer;
        
        // Update real-time stats
        const newStats = {
          ...realTimeStats,
          currentStreak: isCorrect ? realTimeStats.currentStreak + 1 : 0,
          accuracy: ((Object.keys(userAnswers).length * realTimeStats.accuracy + (isCorrect ? 100 : 0)) / (Object.keys(userAnswers).length + 1)),
          avgResponseTime: ((Object.keys(userAnswers).length * realTimeStats.avgResponseTime + responseTime) / (Object.keys(userAnswers).length + 1))
        };
        setRealTimeStats(newStats);
        
        // Get AI adaptive feedback
        const feedbackResponse = await fetch('/api/adaptive-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            selectedOption,
            isCorrect,
            responseTime,
            currentStats: newStats,
            questionDifficulty: currentQuestion.difficulty
          })
        });
        
        if (feedbackResponse.ok) {
          const feedback = await feedbackResponse.json();
          setAdaptiveFeedback(feedback.message);
          
          // Show real-time encouragement
          if (feedback.showEncouragement) {
            toast({
              title: feedback.title,
              description: feedback.description,
              variant: isCorrect ? "default" : "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Adaptive feedback error:', error);
      }
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAdaptiveFeedback(''); // Clear previous feedback
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAdaptiveFeedback(''); // Clear previous feedback
    }
  };

  const showResults = async () => {
    // Generate AI-powered analysis before showing results
    try {
      const analysisResponse = await fetch('/api/test-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswers,
          quizData,
          realTimeStats,
          testConfig: { selectedCluster, selectedLevel, adaptiveMode }
        })
      });
      
      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setAiInsights(analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
    
    setQuizState('results');
  };

  const restartQuiz = () => {
    setQuizData(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizState('configuring');
    setAiInsights(null);
    setRealTimeStats({
      currentStreak: 0,
      accuracy: 0,
      avgResponseTime: 0,
      difficultyLevel: 'intermediate'
    });
  };

  // Calculate enhanced score with AI insights
  const calculateScore = () => {
    if (!quizData?.questions) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    const total = quizData.questions.length;
    
    quizData.questions.forEach((question: any) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answer;
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };
  
  return (
    <MainLayout>
      <PageHeader
        title="🧠 AI-Powered Adaptive Testing"
        subtitle="Experience next-generation practice tests that adapt to your learning style and performance in real-time"
      />
      
      {/* Enhanced Configuration State */}
      {quizState === 'configuring' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                Configure Your AI Learning Experience
              </CardTitle>
              <p className="text-slate-600">Our AI will create a personalized test that adapts to your performance in real-time</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cluster" className="text-foreground/80 font-medium">DECA Cluster</Label>
                    <Select 
                      defaultValue={selectedCluster}
                      onValueChange={(value) => setValue("cluster", value)}
                    >
                      <SelectTrigger className="w-full bg-white/80 mt-2 border-slate-300">
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

                  <div>
                    <Label htmlFor="level" className="text-foreground/80 font-medium">Competition Level</Label>
                    <Select 
                      defaultValue={selectedLevel}
                      onValueChange={(value) => setValue("level", value)}
                    >
                      <SelectTrigger className="w-full bg-white/80 mt-2 border-slate-300">
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
                </div>

                <div>
                  <Label className="text-foreground/80 font-medium">
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
                    <span>10 (Quick)</span>
                    <span>100 (Comprehensive)</span>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground/80 font-medium">AI Difficulty Mode</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <motion.div
                        key={difficulty.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          targetDifficulty === difficulty.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                        onClick={() => setValue("targetDifficulty", difficulty.value)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-700">{difficulty.label}</span>
                          {difficulty.value === 'adaptive' && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{difficulty.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                  >
                    <p className="text-destructive text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                        AI is Personalizing Your Test...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-3" />
                        Start AI-Powered Test
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Loading State */}
      {quizState === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm border-indigo-200 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI is Crafting Your Perfect Test
                  </h3>
                  <p className="text-slate-600 mt-2 max-w-md mx-auto">
                    Analyzing your learning profile and generating {questionCount} personalized questions for {selectedCluster} at {selectedLevel} level
                  </p>
                </div>
                
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Active Quiz State */}
      {quizState === 'active' && quizData && (
        <div className="space-y-6">
          {/* Real-time Performance Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeStats.currentStreak}</div>
                <div className="text-sm text-green-500">Current Streak</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(realTimeStats.accuracy)}%</div>
                <div className="text-sm text-blue-500">Accuracy</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(realTimeStats.avgResponseTime / 1000)}s</div>
                <div className="text-sm text-purple-500">Avg Time</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-yellow-600 capitalize">{realTimeStats.difficultyLevel}</div>
                <div className="text-sm text-yellow-500">AI Difficulty</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Question Card */}
          <Card className="bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm border-slate-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{quizData.metadata?.cluster || selectedCluster}</Badge>
                  <Badge variant="outline">{quizData.metadata?.level || selectedLevel}</Badge>
                  {adaptiveMode && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Adaptive
                    </Badge>
                  )}
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
              <div className="flex items-center gap-2 mb-4">
                <Progress 
                  value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-sm text-slate-500 font-medium">
                  {Math.round(((currentQuestionIndex + 1) / quizData.questions.length) * 100)}%
                </span>
              </div>

              {/* Adaptive Feedback */}
              <AnimatePresence>
                {adaptiveFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">AI Coach</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{adaptiveFeedback}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 mt-1 flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-relaxed text-slate-800">
                      {quizData.questions[currentQuestionIndex].stem}
                    </h3>
                    {quizData.questions[currentQuestionIndex].instructional_area && (
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{quizData.questions[currentQuestionIndex].instructional_area}</Badge>
                        <Badge variant="secondary" className="capitalize">
                          {quizData.questions[currentQuestionIndex].difficulty || realTimeStats.difficultyLevel}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <RadioGroup 
                  value={userAnswers[quizData.questions[currentQuestionIndex].id] || ""}
                  onValueChange={(value) => handleOptionSelect(quizData.questions[currentQuestionIndex].id, value)}
                  className="space-y-3 ml-16"
                >
                  {Object.entries(quizData.questions[currentQuestionIndex].options).map(([key, option]) => (
                    <motion.div 
                      key={key} 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={key} id={`option-${key}`} className="text-blue-500" />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                        <span className="font-semibold text-blue-600 mr-3">{key}.</span>
                        {option as string}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={showResults} 
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Get AI Analysis
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={goToNextQuestion}
                      disabled={!userAnswers[quizData.questions[currentQuestionIndex].id]}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Results State with AI Analysis */}
      {quizState === 'results' && quizData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold">
                🎉 Test Complete!
              </CardTitle>
              <p className="text-muted-foreground">
                {quizData.metadata?.cluster || selectedCluster} • {quizData.metadata?.level || selectedLevel}
                {adaptiveMode && " • AI Adaptive Mode"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2"
                >
                  {calculateScore().percentage}%
                </motion.div>
                <p className="text-xl text-muted-foreground">
                  {calculateScore().correct} out of {calculateScore().total} correct
                </p>
                
                {aiInsights && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-blue-700">AI Performance Analysis</span>
                    </div>
                    <p className="text-blue-600 text-sm leading-relaxed">
                      {aiInsights.overallAssessment || "Great job! Your performance shows strong understanding of the core concepts."}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                >
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {calculateScore().correct}
                  </div>
                  <p className="text-sm text-green-600">Correct Answers</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {realTimeStats.currentStreak}
                  </div>
                  <p className="text-sm text-blue-600">Best Streak</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
                >
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(realTimeStats.avgResponseTime / 1000)}s
                  </div>
                  <p className="text-sm text-purple-600">Avg Response</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <div className="text-2xl font-bold text-yellow-600 mb-1 capitalize">
                    {aiInsights?.recommendedLevel || realTimeStats.difficultyLevel}
                  </div>
                  <p className="text-sm text-yellow-600">AI Level Rec.</p>
                </motion.div>
              </div>

              {/* AI Recommendations */}
              {aiInsights?.recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6"
                >
                  <h3 className="font-bold text-indigo-700 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    AI Learning Recommendations
                  </h3>
                  <div className="space-y-3">
                    {aiInsights.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-indigo-600 text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button onClick={restartQuiz} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    New AI Test
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button variant="outline" onClick={() => setQuizState('review')} className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Review with AI
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Review State with AI Explanations */}
      {quizState === 'review' && quizData && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-500" />
                AI-Enhanced Answer Review
              </CardTitle>
              <p className="text-muted-foreground">
                Detailed analysis with AI-powered explanations and learning insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {quizData.questions.map((question: any, index: number) => {
                  const userAnswer = userAnswers[question.id];
                  const correctAnswer = question.answer;
                  const isCorrect = userAnswer === correctAnswer;
                  
                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-6 space-y-4 bg-white shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-full p-3 mt-1 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                          <span className={`font-semibold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-medium leading-relaxed text-slate-800">
                              {question.stem}
                            </h3>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline">{question.instructional_area}</Badge>
                              <Badge variant="secondary" className="capitalize">{question.difficulty}</Badge>
                              {isCorrect ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  ✓ Correct
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                  ✗ Incorrect
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {Object.entries(question.options).map(([key, option]) => {
                              const isUserChoice = userAnswer === key;
                              const isCorrectChoice = correctAnswer === key;
                              
                              return (
                                <motion.div 
                                  key={key} 
                                  whileHover={{ scale: 1.01 }}
                                  className={`p-4 rounded-lg border transition-all ${
                                    isCorrectChoice 
                                      ? 'bg-green-50 border-green-200 shadow-sm' 
                                      : isUserChoice 
                                        ? 'bg-red-50 border-red-200 shadow-sm' 
                                        : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`font-semibold ${
                                      isCorrectChoice 
                                        ? 'text-green-600' 
                                        : isUserChoice 
                                          ? 'text-red-600' 
                                          : 'text-slate-500'
                                    }`}>
                                      {key}.
                                    </span>
                                    <span className="flex-1">{option as string}</span>
                                    {isCorrectChoice && (
                                      <Badge className="bg-green-100 text-green-700 border-green-200">
                                        ✓ Correct Answer
                                      </Badge>
                                    )}
                                    {isUserChoice && !isCorrectChoice && (
                                      <Badge className="bg-red-100 text-red-700 border-red-200">
                                        Your Answer
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                          
                          {/* AI-Enhanced Explanation */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-700">AI Learning Coach</h4>
                            </div>
                            <div className="space-y-3">
                              <p className="text-sm text-blue-700 leading-relaxed">
                                <strong>Why {correctAnswer} is correct:</strong> {question.rationale || `The correct answer is ${correctAnswer}. This question tests your knowledge of ${question.instructional_area}.`}
                              </p>
                              
                              {!isCorrect && aiInsights?.questionAnalysis?.[question.id] && (
                                <div className="bg-white border border-blue-200 rounded-md p-3">
                                  <p className="text-sm text-blue-600">
                                    <strong>AI Insight:</strong> {aiInsights.questionAnalysis[question.id]}
                                  </p>
                                </div>
                              )}
                              
                              <div className="bg-indigo-100 border border-indigo-200 rounded-md p-3">
                                <p className="text-sm text-indigo-700">
                                  <strong>Study Tip:</strong> To master this concept, focus on understanding {question.instructional_area} principles and practice similar scenarios in real business contexts.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button onClick={() => setQuizState('results')} variant="outline" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Back to Results
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button onClick={restartQuiz} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Zap className="w-4 h-4 mr-2" />
                      New AI Test
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
