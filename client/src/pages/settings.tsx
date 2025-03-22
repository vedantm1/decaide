import { useState } from "react";
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
import { EVENT_TYPE_GROUPS } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState("profile");
  
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
                        <div className="border border-primary rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-20 bg-primary mb-2 rounded"></div>
                          <div className="text-sm font-medium text-center">Light</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-20 bg-slate-800 mb-2 rounded"></div>
                          <div className="text-sm font-medium text-center">Dark</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-20 bg-gradient-to-b from-white to-slate-800 mb-2 rounded"></div>
                          <div className="text-sm font-medium text-center">System</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Color Scheme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border border-primary rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-8 bg-primary mb-1 rounded"></div>
                          <div className="w-full h-8 bg-secondary mb-1 rounded"></div>
                          <div className="w-full h-8 bg-accent mb-1 rounded"></div>
                          <div className="text-sm font-medium text-center mt-1">Default</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-8 bg-[#8B5CF6] mb-1 rounded"></div>
                          <div className="w-full h-8 bg-[#EC4899] mb-1 rounded"></div>
                          <div className="w-full h-8 bg-[#F59E0B] mb-1 rounded"></div>
                          <div className="text-sm font-medium text-center mt-1">Vibrant</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer">
                          <div className="w-full h-8 bg-[#0F766E] mb-1 rounded"></div>
                          <div className="w-full h-8 bg-[#4338CA] mb-1 rounded"></div>
                          <div className="w-full h-8 bg-[#84CC16] mb-1 rounded"></div>
                          <div className="text-sm font-medium text-center mt-1">Cool</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-base font-medium text-slate-700 mb-3">Font Size</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="fontSize-small" name="fontSize" className="h-4 w-4 text-primary border-slate-300 focus:ring-primary" />
                          <label htmlFor="fontSize-small" className="ml-2 block text-sm text-slate-700">Small</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="fontSize-medium" name="fontSize" className="h-4 w-4 text-primary border-slate-300 focus:ring-primary" checked />
                          <label htmlFor="fontSize-medium" className="ml-2 block text-sm text-slate-700">Medium (Default)</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="fontSize-large" name="fontSize" className="h-4 w-4 text-primary border-slate-300 focus:ring-primary" />
                          <label htmlFor="fontSize-large" className="ml-2 block text-sm text-slate-700">Large</label>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full md:w-auto">
                      Save Appearance Settings
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
