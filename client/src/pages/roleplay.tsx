import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PI_CATEGORIES } from "@shared/schema";

// Form schema for roleplay generation
const roleplaySchema = z.object({
  instructionalArea: z.string().min(1, "Please select an instructional area"),
  performanceIndicators: z.array(z.string()).min(1, "Select at least one performance indicator"),
  competitionLevel: z.string().min(1, "Please select a competition level"),
  businessType: z.string().optional(),
});

type RoleplayFormValues = z.infer<typeof roleplaySchema>;

export default function RoleplayPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("Financial Analysis");
  const [generatedRoleplay, setGeneratedRoleplay] = useState<any>(null);
  const [prepTimerActive, setPrepTimerActive] = useState(false);
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(600); // 10 minutes in seconds
  
  // Get performance indicators for the selected category
  const { data: performanceIndicators, isLoading: pisLoading } = useQuery({
    queryKey: ["/api/user/performance-indicators", selectedCategory],
    queryFn: async () => {
      const res = await fetch(`/api/user/performance-indicators?category=${encodeURIComponent(selectedCategory)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load performance indicators");
      return res.json();
    },
  });
  
  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoleplayFormValues>({
    resolver: zodResolver(roleplaySchema),
    defaultValues: {
      instructionalArea: selectedCategory,
      performanceIndicators: [],
      competitionLevel: "District",
      businessType: "",
    },
  });
  
  // Watch competition level for display
  const competitionLevel = watch("competitionLevel");
  const competitionLevels = ["District", "Association", "ICDC"];
  
  // Generate roleplay mutation
  const generateRoleplay = useMutation({
    mutationFn: async (data: RoleplayFormValues) => {
      const res = await apiRequest("POST", "/api/roleplay/generate", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedRoleplay(data);
      toast({
        title: "Roleplay Generated",
        description: "Your roleplay scenario is ready!",
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
  const onSubmit = (data: RoleplayFormValues) => {
    generateRoleplay.mutate(data);
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setValue("instructionalArea", value);
    setValue("performanceIndicators", []);
  };
  
  // Prep timer functions
  const startPrepTimer = () => {
    setPrepTimerActive(true);
    // Timer logic would be implemented here
  };
  
  const stopPrepTimer = () => {
    setPrepTimerActive(false);
  };
  
  const resetPrepTimer = () => {
    setPrepTimeRemaining(600);
    setPrepTimerActive(false);
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <MainLayout>
      <PageHeader
        title="Roleplay Practice"
        subtitle="Generate custom roleplays to practice your presentation skills"
      />
      
      {!generatedRoleplay ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Generate a New Roleplay</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="instructionalArea">Instructional Area</Label>
                <Select 
                  defaultValue={selectedCategory} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select instructional area" />
                  </SelectTrigger>
                  <SelectContent>
                    {PI_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.instructionalArea && (
                  <p className="text-destructive text-sm mt-1">{errors.instructionalArea.message}</p>
                )}
              </div>
              
              <div>
                <Label>Performance Indicators (Select 3-5)</Label>
                {pisLoading ? (
                  <div className="py-4 flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {performanceIndicators?.map((pi: any) => (
                      <div key={pi.id} className="flex items-center">
                        <Checkbox 
                          id={`pi-${pi.id}`} 
                          value={pi.indicator}
                          onCheckedChange={(checked) => {
                            const current = watch("performanceIndicators");
                            if (checked) {
                              setValue("performanceIndicators", [...current, pi.indicator]);
                            } else {
                              setValue(
                                "performanceIndicators", 
                                current.filter((item) => item !== pi.indicator)
                              );
                            }
                          }}
                        />
                        <label 
                          htmlFor={`pi-${pi.id}`} 
                          className="ml-2 text-sm text-foreground/80"
                        >
                          {pi.indicator}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {errors.performanceIndicators && (
                  <p className="text-destructive text-sm mt-1">{errors.performanceIndicators.message}</p>
                )}
              </div>
              
              <div>
                <Label>Competition Level</Label>
                <Select 
                  value={competitionLevel} 
                  onValueChange={(value) => setValue("competitionLevel", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select competition level" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitionLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.competitionLevel && (
                  <p className="text-destructive text-sm mt-1">{errors.competitionLevel.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="businessType">Business Type (Optional)</Label>
                <Input 
                  id="businessType"
                  placeholder="e.g., Retail store, Hotel, Financial firm"
                  {...register("businessType")}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-3"
                disabled={generateRoleplay.isPending}
              >
                {generateRoleplay.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </div>
                ) : (
                  "Generate Roleplay"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Roleplay Scenario</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <i className="fas fa-print text-foreground/70"></i>
                </Button>
                <Button variant="outline" size="icon">
                  <i className="fas fa-download text-foreground/70"></i>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg mb-4">
                <h3 className="font-bold text-foreground">{generatedRoleplay.title}</h3>
                <p className="text-sm text-foreground/80 mt-2">
                  {generatedRoleplay.scenario}
                </p>
                
                <div className="mt-4">
                  <h4 className="font-medium text-foreground text-sm">Performance Indicators:</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 mt-1 space-y-1">
                    {generatedRoleplay.performanceIndicators.map((pi: string, index: number) => (
                      <li key={index}>{pi}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-foreground text-sm">You will meet with:</h4>
                  <p className="text-sm text-foreground/80 mt-1">{generatedRoleplay.meetWith}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <div className="md:w-1/2">
                  <h3 className="font-medium text-foreground mb-2">Prep Timer</h3>
                  <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{formatTime(prepTimeRemaining)}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant={prepTimerActive ? "outline" : "default"}
                          onClick={prepTimerActive ? stopPrepTimer : startPrepTimer}
                        >
                          <i className={`fas fa-${prepTimerActive ? 'pause' : 'play'} text-xs`}></i>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={stopPrepTimer}
                        >
                          <i className="fas fa-stop text-xs"></i>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={resetPrepTimer}
                        >
                          <i className="fas fa-redo text-xs"></i>
                        </Button>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mt-3">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(prepTimeRemaining / 600) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="font-medium text-foreground mb-2">Presentation Tips</h3>
                  <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg">
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle text-primary mt-0.5"></i>
                        <span>Focus on how your solution addresses each performance indicator</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle text-primary mt-0.5"></i>
                        <span>Provide specific examples and evidence to support your points</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle text-primary mt-0.5"></i>
                        <span>Structure your presentation with a clear introduction and conclusion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button className="py-2.5">
                  Start Presentation
                </Button>
                <Button 
                  variant="outline" 
                  className="py-2.5"
                  onClick={() => setGeneratedRoleplay(null)}
                >
                  Generate New Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
