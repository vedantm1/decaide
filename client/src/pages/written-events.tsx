import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function WrittenEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  
  // Query to fetch templates (would connect to backend in production)
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/written-events/templates"],
    enabled: !!user,
    queryFn: async () => {
      // Disabled to prevent showing mock data in production
      return [];
    }
  });

  // Generate outline handler
  const handleGenerateOutline = () => {
    toast({
      title: "Premium Feature",
      description: "Upgrade to Pro to use this feature",
      variant: "default",
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Written Events"
        subtitle="Create, outline, and optimize your DECA written events"
      />
          
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="outline">AI Outline</TabsTrigger>
          <TabsTrigger value="feedback">Get Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Written Event Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-background/80 border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-alt text-primary"></i>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      Business Plan
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Business Growth Plan</h3>
                  <p className="text-sm text-muted-foreground mb-4">A comprehensive template for business expansion strategies</p>
                  <Button className="w-full" variant="outline">View Template</Button>
                </div>
                
                <div className="bg-background/80 border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-line text-secondary"></i>
                    </div>
                    <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">
                      Marketing Plan
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Marketing Campaign Strategy</h3>
                  <p className="text-sm text-muted-foreground mb-4">Template for comprehensive marketing campaigns</p>
                  <Button className="w-full" variant="outline">View Template</Button>
                </div>
                
                <div className="bg-background/80 border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-lightbulb text-primary"></i>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      Innovation Plan
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Product Innovation Blueprint</h3>
                  <p className="text-sm text-muted-foreground mb-4">Template for new product development strategies</p>
                  <Button className="w-full" variant="outline">View Template</Button>
                </div>
              </div>
              
              <div className="mt-8 border border-primary/20 bg-primary/5 backdrop-blur-sm rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-crown text-primary text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Pro Templates</h3>
                    <p className="text-muted-foreground mt-1">
                      Unlock 15+ premium templates with industry-specific insights and strategies tailored to your DECA event category.
                    </p>
                  </div>
                  <Button className="mt-4 md:mt-0">Upgrade to Pro</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outline">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>AI Written Event Outline Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background/80 border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Generate a Customized Outline</h3>
                <p className="text-muted-foreground mb-6">
                  Our AI will create a detailed outline for your written event based on your inputs. 
                  This tool helps you structure your document with appropriate sections, key points, and research areas.
                </p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Event Type</label>
                    <Select>
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">Business Growth & Opportunity Plan</SelectItem>
                        <SelectItem value="startup">Start-Up Business Plan</SelectItem>
                        <SelectItem value="solutions">Business Solutions Project</SelectItem>
                        <SelectItem value="marketing">Marketing Communications Plan</SelectItem>
                        <SelectItem value="franchise">Franchise Business Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Industry Focus</label>
                    <Select>
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Financial Services</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Brief Description</label>
                    <Textarea 
                      className="bg-background/80 resize-none" 
                      rows={3}
                      placeholder="Briefly describe your business idea or project focus..."
                    />
                  </div>
                  
                  <Button className="w-full py-6 mt-2" onClick={handleGenerateOutline}>
                    Generate Outline
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center p-8 border border-dashed border-border rounded-lg bg-background/30">
                <div className="w-16 h-16 bg-background/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-muted-foreground text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-foreground">No Outlines Generated Yet</h3>
                <p className="text-muted-foreground mt-2">
                  Generate your first outline to see it appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Written Event Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-lightbulb text-primary text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">AI-Powered Feedback</h3>
                    <p className="text-muted-foreground mt-2">
                      Get comprehensive feedback on your written event from our AI system. 
                      Upload your document to receive suggestions on structure, content, grammar, and more.
                    </p>
                    
                    <div className="mt-6 p-4 bg-background/80 rounded-lg border border-border">
                      <h4 className="font-medium text-foreground text-sm">What you'll receive:</h4>
                      <ul className="mt-3 space-y-3">
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <i className="fas fa-check-circle text-primary mt-0.5"></i>
                          <span>Analysis of structure and flow</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <i className="fas fa-check-circle text-primary mt-0.5"></i>
                          <span>Content evaluation and suggestions</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <i className="fas fa-check-circle text-primary mt-0.5"></i>
                          <span>Grammar and style improvements</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <i className="fas fa-check-circle text-primary mt-0.5"></i>
                          <span>DECA judging criteria alignment</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button className="mt-6 px-6 py-5">
                      Upload Document for Feedback
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div className="text-center p-8 bg-background/30 rounded-lg">
                <h3 className="text-lg font-medium text-foreground">No Previous Feedback</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  You haven't requested any feedback yet. Upload a document to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
