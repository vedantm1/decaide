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
import { EVENT_TYPE_GROUPS, DECA_EVENTS } from "@shared/schema";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    colorScheme: user?.uiTheme || "aquaBlue", // Default to aquaBlue if no user preference is set
    fontSize: "medium",
    visualStyle: "memphis"
  });

  // Load appearance settings from local storage
  useEffect(() => {
    const savedAppearance = localStorage.getItem('diegoAppearance');
    if (savedAppearance) {
      try {
        setAppearance(JSON.parse(savedAppearance));
      } catch (e) {
        console.error('Error parsing saved appearance settings:', e);
      }
    }
  }, []);

  // Save appearance settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('diegoAppearance', JSON.stringify(appearance));
  }, [appearance]);

  // Helper function to get color based on scheme
  const getColorForScheme = (scheme: string): string => {
    switch (scheme) {
      // DECA Cluster Colors
      case 'business': return '#ffd700'; // Yellow
      case 'finance': return '#22c55e'; // Green
      case 'hospitality': return '#3b82f6'; // Blue
      case 'marketing': return '#ef4444'; // Red
      case 'entrepreneurship': return '#9ca3af'; // Gray
      case 'admin': return '#312e81'; // Navy Blue
      
      // Regular UI Colors
      case 'aquaBlue': return '#3b82f6';
      case 'coralPink': return '#ec4899';
      case 'mintGreen': return '#22c55e';
      case 'royalPurple': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };
  
  // Update appearance settings mutation
  const updateAppearance = useMutation({
    mutationFn: async (data: any) => {
      try {
        // Import applyTheme from theme-controller
        const { applyTheme } = await import('@/lib/theme-controller');
        
        // Apply theme immediately
        applyTheme(data);
        
        // Save to user profile if authenticated
        if (user?.id) {
          const res = await apiRequest("POST", "/api/user/settings", {
            uiTheme: data.colorScheme,
            visualStyle: data.visualStyle
          });
          return await res.json();
        }
        // Otherwise just return the data (it's already applied and saved to localStorage)
        return data;
      } catch (error) {
        console.error("Error saving appearance:", error);
        return data; // Still return data so UI updates
      }
    },
    onSuccess: () => {
      // Invalidate the user data to get the updated preferences
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Appearance Updated",
        description: "Your theme preferences have been saved and applied.",
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
                          className={`border ${appearance.theme === "light" ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200'} rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02] bg-white`}
                          onClick={() => setAppearance(prev => ({...prev, theme: "light"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-white to-blue-50 mb-0 rounded-t relative">
                            {appearance.theme === "light" && (
                              <div className="absolute top-2 right-2 bg-white rounded-full shadow p-0.5">
                                <CheckIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-center py-2 bg-white text-slate-800">Light</div>
                        </div>
                        <div 
                          className={`border ${appearance.theme === "dark" ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 dark:border-[var(--dark-border)]'} rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02]`}
                          onClick={() => setAppearance(prev => ({...prev, theme: "dark"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-slate-700 to-slate-900 mb-0 rounded-t relative">
                            {appearance.theme === "dark" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-[var(--dark-bg-tertiary)] rounded-full shadow p-0.5">
                                <CheckIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-center py-2 bg-white dark:bg-[var(--surface-2)] dark:text-[var(--dark-text-primary)]">Dark</div>
                        </div>
                        <div 
                          className={`border ${appearance.theme === "system" ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 dark:border-[var(--dark-border)]'} rounded-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-[1.02]`}
                          onClick={() => setAppearance(prev => ({...prev, theme: "system"}))}
                        >
                          <div className="w-full h-20 bg-gradient-to-b from-white to-slate-800 mb-0 rounded-t relative">
                            <div className="absolute top-0 left-0 w-1/2 h-full bg-white"></div>
                            {appearance.theme === "system" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-[var(--dark-bg-tertiary)] rounded-full shadow p-0.5">
                                <CheckIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-center py-2 bg-white dark:bg-[var(--surface-2)] dark:text-[var(--dark-text-primary)]">System</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 dark:text-[var(--dark-text-primary)] mb-3">DECA Cluster Themes</h3>
                      <p className="text-xs text-slate-500 dark:text-[var(--dark-text-secondary)] mb-4">Select a DECA event cluster for a specialized color scheme</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "business" ? 'ring-yellow-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "business"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-yellow-50 relative">
                            {appearance.colorScheme === "business" ? (
                              <div className="deca-cluster-badge bg-yellow-500">BMA</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-800">BMA</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-yellow-500 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-yellow-400 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-yellow-300 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-yellow-700">Business Management</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['BMA', 'ENT', 'BLTDM', 'HRM'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "finance" ? 'ring-green-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "finance"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-green-50 relative">
                            {appearance.colorScheme === "finance" ? (
                              <div className="deca-cluster-badge bg-green-600">FIN</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800">FIN</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-green-500 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-green-400 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-green-300 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-green-700">Finance</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['ACT', 'BFS', 'FTDM', 'FCE'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "hospitality" ? 'ring-blue-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "hospitality"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50 relative">
                            {appearance.colorScheme === "hospitality" ? (
                              <div className="deca-cluster-badge bg-blue-500">HOSP</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800">HOSP</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-blue-500 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-400 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-300 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-blue-700">Hospitality & Tourism</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['HLM', 'HTDM', 'HTPS', 'RFSM'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "marketing" ? 'ring-red-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "marketing"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-red-50 relative">
                            {appearance.colorScheme === "marketing" ? (
                              <div className="deca-cluster-badge bg-red-500">MKTG</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-800">MKTG</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-red-500 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-red-400 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-red-300 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-red-700">Marketing</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['AAM', 'ASM', 'BSM', 'FMS', 'MCS', 'RMS'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "entrepreneurship" ? 'ring-gray-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "entrepreneurship"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50 relative">
                            {appearance.colorScheme === "entrepreneurship" ? (
                              <div className="deca-cluster-badge bg-gray-500">ENTR</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800">ENTR</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-gray-500 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-gray-400 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-gray-300 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-700">Entrepreneurship</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['EIP', 'ESB', 'EIB', 'IBP'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "admin" ? 'ring-indigo-700 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "admin"}))}
                        >
                          <div className="p-4 h-28 flex flex-col justify-between bg-gradient-to-b from-white to-indigo-50 relative">
                            {appearance.colorScheme === "admin" ? (
                              <div className="deca-cluster-badge bg-indigo-700">BAC</div>
                            ) : (
                              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-800">BAC</div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-indigo-800 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-indigo-700 opacity-70"></div>
                              <div className="w-full h-2 rounded-sm bg-indigo-600 opacity-70"></div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-indigo-800">Business Admin Core</span>
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1">
                                  {['PFL', 'PBM', 'PMK'].map(code => (
                                    <Badge key={code} variant="outline" className="text-[10px] py-0 h-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
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
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "aquaBlue" ? 'ring-blue-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "aquaBlue"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 relative">
                            {appearance.colorScheme === "aquaBlue" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow p-0.5">
                                <CheckIcon className="h-3 w-3 text-blue-500" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-blue-500"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-400"></div>
                              <div className="w-full h-2 rounded-sm bg-blue-300"></div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Aqua Blue</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "coralPink" ? 'ring-pink-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "coralPink"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-pink-50 dark:from-slate-800 dark:to-pink-950 relative">
                            {appearance.colorScheme === "coralPink" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow p-0.5">
                                <CheckIcon className="h-3 w-3 text-pink-500" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-pink-500"></div>
                              <div className="w-full h-2 rounded-sm bg-pink-400"></div>
                              <div className="w-full h-2 rounded-sm bg-pink-300"></div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-pink-700 dark:text-pink-300">Coral Pink</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "mintGreen" ? 'ring-green-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "mintGreen"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-green-50 dark:from-slate-800 dark:to-green-950 relative">
                            {appearance.colorScheme === "mintGreen" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow p-0.5">
                                <CheckIcon className="h-3 w-3 text-green-500" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-green-500"></div>
                              <div className="w-full h-2 rounded-sm bg-green-400"></div>
                              <div className="w-full h-2 rounded-sm bg-green-300"></div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">Mint Green</span>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 ${appearance.colorScheme === "royalPurple" ? 'ring-purple-500 ring-2' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, colorScheme: "royalPurple"}))}
                        >
                          <div className="p-4 h-24 flex flex-col justify-between bg-gradient-to-b from-white to-purple-50 dark:from-slate-800 dark:to-purple-950 relative">
                            {appearance.colorScheme === "royalPurple" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow p-0.5">
                                <CheckIcon className="h-3 w-3 text-purple-500" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="w-full h-2 rounded-sm bg-purple-500"></div>
                              <div className="w-full h-2 rounded-sm bg-purple-400"></div>
                              <div className="w-full h-2 rounded-sm bg-purple-300"></div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Royal Purple</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Visual Style</h3>
                      <p className="text-xs text-slate-500 mb-4">Choose between playful or simplified UI design</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 hover:scale-[1.02] shadow-sm ${appearance.visualStyle === "memphis" ? 'ring-2 ring-primary' : 'ring-border'}`}
                          onClick={() => setAppearance(prev => ({...prev, visualStyle: "memphis"}))}
                        >
                          <div className="p-4 h-28 bg-white dark:bg-[var(--dark-gradient-v-default)] bg-opacity-90 relative rounded-md overflow-hidden">
                            {/* Memphis-style patterns */}
                            <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-blue-300 dark:bg-blue-600 opacity-80"></div>
                            <div className="absolute top-6 left-2 w-12 h-2 rounded-md bg-blue-400 dark:bg-blue-700 opacity-90"></div>
                            <div className="absolute bottom-3 right-8 w-6 h-6 border-2 border-yellow-400 dark:border-yellow-600 opacity-90"></div>
                            <div className="absolute bottom-10 left-10 w-3 h-3 bg-pink-300 dark:bg-pink-600 rotate-45 opacity-90"></div>
                            <div className="absolute top-1/2 right-1/3 w-8 h-1 bg-green-300 dark:bg-green-600 opacity-90"></div>
                            {appearance.visualStyle === "memphis" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow">
                                <CheckIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="mt-16">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Playful Style</span>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Vibrant design with Memphis-style elements for a fun experience</p>
                            </div>
                          </div>
                        </div>
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 hover:scale-[1.02] shadow-sm ${appearance.visualStyle === "minimalist" ? 'ring-2 ring-primary' : 'ring-border'}`}
                          onClick={() => setAppearance(prev => ({...prev, visualStyle: "minimalist"}))}
                        >
                          <div className="p-4 h-28 bg-white dark:bg-[var(--dark-gradient-v-default)] relative rounded-md overflow-hidden">
                            {/* Clean minimalist design */}
                            <div className="absolute top-4 left-4 w-10 h-2 rounded-full bg-blue-400 opacity-75"></div>
                            <div className="absolute top-8 left-4 w-6 h-2 rounded-full bg-blue-300 opacity-75"></div>
                            <div className="absolute top-12 left-4 w-3 h-3 rounded-full border border-slate-300 dark:border-slate-500"></div>
                            {appearance.visualStyle === "minimalist" && (
                              <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 rounded-full shadow">
                                <CheckIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="mt-16">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Simplified Style</span>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Clean layout with focused design for improved readability</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Font Size</h3>
                      <p className="text-xs text-slate-500 mb-4">Adjust the text size for better readability</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 p-4 ${appearance.fontSize === "small" ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, fontSize: "small"}))}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-xs font-medium">Sample</div>
                            <div className="h-1 w-8 bg-primary/40 rounded-full"></div>
                            <div className="h-1 w-6 bg-primary/30 rounded-full"></div>
                            {appearance.fontSize === "small" && (
                              <div className="absolute top-2 right-2">
                                <CheckIcon className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs font-medium">Small</span>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 p-4 ${appearance.fontSize === "medium" ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, fontSize: "medium"}))}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-sm font-medium">Sample</div>
                            <div className="h-1.5 w-10 bg-primary/40 rounded-full"></div>
                            <div className="h-1.5 w-8 bg-primary/30 rounded-full"></div>
                            {appearance.fontSize === "medium" && (
                              <div className="absolute top-2 right-2">
                                <CheckIcon className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs font-medium">Medium</span>
                            <p className="text-[10px] text-muted-foreground">(Default)</p>
                          </div>
                        </div>
                        
                        <div 
                          className={`relative overflow-hidden rounded-md cursor-pointer transition-all ring-1 p-4 ${appearance.fontSize === "large" ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' : 'ring-border'} hover:scale-[1.02] shadow-sm`}
                          onClick={() => setAppearance(prev => ({...prev, fontSize: "large"}))}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-base font-medium">Sample</div>
                            <div className="h-2 w-12 bg-primary/40 rounded-full"></div>
                            <div className="h-2 w-10 bg-primary/30 rounded-full"></div>
                            {appearance.fontSize === "large" && (
                              <div className="absolute top-2 right-2">
                                <CheckIcon className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs font-medium">Large</span>
                          </div>
                        </div>
                      </div>
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
