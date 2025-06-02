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


// Form schema for test generation
const testSchema = z.object({
  testType: z.string().min(1, "Please select a test type"),
  difficultyType: z.string().min(1, "Please select a difficulty type"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  numQuestions: z.number().min(10).max(100),
  timeLimit: z.string(),
});

type TestFormValues = z.infer<typeof testSchema>;

// Updated test types as requested
const TEST_TYPES = [
  "Business Management & Administration",
  "Business Administration Core",
  "Entrepreneurship", 
  "Finance",
  "Hospitality & Tourism",
  "Marketing",
  "Personal Financial Literacy"
];

// Difficulty types
const DIFFICULTY_TYPES = [
  "District",
  "State", 
  "ICDC"
];

// Test categories with authentic DECA exam blueprint data
const EXAM_BLUEPRINTS = {
  "Business Administration Core": {
    "District": {
      "Business Law": 1,
      "Communications": 15,
      "Customer Relations": 5,
      "Economics": 7,
      "Emotional Intelligence": 22,
      "Entrepreneurship": 0,
      "Financial Analysis": 16,
      "Human Resources Management": 1,
      "Information Management": 10,
      "Marketing": 1,
      "Operations": 11,
      "Professional Development": 11,
      "Strategic Management": 0
    },
    "Association": {
      "Business Law": 1,
      "Communications": 15,
      "Customer Relations": 5,
      "Economics": 7,
      "Emotional Intelligence": 22,
      "Entrepreneurship": 0,
      "Financial Analysis": 16,
      "Human Resources Management": 1,
      "Information Management": 10,
      "Marketing": 1,
      "Operations": 11,
      "Professional Development": 11,
      "Strategic Management": 0
    },
    "ICDC": {
      "Business Law": 4,
      "Communications": 11,
      "Customer Relations": 4,
      "Economics": 12,
      "Emotional Intelligence": 19,
      "Entrepreneurship": 1,
      "Financial Analysis": 13,
      "Human Resources Management": 1,
      "Information Management": 11,
      "Marketing": 1,
      "Operations": 13,
      "Professional Development": 9,
      "Strategic Management": 1
    }
  },
  "Business Management & Administration": {
    "District": {
      "Business Law": 5,
      "Communications": 7,
      "Customer Relations": 2,
      "Economics": 6,
      "Emotional Intelligence": 9,
      "Entrepreneurship": 1,
      "Financial Analysis": 7,
      "Human Resources Management": 1,
      "Information Management": 7,
      "Knowledge Management": 6,
      "Marketing": 1,
      "Operations": 21,
      "Professional Development": 6,
      "Project Management": 6,
      "Quality Management": 3,
      "Risk Management": 4,
      "Strategic Management": 8
    },
    "Association": {
      "Business Law": 5,
      "Communications": 6,
      "Customer Relations": 2,
      "Economics": 5,
      "Emotional Intelligence": 8,
      "Entrepreneurship": 0,
      "Financial Analysis": 6,
      "Human Resources Management": 0,
      "Information Management": 6,
      "Knowledge Management": 7,
      "Marketing": 1,
      "Operations": 24,
      "Professional Development": 5,
      "Project Management": 7,
      "Quality Management": 4,
      "Risk Management": 5,
      "Strategic Management": 9
    },
    "ICDC": {
      "Business Law": 5,
      "Communications": 6,
      "Customer Relations": 1,
      "Economics": 4,
      "Emotional Intelligence": 6,
      "Entrepreneurship": 0,
      "Financial Analysis": 5,
      "Human Resources Management": 0,
      "Information Management": 6,
      "Knowledge Management": 9,
      "Marketing": 1,
      "Operations": 26,
      "Professional Development": 4,
      "Project Management": 8,
      "Quality Management": 5,
      "Risk Management": 5,
      "Strategic Management": 10
    }
  },
  "Entrepreneurship": {
    "District": {
      "Business Law": 4,
      "Channel Management": 3,
      "Communications": 1,
      "Customer Relations": 1,
      "Economics": 3,
      "Emotional Intelligence": 6,
      "Entrepreneurship": 14,
      "Financial Analysis": 10,
      "Human Resources Management": 5,
      "Information Management": 4,
      "Market Planning": 5,
      "Marketing": 1,
      "Marketing-Information Management": 2,
      "Operations": 13,
      "Pricing": 2,
      "Product/Service Management": 4,
      "Professional Development": 5,
      "Promotion": 6,
      "Quality Management": 1,
      "Risk Management": 2,
      "Selling": 1,
      "Strategic Management": 7
    },
    "Association": {
      "Business Law": 4,
      "Channel Management": 3,
      "Communications": 0,
      "Customer Relations": 1,
      "Economics": 3,
      "Emotional Intelligence": 6,
      "Entrepreneurship": 13,
      "Financial Analysis": 9,
      "Human Resources Management": 4,
      "Information Management": 3,
      "Market Planning": 6,
      "Marketing": 1,
      "Marketing-Information Management": 3,
      "Operations": 13,
      "Pricing": 3,
      "Product/Service Management": 4,
      "Professional Development": 5,
      "Promotion": 7,
      "Quality Management": 1,
      "Risk Management": 3,
      "Selling": 1,
      "Strategic Management": 7
    },
    "ICDC": {
      "Business Law": 3,
      "Channel Management": 3,
      "Communications": 1,
      "Customer Relations": 1,
      "Economics": 2,
      "Emotional Intelligence": 4,
      "Entrepreneurship": 14,
      "Financial Analysis": 11,
      "Human Resources Management": 4,
      "Information Management": 2,
      "Market Planning": 6,
      "Marketing": 1,
      "Marketing-Information Management": 2,
      "Operations": 14,
      "Pricing": 2,
      "Product/Service Management": 4,
      "Professional Development": 4,
      "Promotion": 8,
      "Quality Management": 1,
      "Risk Management": 4,
      "Selling": 1,
      "Strategic Management": 8
    }
  },
  "Finance": {
    "District": {
      "Business Law": 7,
      "Communications": 5,
      "Customer Relations": 5,
      "Economics": 6,
      "Emotional Intelligence": 9,
      "Entrepreneurship": 1,
      "Financial Analysis": 24,
      "Financial-Information Management": 9,
      "Human Resources Management": 1,
      "Information Management": 6,
      "Marketing": 1,
      "Operations": 6,
      "Professional Development": 13,
      "Risk Management": 6,
      "Strategic Management": 1
    },
    "Association": {
      "Business Law": 8,
      "Communications": 4,
      "Customer Relations": 5,
      "Economics": 5,
      "Emotional Intelligence": 8,
      "Entrepreneurship": 0,
      "Financial Analysis": 28,
      "Financial-Information Management": 10,
      "Human Resources Management": 0,
      "Information Management": 5,
      "Marketing": 1,
      "Operations": 5,
      "Professional Development": 14,
      "Risk Management": 7,
      "Strategic Management": 0
    },
    "ICDC": {
      "Business Law": 7,
      "Communications": 3,
      "Customer Relations": 4,
      "Economics": 4,
      "Emotional Intelligence": 6,
      "Entrepreneurship": 0,
      "Financial Analysis": 30,
      "Financial-Information Management": 12,
      "Human Resources Management": 0,
      "Information Management": 5,
      "Marketing": 1,
      "Operations": 4,
      "Professional Development": 15,
      "Risk Management": 9,
      "Strategic Management": 0
    }
  },
  "Hospitality & Tourism": {
    "District": {
      "Business Law": 3,
      "Communications": 5,
      "Customer Relations": 8,
      "Economics": 6,
      "Emotional Intelligence": 9,
      "Entrepreneurship": 1,
      "Financial Analysis": 8,
      "Human Resources Management": 2,
      "Information Management": 14,
      "Knowledge Management": 0,
      "Market Planning": 1,
      "Marketing": 1,
      "Operations": 13,
      "Pricing": 1,
      "Product/Service Management": 6,
      "Professional Development": 8,
      "Promotion": 2,
      "Quality Management": 1,
      "Risk Management": 1,
      "Selling": 7,
      "Strategic Management": 3
    },
    "Association": {
      "Business Law": 3,
      "Communications": 4,
      "Customer Relations": 9,
      "Economics": 6,
      "Emotional Intelligence": 9,
      "Entrepreneurship": 0,
      "Financial Analysis": 7,
      "Human Resources Management": 1,
      "Information Management": 15,
      "Knowledge Management": 1,
      "Market Planning": 1,
      "Marketing": 1,
      "Operations": 13,
      "Pricing": 1,
      "Product/Service Management": 7,
      "Professional Development": 7,
      "Promotion": 3,
      "Quality Management": 1,
      "Risk Management": 1,
      "Selling": 8,
      "Strategic Management": 2
    },
    "ICDC": {
      "Business Law": 2,
      "Communications": 3,
      "Customer Relations": 9,
      "Economics": 5,
      "Emotional Intelligence": 7,
      "Entrepreneurship": 0,
      "Financial Analysis": 7,
      "Human Resources Management": 1,
      "Information Management": 15,
      "Knowledge Management": 1,
      "Market Planning": 2,
      "Marketing": 2,
      "Operations": 13,
      "Pricing": 1,
      "Product/Service Management": 9,
      "Professional Development": 6,
      "Promotion": 3,
      "Quality Management": 1,
      "Risk Management": 2,
      "Selling": 9,
      "Strategic Management": 2
    }
  },
  "Marketing": {
    "District": {
      "Business Law": 2,
      "Channel Management": 5,
      "Communications": 5,
      "Customer Relations": 2,
      "Economics": 6,
      "Emotional Intelligence": 9,
      "Entrepreneurship": 1,
      "Financial Analysis": 6,
      "Human Resources Management": 1,
      "Information Management": 5,
      "Market Planning": 4,
      "Marketing": 1,
      "Marketing-Information Management": 11,
      "Operations": 6,
      "Pricing": 3,
      "Product/Service Management": 11,
      "Professional Development": 6,
      "Promotion": 9,
      "Selling": 6,
      "Strategic Management": 1
    },
    "Association": {
      "Business Law": 2,
      "Channel Management": 6,
      "Communications": 4,
      "Customer Relations": 2,
      "Economics": 5,
      "Emotional Intelligence": 8,
      "Entrepreneurship": 0,
      "Financial Analysis": 5,
      "Human Resources Management": 0,
      "Information Management": 4,
      "Market Planning": 4,
      "Marketing": 1,
      "Marketing-Information Management": 14,
      "Operations": 5,
      "Pricing": 4,
      "Product/Service Management": 13,
      "Professional Development": 5,
      "Promotion": 11,
      "Selling": 7,
      "Strategic Management": 0
    },
    "ICDC": {
      "Business Law": 1,
      "Channel Management": 7,
      "Communications": 3,
      "Customer Relations": 1,
      "Economics": 4,
      "Emotional Intelligence": 6,
      "Entrepreneurship": 0,
      "Financial Analysis": 4,
      "Human Resources Management": 0,
      "Information Management": 3,
      "Market Planning": 5,
      "Marketing": 1,
      "Marketing-Information Management": 16,
      "Operations": 4,
      "Pricing": 4,
      "Product/Service Management": 15,
      "Professional Development": 5,
      "Promotion": 13,
      "Selling": 8,
      "Strategic Management": 0
    }
  },
  "Personal Financial Literacy": {
    "District": {
      "Earning Income": 25,
      "Spending": 14,
      "Saving": 15,
      "Investing": 15,
      "Managing Credit": 16,
      "Managing Risk": 15
    },
    "Association": {
      "Earning Income": 20,
      "Spending": 14,
      "Saving": 14,
      "Investing": 19,
      "Managing Credit": 19,
      "Managing Risk": 14
    },
    "ICDC": {
      "Earning Income": 16,
      "Spending": 14,
      "Saving": 13,
      "Investing": 21,
      "Managing Credit": 21,
      "Managing Risk": 15
    }
  }
};

// Function to get categories for selected test type and difficulty
const getTestCategories = (testType: string, difficultyType: string) => {
  const blueprint = EXAM_BLUEPRINTS[testType as keyof typeof EXAM_BLUEPRINTS];
  if (!blueprint) return [];
  
  const categories = blueprint[difficultyType as keyof typeof blueprint];
  if (!categories) return [];
  
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
};

// Time limit options
const TIME_LIMITS = [
  "No Time Limit",
  "30 Minutes",
  "60 Minutes",
  "90 Minutes (Standard)",
  "120 Minutes",
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
      difficultyType: "District",
      categories: getTestCategories("Business Management & Administration", "District").map(cat => cat.name),
      numQuestions: 50,
      timeLimit: "120 Minutes (Standard)",
    },
  });
  
  // Watch for form values
  const numQuestions = watch("numQuestions");
  const selectedTestType = watch("testType");
  const selectedDifficultyType = watch("difficultyType");
  
  // Get current test categories based on selections
  const currentCategories = getTestCategories(selectedTestType, selectedDifficultyType);
  
  // Update categories when test type or difficulty changes
  useEffect(() => {
    const newCategories = getTestCategories(selectedTestType, selectedDifficultyType);
    setValue("categories", newCategories.map(cat => cat.name));
  }, [selectedTestType, selectedDifficultyType, setValue]);
  
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
