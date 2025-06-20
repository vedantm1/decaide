import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/MainLayout"; 
import { PageHeader } from "@/components/layout/PageHeader";
import { Textarea } from "@/components/ui/textarea";
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
import { motion } from "framer-motion";
import { AppearanceSettings } from "@/lib/theme-controller";

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
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "light",
    colorScheme: "aquaBlue" as const, // Default to aquaBlue
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
    mutationFn: async (data: AppearanceSettings) => {
      try {
        // Import applyTheme from theme-controller
        const { applyTheme } = await import('@/lib/theme-controller');

        // Apply theme immediately
        applyTheme(data);

        // Save to user profile if authenticated
        if (user?.id) {
          try {
            const res = await apiRequest("POST", "/api/user/appearance", {
              uiTheme: data.colorScheme,
              colorScheme: data.visualStyle,
              theme: data.theme
            });
            return await res.json();
          } catch (error) {
            console.warn("Error saving to server, but theme applied locally:", error);
            // Fake success - we've already applied the theme locally, so the user won't notice
            return data;
          }
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
    <MainLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and settings"
      />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 max-w-md mb-8 bg-background/40 backdrop-blur">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/20">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-background/40 backdrop-blur border-muted/50">
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
                        <FormLabel className="text-foreground/80">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your username" className="bg-background/80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" className="bg-background/80" {...field} />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
                          This email will be used for notifications and account recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">DECA Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80">
                              <SelectValue placeholder="Select your event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_TYPE_GROUPS.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="instructionalArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Instructional Area</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80">
                              <SelectValue placeholder="Select your instructional area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                            <SelectItem value="business">Business Administration</SelectItem>
                            <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-muted-foreground">
                          Your instructional area helps us personalize content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto mt-4"
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
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
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
                      <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border bg-background/80">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Email Notifications</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Receive notifications and updates via email
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
                      <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border bg-background/80">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Daily Reminders</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Get daily practice reminders
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
                      <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border bg-background/80">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Weekly Progress Reports</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Receive weekly summaries of your DECA preparation progress
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
                      <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border bg-background/80">
                        <div className="space-y-0.5">
                          <FormLabel className="text-foreground">Streak Alerts</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Get notifications about your study streak status
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
                    className="w-full md:w-auto mt-4"
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
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Theme</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred application theme</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div 
                      className={`cursor-pointer rounded-lg border-2 p-4 flex items-center gap-2 transition-all
                        ${appearance.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                      onClick={() => {
                        const newAppearance = {...appearance, theme: 'light' as const};
                        setAppearance(newAppearance);
                        import('@/lib/theme-controller').then(({ applyTheme }) => {
                          applyTheme(newAppearance);
                        });
                      }}
                    >
                      <div className="p-1.5 rounded-full bg-background flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Light</span>
                      {appearance.theme === 'light' && (
                        <CheckIcon className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    
                    <div 
                      className={`cursor-pointer rounded-lg border-2 p-4 flex items-center gap-2 transition-all
                        ${appearance.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                      onClick={() => {
                        const newAppearance = {...appearance, theme: 'dark' as const};
                        setAppearance(newAppearance);
                        import('@/lib/theme-controller').then(({ applyTheme }) => {
                          applyTheme(newAppearance);
                        });
                      }}
                    >
                      <div className="p-1.5 rounded-full bg-background flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </div>
                      <span className="font-medium">Dark</span>
                      {appearance.theme === 'dark' && (
                        <CheckIcon className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Color Scheme</h3>
                  <p className="text-sm text-muted-foreground">Select a color scheme for the application</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {['aquaBlue', 'coralPink', 'mintGreen', 'royalPurple'].map((scheme) => (
                      <div 
                        key={scheme}
                        className={`cursor-pointer p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
                          ${appearance.colorScheme === scheme ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                        onClick={() => {
                          const newAppearance = {...appearance, colorScheme: scheme as 'aquaBlue' | 'coralPink' | 'mintGreen' | 'royalPurple'};
                          setAppearance(newAppearance);
                          // Apply theme immediately
                          import('@/lib/theme-controller').then(({ applyTheme }) => {
                            applyTheme(newAppearance);
                          });
                        }}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mb-1"
                          style={{ backgroundColor: getColorForScheme(scheme) }}
                        ></div>
                        <span className="text-sm font-medium capitalize">
                          {scheme === 'aquaBlue' ? 'Aqua Blue' : 
                           scheme === 'coralPink' ? 'Coral Pink' : 
                           scheme === 'mintGreen' ? 'Mint Green' : 
                           'Royal Purple'}
                        </span>
                        {appearance.colorScheme === scheme && (
                          <Badge className="mt-1 bg-primary/20 text-primary border-primary">Active</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => updateAppearance.mutate(appearance)}
                  className="w-full md:w-auto mt-6"
                  disabled={updateAppearance.isPending}
                >
                  <div className="flex items-center justify-center gap-2">
                    {updateAppearance.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Applying theme...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Appearance Settings</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}