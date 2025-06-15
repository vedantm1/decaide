import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";


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
        title="Practice Tests"
        subtitle="Practice with exam-style questions to prepare for your DECA test"
      />
      
      {!generatedTest ? (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Configure Your Practice Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="testType" className="text-foreground/80">Test Type</Label>
                <Select 
                  defaultValue={watch("testType")}
                  onValueChange={(value) => setValue("testType", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.testType && (
                  <p className="text-destructive text-sm mt-1">{errors.testType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="difficultyType" className="text-foreground/80">Difficulty Type</Label>
                <Select 
                  defaultValue={watch("difficultyType")}
                  onValueChange={(value) => setValue("difficultyType", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
                    <SelectValue placeholder="Select difficulty type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficultyType && (
                  <p className="text-destructive text-sm mt-1">{errors.difficultyType.message}</p>
                )}
              </div>
              
              <div>
                <Label className="text-foreground/80">Question Categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {currentCategories.map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category.name}`}
                        defaultChecked
                        value={category.name}
                        onCheckedChange={(checked) => {
                          const current = watch("categories");
                          if (checked) {
                            setValue("categories", [...current, category.name]);
                          } else {
                            setValue(
                              "categories", 
                              current.filter((item) => item !== category.name)
                            );
                          }
                        }}
                      />
                      <label 
                        htmlFor={`category-${category.name}`} 
                        className="text-sm text-foreground/80"
                      >
                        {category.name} ({category.count})
                      </label>
                    </div>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-destructive text-sm mt-1">{errors.categories.message}</p>
                )}
              </div>
              
              <div>
                <Label className="text-foreground/80">Number of Questions</Label>
                <div className="flex items-center mt-3">
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[numQuestions]}
                    onValueChange={(value) => setValue("numQuestions", value[0])}
                    className="w-full"
                  />
                  <span className="ml-4 text-sm text-foreground/80 min-w-[40px] font-medium">{numQuestions}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="timeLimit" className="text-foreground/80">Time Limit</Label>
                <Select 
                  defaultValue={watch("timeLimit")}
                  onValueChange={(value) => setValue("timeLimit", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
                    <SelectValue placeholder="Select time limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_LIMITS.map((limit) => (
                      <SelectItem key={limit} value={limit}>{limit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 mt-4"
                disabled={generateTest.isPending}
              >
                {generateTest.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </div>
                ) : (
                  "Start Practice Test"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Practice Test: {generatedTest.testType}</CardTitle>
              <span className="text-sm text-foreground/70 bg-background/50 px-3 py-1 rounded-full">
                Question {currentQuestion + 1} of {generatedTest.questions.length}
              </span>
            </CardHeader>
            <CardContent>
              <div className="bg-background/40 p-6 rounded-lg">
                <p className="text-foreground font-medium">
                  {generatedTest.questions[currentQuestion].question}
                </p>
                
                <div className="mt-6 space-y-4">
                  <RadioGroup 
                    value={selectedAnswers[currentQuestion]?.toString()} 
                    onValueChange={(value) => selectAnswer(currentQuestion, parseInt(value))}
                    className="space-y-3"
                  >
                    {generatedTest.questions[currentQuestion].options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-background/30 hover:bg-background/50 transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-foreground/90 cursor-pointer">
                          <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6"
                >
                  Previous
                </Button>
                {currentQuestion < generatedTest.questions.length - 1 ? (
                  <Button onClick={goToNextQuestion} className="px-6">
                    Next Question
                  </Button>
                ) : (
                  <Button className="px-6">
                    Finish Test
                  </Button>
                )}
              </div>
              
              {/* Question navigation */}
              <div className="mt-8 p-4 bg-background/30 rounded-lg">
                <h3 className="text-sm font-medium text-foreground/80 mb-3">Question Navigator</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {generatedTest.questions.map((_: any, index: number) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : selectedAnswers[index] !== undefined ? "secondary" : "outline"}
                      className="h-10 w-10 p-0"
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
