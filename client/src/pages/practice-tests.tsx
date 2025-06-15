import { useState } from "react";
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
import { CheckCircle, ArrowLeft, ArrowRight, RotateCcw, Eye, EyeOff, Check, X } from "lucide-react";

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
type QuizState = 'configuring' | 'loading' | 'active' | 'results';

export default function PracticeTestsPage() {
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [showDetailedAnswers, setShowDetailedAnswers] = useState(false);
  
  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      cluster: "Marketing",
      level: "District",
      questionCount: 25,
    },
  });
  
  // Watch for form values
  const selectedCluster = watch("cluster");
  const selectedLevel = watch("level");
  const questionCount = watch("questionCount");
  
  // AI Test Generation Function
  const handleStartTest = async (data: TestFormValues) => {
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
      
      toast({
        title: "Test Generated Successfully",
        description: `Your ${data.cluster} practice test with ${data.questionCount} questions is ready!`,
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
    quizData.questions.forEach((question: any) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answer;
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    
    const total = quizData.questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, total, percentage };
  };
  
  return (
    <MainLayout>
      <PageHeader
        title="AI-Powered Practice Tests"
        subtitle="Generate unlimited practice tests with authentic DECA questions powered by AI"
      />
      
      {/* Configuration State */}
      {quizState === 'configuring' && (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Configure Your AI Practice Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="cluster" className="text-foreground/80">DECA Cluster</Label>
                <Select 
                  defaultValue={selectedCluster}
                  onValueChange={(value) => setValue("cluster", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
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
                <Label htmlFor="level" className="text-foreground/80">Competition Level</Label>
                <Select 
                  defaultValue={selectedLevel}
                  onValueChange={(value) => setValue("level", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
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

              <div>
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Generating AI Test..." : "Start Practice Test"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {quizState === 'loading' && (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-xl font-semibold">Generating Your AI Practice Test</h3>
              <p className="text-muted-foreground">
                Creating {questionCount} authentic DECA questions for {selectedCluster} at {selectedLevel} level...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Quiz State */}
      {quizState === 'active' && quizData && (
        <div className="space-y-6">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Question {currentQuestionIndex + 1} of {quizData.questions.length}</CardTitle>
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
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
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
                  className="space-y-3 ml-12"
                >
                  {Object.entries(quizData.questions[currentQuestionIndex].options).map(([key, option]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                        <span className="font-medium text-primary mr-2">{key}.</span>
                        {option as string}
                      </Label>
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
                  <Button onClick={showResults} className="flex items-center gap-2">
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
        </div>
      )}

      {/* Results State */}
      {quizState === 'results' && quizData && (
        <div className="space-y-6">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Test Results</CardTitle>
              <p className="text-muted-foreground">
                {quizData.metadata?.cluster || selectedCluster} • {quizData.metadata?.level || selectedLevel}
              </p>
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
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailedAnswers(!showDetailedAnswers)}
                  className="flex-1 flex items-center gap-2"
                >
                  {showDetailedAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetailedAnswers ? "Hide" : "Show"} Detailed Answers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Answer Review */}
          {showDetailedAnswers && (
            <Card className="bg-background/60 backdrop-blur-sm border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detailed Answer Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {quizData.questions.map((question: any, index: number) => {
                  const userAnswer = userAnswers[question.id];
                  const correctAnswer = question.answer;
                  const isCorrect = userAnswer === correctAnswer;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge variant="secondary">{question.instructional_area}</Badge>
                            <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-base leading-relaxed mb-3">
                            {question.stem}
                          </h4>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          isCorrect 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(question.options).map(([key, option]) => {
                          const isUserChoice = userAnswer === key;
                          const isCorrectChoice = correctAnswer === key;
                          
                          let optionStyle = "p-3 rounded-lg border text-sm";
                          if (isCorrectChoice) {
                            optionStyle += " bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
                          } else if (isUserChoice && !isCorrectChoice) {
                            optionStyle += " bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                          } else {
                            optionStyle += " bg-muted/50 border-muted";
                          }
                          
                          return (
                            <div key={key} className={optionStyle}>
                              <div className="flex items-center justify-between">
                                <span className="flex-1">
                                  <span className="font-medium mr-2">{key}.</span>
                                  {option as string}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isUserChoice && (
                                    <Badge variant="outline" className="text-xs">
                                      Your Answer
                                    </Badge>
                                  )}
                                  {isCorrectChoice && (
                                    <Badge variant="default" className="text-xs bg-green-600">
                                      Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.rationale && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">Explanation:</h5>
                          <p className="text-blue-700 dark:text-blue-400 text-sm">
                            {question.rationale}
                          </p>
                        </div>
                      )}

                      {question.pi_codes && question.pi_codes.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>PI Codes:</span>
                          {question.pi_codes.map((code: string) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </MainLayout>
  );
}