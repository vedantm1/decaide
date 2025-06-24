import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Clock, Play, Pause, RotateCcw } from "lucide-react";
import { DECA_EVENTS, DECA_CLUSTERS } from "@shared/schema";

// Form schema for event-based roleplay generation
const roleplaySchema = z.object({
  instructionalArea: z.string().min(1, "Please select an instructional area"),
  performanceIndicators: z.array(z.string()).min(1, "Select at least one performance indicator"),
  competitionLevel: z.string().min(1, "Please select a competition level"),
});

type RoleplayFormValues = z.infer<typeof roleplaySchema>;

export default function RoleplayNewPage() {
  const { toast } = useToast();
  const [generatedRoleplay, setGeneratedRoleplay] = useState<any>(null);
  const [prepTimerActive, setPrepTimerActive] = useState(false);
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(600); // 10 minutes in seconds

  // Get current user data to determine their selected event
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load user data");
      return res.json();
    },
  });

  // Find user's event and cluster
  const userEvent = user?.eventCode ? DECA_EVENTS.find(event => event.code === user.eventCode) : null;
  const userCluster = userEvent?.cluster;

  // Form setup
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoleplayFormValues>({
    resolver: zodResolver(roleplaySchema),
    defaultValues: {
      instructionalArea: "",
      performanceIndicators: [],
      competitionLevel: "District",
    },
  });

  const competitionLevel = watch("competitionLevel");
  const competitionLevels = ["District", "Association", "ICDC"];

  // Generate roleplay mutation
  const generateRoleplay = useMutation({
    mutationFn: async (data: RoleplayFormValues) => {
      return apiRequest(`/api/generate-roleplay`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (roleplay) => {
      setGeneratedRoleplay(roleplay);
      toast({
        title: "Roleplay Generated!",
        description: "Your personalized DECA roleplay scenario is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate roleplay scenario",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RoleplayFormValues) => {
    generateRoleplay.mutate(data);
  };

  // Prep timer functions
  const startPrepTimer = () => {
    setPrepTimerActive(true);
  };

  const stopPrepTimer = () => {
    setPrepTimerActive(false);
  };

  const resetPrepTimer = () => {
    setPrepTimerActive(false);
    setPrepTimeRemaining(600);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (prepTimerActive && prepTimeRemaining > 0) {
      interval = setInterval(() => {
        setPrepTimeRemaining(prev => {
          if (prev <= 1) {
            setPrepTimerActive(false);
            toast({
              title: "Prep Time Complete!",
              description: "Time to start your presentation.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [prepTimerActive, prepTimeRemaining, toast]);

  if (userLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (!userEvent) {
    return (
      <MainLayout>
        <PageHeader
          title="Event-Based Roleplay Practice"
          subtitle="Practice roleplay scenarios tailored to your DECA event"
        />
        
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Event Selection Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To access personalized roleplay scenarios, you need to select your DECA event first. 
              This ensures you get relevant practice materials tailored to your specific competition category.
            </p>
            <Button onClick={() => window.location.href = "/settings"} className="w-full">
              Select Your DECA Event
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Event-Based Roleplay Practice"
        subtitle={`Practice ${userEvent.name} roleplay scenarios`}
      />
      
      {/* Event and Cluster Info */}
      <Card className="bg-background/60 backdrop-blur-sm border-muted mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Unlock className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-foreground">Your Selected Event</h3>
              </div>
              <p className="text-lg font-medium text-foreground">{userEvent.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{userEvent.type}</Badge>
                <Badge variant="outline">{userCluster}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!generatedRoleplay ? (
        <Card className="bg-background/60 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Generate Event-Specific Roleplay</CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your {userCluster} cluster
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label className="text-foreground/80">Instructional Area</Label>
                <Select onValueChange={(value) => setValue("instructionalArea", value)}>
                  <SelectTrigger className="w-full bg-background/80 mt-2">
                    <SelectValue placeholder="Select instructional area for your cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder">Coming Soon - Cluster-specific areas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.instructionalArea && (
                  <p className="text-destructive text-sm mt-1">{errors.instructionalArea.message}</p>
                )}
              </div>

              <div>
                <Label className="text-foreground/80">Performance Indicators</Label>
                <div className="bg-background/80 border rounded-md p-3 mt-2 min-h-[100px] flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    Performance indicators will be loaded based on your selected instructional area
                  </p>
                </div>
                {errors.performanceIndicators && (
                  <p className="text-destructive text-sm mt-1">{errors.performanceIndicators.message}</p>
                )}
              </div>

              <div>
                <Label className="text-foreground/80">Competition Level</Label>
                <Select 
                  value={competitionLevel} 
                  onValueChange={(value) => setValue("competitionLevel", value)}
                >
                  <SelectTrigger className="w-full bg-background/80 mt-2">
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
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
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
                    {generatedRoleplay.performanceIndicators?.map((pi: string, index: number) => (
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
                      <span className="text-foreground font-medium text-xl">{formatTime(prepTimeRemaining)}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant={prepTimerActive ? "outline" : "default"}
                          onClick={prepTimerActive ? stopPrepTimer : startPrepTimer}
                        >
                          {prepTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={resetPrepTimer}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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