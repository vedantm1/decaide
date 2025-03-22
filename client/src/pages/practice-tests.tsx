import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EVENT_TYPES } from "@shared/schema";

// Form schema for test generation
const testSchema = z.object({
  testType: z.string().min(1, "Please select a test type"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  numQuestions: z.number().min(10).max(100),
  timeLimit: z.string(),
});

type TestFormValues = z.infer<typeof testSchema>;

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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <header className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-slate-800">Practice Tests</h1>
            <p className="text-slate-500 mt-1">Practice with exam-style questions to prepare for your DECA test</p>
          </header>
          
          {!generatedTest ? (
            <Card>
              <CardHeader>
                <CardTitle>Configure Your Practice Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="testType">Test Type</Label>
                    <Select 
                      defaultValue={watch("testType")}
                      onValueChange={(value) => setValue("testType", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.testType && (
                      <p className="text-destructive text-sm mt-1">{errors.testType.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Question Categories</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      {TEST_CATEGORIES.map((category) => (
                        <div key={category.name} className="flex items-center">
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
                            className="ml-2 text-sm text-slate-700"
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
                    <Label>Number of Questions</Label>
                    <div className="flex items-center mt-2">
                      <Slider
                        min={10}
                        max={100}
                        step={5}
                        value={[numQuestions]}
                        onValueChange={(value) => setValue("numQuestions", value[0])}
                        className="w-full"
                      />
                      <span className="ml-3 text-sm text-slate-600 min-w-[40px]">{numQuestions}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="timeLimit">Time Limit</Label>
                    <Select 
                      defaultValue={watch("timeLimit")}
                      onValueChange={(value) => setValue("timeLimit", value)}
                    >
                      <SelectTrigger className="w-full">
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
                    className="w-full py-3"
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Practice Test: {generatedTest.testType}</CardTitle>
                  <span className="text-sm text-slate-500">
                    Question {currentQuestion + 1} of {generatedTest.questions.length}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700">
                      {generatedTest.questions[currentQuestion].question}
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      <RadioGroup 
                        value={selectedAnswers[currentQuestion]?.toString()} 
                        onValueChange={(value) => selectAnswer(currentQuestion, parseInt(value))}
                      >
                        {generatedTest.questions[currentQuestion].options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="ml-2 text-slate-700">
                              {String.fromCharCode(65 + index)}) {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    {currentQuestion < generatedTest.questions.length - 1 ? (
                      <Button onClick={goToNextQuestion}>
                        Next Question
                      </Button>
                    ) : (
                      <Button>
                        Finish Test
                      </Button>
                    )}
                  </div>
                  
                  {/* Question navigation */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Question Navigator</h3>
                    <div className="grid grid-cols-10 gap-1">
                      {generatedTest.questions.map((_: any, index: number) => (
                        <Button
                          key={index}
                          variant={currentQuestion === index ? "default" : selectedAnswers[index] !== undefined ? "secondary" : "outline"}
                          className="h-8 w-8 p-0"
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
        </div>
      </main>
    </div>
  );
}
