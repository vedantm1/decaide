import { useState } from "react";
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


// Form schema for test generation
const testSchema = z.object({
  testType: z.string().min(1, "Please select a test type"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  numQuestions: z.number().min(10).max(100),
  timeLimit: z.string(),
});

type TestFormValues = z.infer<typeof testSchema>;

// Updated test types as requested
const TEST_TYPES = [
  "Business Management & Administration",
  "Entrepreneurship", 
  "Finance",
  "Hospitality & Tourism",
  "Marketing",
  "Personal Financial Literacy"
];

// Test categories
const TEST_CATEGORIES = [
  { name: "Business Law", count: 15 },
  { name: "Economics", count: 10 },
  { name: "Finance", count: 8 },
  { name: "Management", count: 12 },
  { name: "Marketing", count: 15 },
];

// Time limit options
const TIME_LIMITS = [
  "No Time Limit",
  "30 Minutes",
  "60 Minutes",
  "90 Minutes",
  "120 Minutes (Standard)",
];

export default function PracticeTestsPage() {
  const { toast } = useToast();
  const [generatedTest, setGeneratedTest] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testType: "Business Management & Administration",
      categories: TEST_CATEGORIES.map(cat => cat.name),
      numQuestions: 50,
      timeLimit: "120 Minutes (Standard)",
    },
  });
  
  // Watch for form values
  const numQuestions = watch("numQuestions");
  
  // Generate test mutation
  const generateTest = useMutation({
    mutationFn: async (data: TestFormValues) => {
      const res = await apiRequest("POST", "/api/test/generate", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedTest(data);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      toast({
        title: "Test Generated",
        description: `Your ${data.testType} practice test is ready!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: TestFormValues) => {
    generateTest.mutate(data);
  };
  
  // Handle moving to next/previous question
  const goToNextQuestion = () => {
    if (currentQuestion < generatedTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Handle answer selection
  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
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
                <Label className="text-foreground/80">Question Categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {TEST_CATEGORIES.map((category) => (
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
