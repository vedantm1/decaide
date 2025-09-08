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

const DECA_CAREER_CLUSTERS = {
  "Business Administration Core": [
    { name: "Principles of Business Management and Administration", abbrev: "PBM" },
    { name: "Principles of Entrepreneurship", abbrev: "PEN" },
    { name: "Principles of Finance", abbrev: "PFN" },
    { name: "Principles of Hospitality and Tourism", abbrev: "PHT" },
    { name: "Principles of Marketing", abbrev: "PMK" }
  ],
  "Business Management & Administration": [
    { name: "Business Law and Ethics Team Decision Making", abbrev: "BLTDM" },
    { name: "Human Resources Management Series", abbrev: "HRM" },
    { name: "Business Services Operations Research", abbrev: "BOR" },
    { name: "Business Solutions Project", abbrev: "PMBS" },
    { name: "Career Development Project", abbrev: "PMCD" },
    { name: "Community Awareness Project", abbrev: "PMCA" },
    { name: "Community Giving Project", abbrev: "PMCG" }
  ],
  "Entrepreneurship": [
    { name: "Entrepreneurship Team Decision Making", abbrev: "ETDM" },
    { name: "Entrepreneurship Series", abbrev: "ENT" },
    { name: "Business Growth Plan", abbrev: "EBG" },
    { name: "Franchise Business Plan", abbrev: "EFB" },
    { name: "Independent Business Plan", abbrev: "EIB" },
    { name: "Innovation Plan", abbrev: "EIP" },
    { name: "International Business Plan", abbrev: "IBP" },
    { name: "Start-Up Business Plan", abbrev: "ESB" }
  ],
  "Finance": [
    { name: "Financial Services Team Decision Making", abbrev: "FTDM" },
    { name: "Accounting Applications Series", abbrev: "ACT" },
    { name: "Business Finance Series", abbrev: "BFS" },
    { name: "Finance Operations Research", abbrev: "FOR" },
    { name: "Financial Consulting", abbrev: "FCE" },
    { name: "Financial Literacy Project", abbrev: "PMFL" }
  ],
  "Hospitality & Tourism": [
    { name: "Hospitality Services Team Decision Making", abbrev: "HTDM" },
    { name: "Travel and Tourism Team Decision Making", abbrev: "TTDM" },
    { name: "Hotel and Lodging Management Series", abbrev: "HLM" },
    { name: "Quick Serve Restaurant Management Series", abbrev: "QSRM" },
    { name: "Restaurant and Food Service Management Series", abbrev: "RFSM" },
    { name: "Hospitality and Tourism Operations Research", abbrev: "HTOR" },
    { name: "Hospitality and Tourism Professional Selling", abbrev: "HTPS" }
  ],
  "Marketing": [
    { name: "Buying and Merchandising Team Decision Making", abbrev: "BTDM" },
    { name: "Marketing Management Team Decision Making", abbrev: "MTDM" },
    { name: "Sports and Entertainment Marketing Team Decision Making", abbrev: "STDM" },
    { name: "Apparel and Accessories Marketing Series", abbrev: "AAM" },
    { name: "Automotive Services Marketing Series", abbrev: "ASM" },
    { name: "Business Services Marketing Series", abbrev: "BSM" },
    { name: "Food Marketing Series", abbrev: "FMS" },
    { name: "Buying and Merchandising Operations Research", abbrev: "BMOR" },
    { name: "Sports and Entertainment Marketing Operations Research", abbrev: "SEOR" },
    { name: "Marketing Communications Series", abbrev: "MCS" },
    { name: "Retail Merchandising Series", abbrev: "RMS" },
    { name: "Sports and Entertainment Marketing Series", abbrev: "SEM" },
    { name: "Integrated Marketing Campaign-Event", abbrev: "IMCE" },
    { name: "Integrated Marketing Campaign-Product", abbrev: "IMCP" },
    { name: "Integrated Marketing Campaign-Service", abbrev: "IMCS" },
    { name: "Sales Project", abbrev: "PMSP" },
    { name: "Professional Selling", abbrev: "PSE" }
  ],
  "Personal Financial Literacy": [
    { name: "Personal Financial Literacy", abbrev: "PFL" }
  ]
};
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import { CheckIcon, User, Bell, Shield, Palette, Moon, Sun, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activeTab, setActiveTab] = useState("account");
  const [selectedEvents, setSelectedEvents] = useState<{[cluster: string]: string}>({});
  const [eventSelectionOpen, setEventSelectionOpen] = useState(false);

  // Appearance settings state
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "light",
    colorScheme: "aquaBlue",
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

  // Update appearance settings mutation
  const updateAppearance = useMutation({
    mutationFn: async (data: AppearanceSettings) => {
      try {
        const { applyTheme } = await import('@/lib/theme-controller');
        applyTheme(data);

        if (user?.id) {
          try {
            const res = await apiRequest("/api/user/preferences", "PATCH", {
              uiTheme: data.colorScheme,
              colorScheme: data.visualStyle,
              theme: data.theme
            });
            return await res.json();
          } catch (error) {
            console.warn("Error saving to server, but theme applied locally:", error);
            return data;
          }
        }
        return data;
      } catch (error) {
        console.error("Error saving appearance:", error);
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Theme Updated",
        description: `Applied ${data.theme} theme successfully`,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Settings"
            subtitle="Customize your learning experience"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-background/40 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="account" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Shield className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-background/40 backdrop-blur-sm border-border/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  <CardHeader className="relative">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Account Information
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Your account details and selected event information.
                    </p>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-3 border-b border-border/20">
                            <span className="text-muted-foreground">Username</span>
                            <span className="font-medium">{user?.username || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-border/20">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{user?.email || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-border/20">
                            <span className="text-muted-foreground">Subscription</span>
                            <Badge variant="secondary" className="capitalize">
                              {user?.subscriptionTier || 'Standard'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-foreground">DECA Event Selection</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-3 border-b border-border/20">
                            <span className="text-muted-foreground">Selected Event</span>
                            <span className="font-medium text-right max-w-[200px]">
                              {user?.selectedEvent || 'No event selected'}
                            </span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-border/20">
                            <span className="text-muted-foreground">Career Cluster</span>
                            <span className="font-medium text-right max-w-[200px]">
                              {user?.selectedCluster || 'No cluster selected'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Event Selection Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Change DECA Event</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEventSelectionOpen(!eventSelectionOpen)}
                          className="bg-background/60 hover:bg-background/80"
                        >
                          {eventSelectionOpen ? 'Cancel' : user?.selectedEvent ? 'Change Event' : 'Select Event'}
                        </Button>
                      </div>
                      
                      <AnimatePresence>
                        {eventSelectionOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 bg-background/20 p-4 rounded-lg border border-border/30"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(DECA_CAREER_CLUSTERS).map(([cluster, events], index) => (
                                <div key={cluster} className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/80">{cluster}</label>
                                  <Select 
                                    value={selectedEvents[cluster] || ""} 
                                    onValueChange={(value) => {
                                      const newSelections = { ...selectedEvents };
                                      
                                      // Clear all other selections (single selection only)
                                      Object.keys(newSelections).forEach(key => {
                                        if (key !== cluster) delete newSelections[key];
                                      });
                                      
                                      if (value) {
                                        newSelections[cluster] = value;
                                      } else {
                                        delete newSelections[cluster];
                                      }
                                      
                                      setSelectedEvents(newSelections);
                                    }}
                                  >
                                    <SelectTrigger className="w-full bg-background/80 border-muted hover:border-primary/50 transition-colors">
                                      <SelectValue placeholder="Select an event..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                      {events.map((event) => (
                                        <SelectItem 
                                          key={event.abbrev} 
                                          value={`${event.name} (${event.abbrev})`}
                                          className="py-2"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{event.name}</span>
                                            <span className="text-xs text-muted-foreground">{event.abbrev}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedEvents({});
                                  setEventSelectionOpen(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  const selectedCount = Object.keys(selectedEvents).length;
                                  
                                  if (selectedCount === 0) {
                                    toast({ title: "Error", description: "Please select an event or click Cancel", variant: "destructive" });
                                    return;
                                  }
                                  
                                  if (selectedCount > 1) {
                                    toast({ title: "Error", description: "Please select only one event", variant: "destructive" });
                                    return;
                                  }
                                  
                                  try {
                                    const selectedEvent = Object.values(selectedEvents)[0];
                                    const selectedCluster = Object.keys(selectedEvents)[0];
                                    
                                    await apiRequest("/api/user/event", "POST", {
                                      selectedEvent,
                                      selectedCluster,
                                      onboardingCompleted: true
                                    });
                                    
                                    // Refresh user data to show updated selection
                                    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                                    
                                    toast({ title: "Success", description: "DECA event updated successfully!" });
                                    setEventSelectionOpen(false);
                                    setSelectedEvents({});
                                  } catch (error: any) {
                                    console.error('Failed to update event:', error);
                                    toast({ title: "Error", description: error.message || "Failed to update event", variant: "destructive" });
                                  }
                                }}
                                disabled={Object.keys(selectedEvents).length === 0}
                                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              >
                                Save Event Selection
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-background/40 backdrop-blur-sm border-border/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  <CardHeader className="relative">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Profile Settings
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Update your profile information and preferences.
                    </p>
                  </CardHeader>
                  <CardContent className="relative">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground/80">Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="bg-background/80 border-border/50 focus:border-primary/50"
                                    placeholder="Enter your username"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="eventType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground/80">Event Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/80 border-border/50 focus:border-primary/50">
                                      <SelectValue placeholder="Select your event type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="roleplay">Roleplay</SelectItem>
                                    <SelectItem value="written">Written Event</SelectItem>
                                    <SelectItem value="pi">Performance Indicator</SelectItem>
                                    <SelectItem value="test">Practice Test</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-muted-foreground">
                                  Your primary DECA event type.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={profileForm.control}
                            name="instructionalArea"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground/80">Instructional Area</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/80 border-border/50 focus:border-primary/50">
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
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                        </motion.div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-background/40 backdrop-blur-sm border-border/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  <CardHeader className="relative">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Notification Preferences
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Customize how you receive updates and reminders.
                    </p>
                  </CardHeader>
                  <CardContent className="relative">
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-4"
                        >
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-300">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-foreground font-medium">Email Notifications</FormLabel>
                                  <FormDescription className="text-muted-foreground">
                                    Receive notifications and updates via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="dailyReminders"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-300">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-foreground font-medium">Daily Reminders</FormLabel>
                                  <FormDescription className="text-muted-foreground">
                                    Get daily practice reminders
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="weeklyProgressReports"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-300">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-foreground font-medium">Weekly Progress Reports</FormLabel>
                                  <FormDescription className="text-muted-foreground">
                                    Receive weekly summaries of your DECA preparation progress
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="streakAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-300">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-foreground font-medium">Streak Alerts</FormLabel>
                                  <FormDescription className="text-muted-foreground">
                                    Get notifications about your study streak status
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                        </motion.div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-background/40 backdrop-blur-sm border-border/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  <CardHeader className="relative">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Appearance Settings
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Customize the visual appearance of your learning experience.
                    </p>
                  </CardHeader>
                  <CardContent className="relative space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-foreground">Theme Mode</h3>
                      <p className="text-sm text-muted-foreground">Choose your preferred application theme</p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <motion.div 
                          className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 ${
                            appearance.theme === 'light' 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-border/50 bg-background/40 hover:border-primary/30'
                          }`}
                          onClick={() => {
                            const newAppearance = {...appearance, theme: 'light' as const};
                            setAppearance(newAppearance);
                            updateAppearance.mutate(newAppearance);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                            <Sun className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-foreground">Light</span>
                          {appearance.theme === 'light' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-primary"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 ${
                            appearance.theme === 'dark' 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-border/50 bg-background/40 hover:border-primary/30'
                          }`}
                          onClick={() => {
                            const newAppearance = {...appearance, theme: 'dark' as const};
                            setAppearance(newAppearance);
                            updateAppearance.mutate(newAppearance);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="p-3 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg">
                            <Moon className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-foreground">Dark</span>
                          {appearance.theme === 'dark' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-primary"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 ${
                            appearance.theme === 'system' 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-border/50 bg-background/40 hover:border-primary/30'
                          }`}
                          onClick={() => {
                            const newAppearance = {...appearance, theme: 'system' as const};
                            setAppearance(newAppearance);
                            updateAppearance.mutate(newAppearance);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                            <Monitor className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-foreground">System</span>
                          {appearance.theme === 'system' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-primary"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <Separator className="bg-border/50" />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-foreground">Font Size</h3>
                      <p className="text-sm text-muted-foreground">Adjust the text size for better readability</p>
                      
                      <RadioGroup 
                        value={appearance.fontSize} 
                        onValueChange={(value) => {
                          const newAppearance = {...appearance, fontSize: value as 'small' | 'medium' | 'large'};
                          setAppearance(newAppearance);
                          updateAppearance.mutate(newAppearance);
                        }}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="small" id="small" />
                          <label htmlFor="small" className="text-sm font-medium cursor-pointer">Small</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <label htmlFor="medium" className="text-sm font-medium cursor-pointer">Medium</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="large" id="large" />
                          <label htmlFor="large" className="text-sm font-medium cursor-pointer">Large</label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                    
                    {updateAppearance.isPending && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20"
                      >
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-primary font-medium">Applying theme...</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}