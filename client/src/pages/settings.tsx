import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EVENT_TYPE_GROUPS } from "@shared/schema";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";

// Profile form schema
const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  eventType: z.string().min(1, { message: "Please select an event type" }),
  instructionalArea: z.string().min(1, { message: "Please select an instructional area" }),
});

// Notification form schema
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  dailyReminders: z.boolean(),
  weeklyProgressReports: z.boolean(),
  streakAlerts: z.boolean(),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { triggerAnimation } = useMicroInteractions();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Appearance settings state
  const [appearance, setAppearance] = useState({
    theme: "light",
    colorScheme: "aquaBlue",
    fontSize: "medium",
    visualStyle: "memphis"
  });
  
  // Update appearance settings mutation
  const updateAppearance = useMutation({
    mutationFn: async (data: any) => {
      // This would connect to a real endpoint in production
      // For now we'll just return the data to simulate a successful update
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Appearance Updated",
        description: "Your theme preferences have been saved.",
      });
      triggerAnimation('confetti', 'Theme Updated!');
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: "",
      eventType: user?.eventType || "",
      instructionalArea: user?.instructionalArea || "",
    },
  });
  
  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      dailyReminders: true,
      weeklyProgressReports: false,
      streakAlerts: true,
    },
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("POST", "/api/user/settings", {
        eventType: data.eventType,
        instructionalArea: data.instructionalArea,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been updated successfully.",
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
  
  // Update notification settings mutation
  const updateNotifications = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      // Would connect to a real endpoint in production
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
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
  
  // Profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(data);
  };
  
  // Notification form submission
  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    updateNotifications.mutate(data);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <header className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-slate-800">Settings</h1>
            <p className="text-slate-500 mt-1">Manage your account preferences and settings</p>
          </header>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 max-w-md mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Your username cannot be changed after registration.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="your.email@example.com" />
                            </FormControl>
                            <FormDescription>
                              Your email is used for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <div className="text-sm font-medium text-slate-700 mb-4">DECA Competition Settings</div>
                      
                      <FormField
                        control={profileForm.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your DECA event" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EVENT_TYPE_GROUPS.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This helps us customize content for your specific DECA event.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="instructionalArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructional Area</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your instructional area" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Financial Analysis">Financial Analysis</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Hospitality">Hospitality & Tourism</SelectItem>
                                <SelectItem value="Management">Business Management</SelectItem>
                                <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This focuses your performance indicators and roleplay scenarios.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="dailyReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Daily Practice Reminders</FormLabel>
                              <FormDescription>
                                Receive daily reminders to practice
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyProgressReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Weekly Progress Reports</FormLabel>
                              <FormDescription>
                                Receive weekly summaries of your progress
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="streakAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Streak Alerts</FormLabel>
                              <FormDescription>
                                Get notified to maintain your practice streak
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={updateNotifications.isPending}
                      >
                        {updateNotifications.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </div>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className="border border-primary rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
                          onClick={() => setAppearance(prev => ({...prev, theme: "light"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-white to-blue-50 mb-0 rounded-t"></div>
                          <div className="text-sm font-medium text-center py-2 bg-white">Light</div>
                        </div>
                        <div 
                          className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
                          onClick={() => setAppearance(prev => ({...prev, theme: "dark"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-slate-700 to-slate-900 mb-0 rounded-t"></div>
                          <div className="text-sm font-medium text-center py-2 bg-white">Dark</div>
                        </div>
                        <div 
                          className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
                          onClick={() => setAppearance(prev => ({...prev, theme: "system"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-white to-slate-800 mb-0 rounded-t"></div>
                          <div className="text-sm font-medium text-center py-2 bg-white">System</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">DECA Cluster Themes</h3>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "business"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-yellow-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-yellow-500"></div>
                              <div className="w-full h-2 rounded-sm bg-yellow-400"></div>
                              <div className="w-full h-2 rounded-sm bg-yellow-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-yellow-700">Business Management</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <p className="text-xs text-slate-600">BMA, ENT, BLTDM, HRM</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "finance"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-green-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-green-500"></div>
                              <div className="w-full h-2 rounded-sm bg-green-400"></div>
                              <div className="w-full h-2 rounded-sm bg-green-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-green-700">Finance</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <p className="text-xs text-slate-600">ACT, BFS, FTDM, FCE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "hospitality"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-blue-500"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-400"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-blue-700">Hospitality & Tourism</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <p className="text-xs text-slate-600">HLM, HTDM, HTPS, RFSM</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "marketing"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-red-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-red-500"></div>
                              <div className="w-full h-2 rounded-sm bg-red-400"></div>
                              <div className="w-full h-2 rounded-sm bg-red-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-red-700">Marketing</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <p className="text-xs text-slate-600">AAM, ASM, BSM, FMS, MCS, RMS</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "entrepreneurship"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-gray-500"></div>
                              <div className="w-full h-2 rounded-sm bg-gray-400"></div>
                              <div className="w-full h-2 rounded-sm bg-gray-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-700">Entrepreneurship</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                                <p className="text-xs text-slate-600">EIP, ESB, EIB, IBP</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "admin"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-indigo-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-indigo-800"></div>
                              <div className="w-full h-2 rounded-sm bg-indigo-700"></div>
                              <div className="w-full h-2 rounded-sm bg-indigo-600"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-indigo-800">Business Admin Core</span>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-indigo-800"></span>
                                <p className="text-xs text-slate-600">PFL, PBM, PMK</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Additional UI Themes</h3>
                      <div className="grid grid-cols-4 gap-3 mb-2">
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "aquaBlue"}))}
                        >
                          <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-blue-500"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-400"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-blue-700">Aqua Blue</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "coralPink"}))}
                        >
                          <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-pink-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-pink-500"></div>
                              <div className="w-full h-2 rounded-sm bg-pink-400"></div>
                              <div className="w-full h-2 rounded-sm bg-pink-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-pink-700">Coral Pink</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "mintGreen"}))}
                        >
                          <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-green-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-green-500"></div>
                              <div className="w-full h-2 rounded-sm bg-green-400"></div>
                              <div className="w-full h-2 rounded-sm bg-green-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-green-700">Mint Green</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "royalPurple"}))}
                        >
                          <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-purple-50">
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-purple-500"></div>
                              <div className="w-full h-2 rounded-sm bg-purple-400"></div>
                              <div className="w-full h-2 rounded-sm bg-purple-300"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-purple-700">Royal Purple</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Visual Style</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, visualStyle: "memphis"}))}
                        >
                          <div className="p-4 h-24 bg-white bg-opacity-90 relative rounded-md overflow-hidden">
                            {/* Memphis-style patterns */}
                            <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-blue-300"></div>
                            <div className="absolute top-6 left-2 w-12 h-2 rounded-md bg-blue-400"></div>
                            <div className="absolute bottom-3 right-8 w-6 h-6 border-2 border-yellow-400"></div>
                            <div className="absolute bottom-10 left-10 w-3 h-3 bg-pink-300 rotate-45"></div>
                            <div className="absolute top-1/2 right-1/3 w-8 h-1 bg-green-300"></div>
                            <div className="mt-14">
                              <span className="text-sm font-medium text-slate-800">Memphis Style</span>
                              <p className="text-xs text-slate-600">Vibrant & playful design</p>
                            </div>
                          </div>
                        </div>
                        <div 
                          className="relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ring-border hover:scale-[1.02] shadow-sm"
                          onClick={() => setAppearance(prev => ({...prev, visualStyle: "minimalist"}))}
                        >
                          <div className="p-4 h-24 bg-white relative rounded-md overflow-hidden">
                            {/* Clean minimalist design */}
                            <div className="absolute top-4 left-4 w-12 h-0.5 bg-blue-400"></div>
                            <div className="absolute top-7 left-4 w-8 h-0.5 bg-blue-300"></div>
                            <div className="absolute top-10 left-4 w-5 h-0.5 bg-blue-200"></div>
                            <div className="absolute top-16 left-4 w-3 h-3 rounded-full border border-slate-300"></div>
                            <div className="mt-14">
                              <span className="text-sm font-medium text-slate-800">Minimalist</span>
                              <p className="text-xs text-slate-600">Clean & focused design</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Font Size</h3>
                      <RadioGroup
                        value={appearance.fontSize}
                        onValueChange={(value) => setAppearance(prev => ({...prev, fontSize: value}))}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="small" id="fontSize-small" />
                          <label htmlFor="fontSize-small" className="text-sm text-slate-700 cursor-pointer">Small</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="fontSize-medium" />
                          <label htmlFor="fontSize-medium" className="text-sm text-slate-700 cursor-pointer">Medium (Default)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="large" id="fontSize-large" />
                          <label htmlFor="fontSize-large" className="text-sm text-slate-700 cursor-pointer">Large</label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      className="w-full md:w-auto"
                      onClick={() => updateAppearance.mutate(appearance)}
                      disabled={updateAppearance.isPending}
                    >
                      {updateAppearance.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </div>
                      ) : (
                        "Save Appearance Settings"
                      )}
                    </Button>
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
