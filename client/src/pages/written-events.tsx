import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <header className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-slate-800">Written Events</h1>
            <p className="text-slate-500 mt-1">Create, outline, and optimize your DECA written events</p>
          </header>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 max-w-md mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="outline">AI Outline</TabsTrigger>
              <TabsTrigger value="feedback">Get Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Written Event Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-file-alt text-primary-600"></i>
                        </div>
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                          Business Plan
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-800 mb-1">Business Growth Plan</h3>
                      <p className="text-sm text-slate-500 mb-4">A comprehensive template for business expansion strategies</p>
                      <Button className="w-full" variant="outline">View Template</Button>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-chart-line text-secondary-600"></i>
                        </div>
                        <span className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded-full font-medium">
                          Marketing Plan
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-800 mb-1">Marketing Campaign Strategy</h3>
                      <p className="text-sm text-slate-500 mb-4">Template for comprehensive marketing campaigns</p>
                      <Button className="w-full" variant="outline">View Template</Button>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-lightbulb text-accent-600"></i>
                        </div>
                        <span className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full font-medium">
                          Innovation Plan
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-800 mb-1">Product Innovation Blueprint</h3>
                      <p className="text-sm text-slate-500 mb-4">Template for new product development strategies</p>
                      <Button className="w-full" variant="outline">View Template</Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 border border-primary-100 bg-primary-50 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-crown text-primary-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">Pro Templates</h3>
                        <p className="text-slate-600 mt-1">
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
              <Card>
                <CardHeader>
                  <CardTitle>AI Written Event Outline Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Generate a Customized Outline</h3>
                    <p className="text-slate-600 mb-6">
                      Our AI will create a detailed outline for your written event based on your inputs. 
                      This tool helps you structure your document with appropriate sections, key points, and research areas.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                        <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>Business Growth & Opportunity Plan</option>
                          <option>Start-Up Business Plan</option>
                          <option>Business Solutions Project</option>
                          <option>Marketing Communications Plan</option>
                          <option>Franchise Business Plan</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry Focus</label>
                        <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>Retail</option>
                          <option>Technology</option>
                          <option>Food & Beverage</option>
                          <option>Healthcare</option>
                          <option>Financial Services</option>
                          <option>Entertainment</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
                        <textarea 
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                          rows={3}
                          placeholder="Briefly describe your business idea or project focus..."
                        ></textarea>
                      </div>
                      
                      <Button className="w-full" onClick={handleGenerateOutline}>
                        Generate Outline
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center p-6 border border-dashed border-slate-300 rounded-lg">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-file-alt text-slate-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700">No Outlines Generated Yet</h3>
                    <p className="text-slate-500 mt-2">
                      Generate your first outline to see it appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Written Event Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-lightbulb text-accent-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">AI-Powered Feedback</h3>
                        <p className="text-slate-600 mt-1">
                          Get comprehensive feedback on your written event from our AI system. 
                          Upload your document to receive suggestions on structure, content, grammar, and more.
                        </p>
                        
                        <div className="mt-4 p-4 bg-white rounded-lg border border-accent-200">
                          <h4 className="font-medium text-slate-700 text-sm">What you'll receive:</h4>
                          <ul className="mt-2 space-y-2">
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <i className="fas fa-check-circle text-accent-500 mt-0.5"></i>
                              <span>Analysis of structure and flow</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <i className="fas fa-check-circle text-accent-500 mt-0.5"></i>
                              <span>Content evaluation and suggestions</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <i className="fas fa-check-circle text-accent-500 mt-0.5"></i>
                              <span>Grammar and style improvements</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                              <i className="fas fa-check-circle text-accent-500 mt-0.5"></i>
                              <span>DECA judging criteria alignment</span>
                            </li>
                          </ul>
                        </div>
                        
                        <Button className="mt-4 w-full sm:w-auto">
                          Upload Document for Feedback
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="text-center p-6">
                    <h3 className="text-lg font-medium text-slate-700">No Previous Feedback</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                      You haven't requested any feedback yet. Upload a document to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
