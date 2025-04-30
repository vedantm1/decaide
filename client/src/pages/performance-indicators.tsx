import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PI_CATEGORIES } from "@shared/schema";

export default function PerformanceIndicatorsPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("Financial Analysis");
  const [expandedPI, setExpandedPI] = useState<number | null>(null);
  
  // Get performance indicators for the selected category
  const { data: performanceIndicators, isLoading } = useQuery({
    queryKey: ["/api/user/performance-indicators", selectedCategory],
    queryFn: async () => {
      const res = await fetch(`/api/user/performance-indicators?category=${encodeURIComponent(selectedCategory)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load performance indicators");
      return res.json();
    },
  });
  
  // Get user stats for progress display
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
  });
  
  // Update PI status mutation
  const updatePIStatus = useMutation({
    mutationFn: async ({ piId, status }: { piId: number, status: string }) => {
      const res = await apiRequest("POST", `/api/user/performance-indicators/${piId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/performance-indicators", selectedCategory] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Status Updated",
        description: "Performance indicator status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle marking PI as completed/uncompleted
  const togglePIStatus = (pi: any) => {
    const newStatus = pi.status === "completed" ? "not_started" : "completed";
    updatePIStatus.mutate({ piId: pi.id, status: newStatus });
  };
  
  // Handle marking PI as in progress
  const markPIInProgress = (pi: any) => {
    updatePIStatus.mutate({ piId: pi.id, status: "in_progress" });
  };
  
  return (
    <MainLayout>
      <PageHeader
        title="Performance Indicators"
        subtitle="Master the essential performance indicators for your DECA event"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PI Categories */}
        <div className="lg:col-span-1">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {PI_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-foreground mb-2">Your Progress</h3>
                <div className="bg-background/60 backdrop-blur-sm p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground/70">{selectedCategory}</span>
                    <span className="text-foreground font-medium">
                      {performanceIndicators?.filter((pi: any) => pi.status === "completed").length || 0}/
                      {performanceIndicators?.length || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${performanceIndicators?.length ? 
                          (performanceIndicators.filter((pi: any) => pi.status === "completed").length / performanceIndicators.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-1 mt-3">
                    <span className="text-foreground/70">Overall Progress</span>
                    <span className="text-foreground font-medium">
                      {stats?.completedPIs || 0}/{stats?.totalPIs || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.totalPIs ? (stats.completedPIs / stats.totalPIs) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* PI Details */}
        <div className="lg:col-span-2">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedCategory} PIs</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <i className="fas fa-print text-foreground/70"></i>
                </Button>
                <Button>
                  Study All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : performanceIndicators?.length ? (
                <div className="space-y-4">
                  {performanceIndicators.map((pi: any) => (
                    <div 
                      key={pi.id} 
                      className={`mb-4 border rounded-lg overflow-hidden backdrop-blur-sm ${
                        pi.status === "completed" 
                          ? "border-primary/30 bg-primary/10" 
                          : pi.status === "in_progress"
                          ? "border-accent/30 bg-accent/10"
                          : "border-muted bg-background/60"
                      }`}
                    >
                      <div 
                        className={`p-4 flex items-center justify-between cursor-pointer ${
                          pi.status === "completed" 
                            ? "bg-primary/20" 
                            : pi.status === "in_progress"
                            ? "bg-accent/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setExpandedPI(expandedPI === pi.id ? null : pi.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                              pi.status === "completed" 
                                ? "bg-primary" 
                                : pi.status === "in_progress"
                                ? "bg-accent"
                                : "bg-muted"
                            }`}
                          >
                            <i 
                              className={`fas ${
                                pi.status === "completed" 
                                  ? "fa-check" 
                                  : pi.status === "in_progress"
                                  ? "fa-sync-alt"
                                  : "fa-book"
                              } ${pi.status === "not_started" ? "text-foreground/40" : ""}`}
                            ></i>
                          </div>
                          <h3 
                            className={`font-medium ${
                              pi.status === "completed" 
                                ? "text-primary" 
                                : pi.status === "in_progress"
                                ? "text-accent"
                                : "text-foreground"
                            }`}
                          >
                            {pi.indicator}
                          </h3>
                        </div>
                        {pi.status === "in_progress" ? (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                            In Progress
                          </span>
                        ) : (
                          <i 
                            className={`fas ${
                              expandedPI === pi.id ? "fa-chevron-up" : "fa-chevron-down"
                            } ${
                              pi.status === "completed" 
                                ? "text-primary" 
                                : "text-foreground/40"
                            }`}
                          ></i>
                        )}
                      </div>
                      
                      {expandedPI === pi.id && (
                        <div className="p-4 bg-background/40 backdrop-blur-sm">
                          <p className="text-foreground/80 text-sm">
                            {pi.indicator} is a key concept in {selectedCategory}. It involves understanding the principles and applying them in business scenarios.
                          </p>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-foreground text-sm">Real-World Example:</h4>
                            <p className="text-foreground/80 text-sm mt-1">
                              At Tesla, this performance indicator was applied when the company needed to make strategic decisions about production scaling. The finance team analyzed various data points to ensure the company could maintain cash flow while expanding operations.
                            </p>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-foreground text-sm">Key Points to Remember:</h4>
                            <ul className="list-disc list-inside text-sm text-foreground/80 mt-1 space-y-1">
                              <li>Focus on practical applications rather than just theoretical knowledge</li>
                              <li>Connect this PI to the overall business strategy</li>
                              <li>Be prepared to cite specific examples during your roleplay</li>
                              <li>Understand how this PI relates to other concepts in {selectedCategory}</li>
                            </ul>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              onClick={() => togglePIStatus(pi)}
                            >
                              {pi.status === "completed" ? "Mark as Unlearned" : "Mark as Completed"}
                            </Button>
                            {pi.status !== "in_progress" ? (
                              <Button
                                onClick={() => markPIInProgress(pi)}
                              >
                                Start Learning
                              </Button>
                            ) : (
                              <Button>
                                Test My Knowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Load More Performance Indicators
                  </Button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-foreground/60">No performance indicators found for this category.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}