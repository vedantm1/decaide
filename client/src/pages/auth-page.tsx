import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Removed useMicroInteractions import, using a mock implementation instead
import { useIsMobile } from "@/hooks/use-mobile";
import { useDiegoGuide } from "@/hooks/use-diego-guide";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  DECA_EVENTS, 
  DECA_CATEGORIES,
  EVENT_TYPE_GROUPS
} from "@shared/schema";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

// Registration form schema with enhanced event selection and customization options
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  email: z.union([
    z.string().email({ message: "Please enter a valid email address" }),
    z.string().length(0) // Allow empty string
  ]).optional().nullable(),
  eventFormat: z.enum(["roleplay", "written"], {
    required_error: "Please select either roleplay or written event format",
  }),
  eventCode: z.string().min(1, {
    message: "Please select a specific DECA event",
  }),
  eventType: z.string().optional(),
  instructionalArea: z.string().optional(),
  uiTheme: z.string().default("aquaBlue"),
  colorScheme: z.string().default("memphis"),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  // Creating a mock version of useMicroInteractions to prevent errors
  // Since this page doesn't actually need the animations to function
  const triggerAnimation = (type?: string, message?: string) => {
    // Just log the animation attempt instead of actually triggering it
    console.log(`Auth page would trigger animation: ${type}, message: ${message}`);
  };

  // Form setup for login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form setup for registration
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      eventFormat: undefined,
      eventCode: "",
      eventType: "",
      instructionalArea: "",
      uiTheme: "aquaBlue",
      colorScheme: "memphis"
    },
  });
  
  // For managing UI theme selection
  const [selectedUiTheme, setSelectedUiTheme] = useState<string>("aquaBlue");
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>("memphis");
  
  // State to track event format selection for filtering the event list
  const [selectedEventFormat, setSelectedEventFormat] = useState<"roleplay" | "written" | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Use ref to track previous tab to prevent showing animation on initial render
  const prevTabRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip first render (when prevTabRef.current is null)
    if (prevTabRef.current !== null) {
      if (activeTab === "register" && prevTabRef.current !== "register") {
        // Show animation when switching TO register tab
        triggerAnimation("stars", "Let's create your account!");
      }
    }
    
    // Update previous tab reference
    prevTabRef.current = activeTab;
  }, [activeTab, triggerAnimation]);
  
  // Using a ref to track previous format to prevent infinite loops
  const prevFormatRef = useRef<string | null>(null);
  
  // Event format selection handler - moved outside useEffect to avoid dependency issues
  const handleEventFormatChange = useCallback((format: "roleplay" | "written") => {
    // Set the format in the form
    registerForm.setValue('eventFormat', format);
    setSelectedEventFormat(format);
    
    // Only show animation if this is a new format selection
    if (prevFormatRef.current !== format) {
      prevFormatRef.current = format;
      
      const message = format === "roleplay" 
        ? "Great choice! Role-play events are all about thinking on your feet."
        : "Excellent! Written events require detailed business plans.";
      
      // Trigger animation with message
      triggerAnimation("stars", message);
    }
  }, [triggerAnimation, registerForm]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    // Subtle animation for login
    triggerAnimation("random");
    
    loginMutation.mutate(values, {
      onSuccess: () => {
        // Show success animation
        triggerAnimation("stars", "Welcome back! Let's continue your DECA preparation journey!");
      }
    });
  };

  // Access Diego guide context
  const { setIsNewUser } = useDiegoGuide();

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    // Trigger animation when form is submitted
    triggerAnimation("confetti", "Creating your account! I'm excited to help you prepare for DECA success!");
    
    // Submit the form data
    registerMutation.mutate(values, {
      onSuccess: () => {
        // Show success animation
        triggerAnimation("fireworks", "Welcome to DecA(I)de!");
        
        // Set user as new to trigger Diego tutorial
        setIsNewUser(true);
      },
      onError: () => {
        // Show error animation
        triggerAnimation("circles", "There was an error creating your account. Please try again.");
      }
    });
  };

  // Show loading state during authentication
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  // For handling mobile-specific behavior
  // Using useIsMobile hook to handle responsive functionality
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLDivElement>(null);
  
  // Use this effect to scroll the form into view on mobile when errors occur
  useEffect(() => {
    if (isMobile && (loginForm.formState.errors.username || loginForm.formState.errors.password || 
        registerForm.formState.errors.username || registerForm.formState.errors.password || 
        registerForm.formState.errors.eventFormat || registerForm.formState.errors.eventCode)) {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [
    isMobile,
    loginForm.formState.errors,
    registerForm.formState.errors
  ]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 p-4 flex items-center justify-center bg-slate-50 dark:bg-[var(--surface-0)] order-2 lg:order-1">
        <Card className="w-full max-w-md shadow-lg" ref={formRef}>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <Logo 
                variant="default" 
                mode="light" 
                showText={true} 
                showTagline={true} 
                width={50} 
                height={50} 
                className="scale-110"
              />
            </div>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Log in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-[var(--surface-2)] dark:text-white">
                <TabsTrigger value="login" className="dark:data-[state=active]:bg-[var(--surface-1)] dark:data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="dark:data-[state=active]:bg-[var(--surface-1)] dark:data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Logging in...
                        </div>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email address" 
                              value={field.value || ''} 
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-1">
                            Email is optional but recommended for account recovery and notifications
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="eventFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center">
                              DECA Event Format
                              <span className="text-destructive ml-1">*</span>
                            </span>
                          </FormLabel>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div
                              className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                                field.value === "roleplay" 
                                  ? "border-primary bg-primary/10" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleEventFormatChange("roleplay")}
                            >
                              <div className="p-4">
                                <h3 className="font-medium text-lg mb-1">Role-Play</h3>
                                <p className="text-sm text-muted-foreground">Interactive scenarios with live evaluation</p>
                                <div className="absolute top-0 right-0 p-2">
                                  {field.value === "roleplay" && (
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM7.49988 1.82689C10.6296 1.82689 13.1727 4.36997 13.1727 7.49972C13.1727 10.6295 10.6296 13.1726 7.49988 13.1726C4.37013 13.1726 1.82707 10.6295 1.82707 7.49972C1.82707 4.36997 4.37013 1.82689 7.49988 1.82689ZM10.1589 5.53975L6.49988 9.19872L4.84091 7.53975C4.65338 7.35223 4.34677 7.35223 4.15924 7.53975C3.97172 7.72728 3.97172 8.03389 4.15924 8.22142L6.15924 10.2214C6.34677 10.409 6.65338 10.409 6.84091 10.2214L10.8409 6.22142C11.0284 6.03389 11.0284 5.72728 10.8409 5.53975C10.6534 5.35223 10.3467 5.35223 10.1592 5.53975H10.1589Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div
                              className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                                field.value === "written" 
                                  ? "border-primary bg-primary/10" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleEventFormatChange("written")}
                            >
                              <div className="p-4">
                                <h3 className="font-medium text-lg mb-1">Written</h3>
                                <p className="text-sm text-muted-foreground">Business plans and prepared projects</p>
                                <div className="absolute top-0 right-0 p-2">
                                  {field.value === "written" && (
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM7.49988 1.82689C10.6296 1.82689 13.1727 4.36997 13.1727 7.49972C13.1727 10.6295 10.6296 13.1726 7.49988 13.1726C4.37013 13.1726 1.82707 10.6295 1.82707 7.49972C1.82707 4.36997 4.37013 1.82689 7.49988 1.82689ZM10.1589 5.53975L6.49988 9.19872L4.84091 7.53975C4.65338 7.35223 4.34677 7.35223 4.15924 7.53975C3.97172 7.72728 3.97172 8.03389 4.15924 8.22142L6.15924 10.2214C6.34677 10.409 6.65338 10.409 6.84091 10.2214L10.8409 6.22142C11.0284 6.03389 11.0284 5.72728 10.8409 5.53975C10.6534 5.35223 10.3467 5.35223 10.1592 5.53975H10.1589Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Show event code selection after format is chosen */}
                    {selectedEventFormat && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="eventCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <span className="flex items-center">
                                  DECA Event
                                  <span className="text-destructive ml-1">*</span>
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // Find the selected event to set eventType
                                    const selectedEvent = DECA_EVENTS[selectedEventFormat].find(event => event.code === value);
                                    if (selectedEvent) {
                                      registerForm.setValue('eventType', selectedEvent.type);
                                      registerForm.setValue('instructionalArea', selectedEvent.category);
                                    }
                                  }} 
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="bg-muted/80 dark:bg-slate-800/90 text-foreground dark:text-white border-input">
                                    <SelectValue placeholder="Select your specific event (required)" className="text-foreground dark:text-white" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-80">
                                    {/* Group events by type */}
                                    {EVENT_TYPE_GROUPS.map(group => {
                                      // Only show events from the selected format and current group
                                      const events = DECA_EVENTS[selectedEventFormat].filter(event => event.type === group);
                                      
                                      // If no events in this group, skip
                                      if (events.length === 0) return null;
                                      
                                      return (
                                        <div key={group} className="px-1 mb-3">
                                          <h4 className="text-sm font-semibold mb-1">{group}</h4>
                                          {events.map(event => {
                                            // Get category color
                                            const categoryColor = DECA_CATEGORIES[event.category as keyof typeof DECA_CATEGORIES]?.colorClass || "bg-gray-300";
                                            
                                            return (
                                              <SelectItem key={event.code} value={event.code} className="flex items-center">
                                                <div className="flex items-center">
                                                  <div className={`w-2 h-2 rounded-full mr-2 ${categoryColor}`}></div>
                                                  <span className="font-medium mr-1">{event.code}</span> - <span className="ml-1">{event.name}</span>
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                        </div>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* UI Theme Selection */}
                        <div className="mt-6">
                          <h3 className="text-md font-medium mb-2">Personalize Your Experience</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Choose a theme that matches your style. You can change this later in settings.
                          </p>
                          
                          <FormField
                            control={registerForm.control}
                            name="uiTheme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>UI Theme</FormLabel>
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                  {/* Theme options - consistent sizing and improved layout */}
                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'aquaBlue' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('aquaBlue');
                                      setSelectedUiTheme('aquaBlue');
                                    }}
                                  >
                                    <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-blue-50">
                                      <div className="flex flex-col gap-1">
                                        <div className="w-full h-2 rounded-sm bg-blue-500"></div>
                                        <div className="w-full h-2 rounded-sm bg-blue-400"></div>
                                        <div className="w-full h-2 rounded-sm bg-blue-300"></div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-medium text-blue-700">Aqua Blue</span>
                                        <p className="text-xs text-slate-600 mt-0.5">Business & Finance</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'coralPink' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('coralPink');
                                      setSelectedUiTheme('coralPink');
                                    }}
                                  >
                                    <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-pink-50">
                                      <div className="flex flex-col gap-1">
                                        <div className="w-full h-2 rounded-sm bg-pink-500"></div>
                                        <div className="w-full h-2 rounded-sm bg-pink-400"></div>
                                        <div className="w-full h-2 rounded-sm bg-pink-300"></div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-medium text-pink-700">Coral Pink</span>
                                        <p className="text-xs text-slate-600 mt-0.5">Marketing & Hospitality</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'mintGreen' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('mintGreen');
                                      setSelectedUiTheme('mintGreen');
                                    }}
                                  >
                                    <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-green-50">
                                      <div className="flex flex-col gap-1">
                                        <div className="w-full h-2 rounded-sm bg-green-500"></div>
                                        <div className="w-full h-2 rounded-sm bg-green-400"></div>
                                        <div className="w-full h-2 rounded-sm bg-green-300"></div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-medium text-green-700">Mint Green</span>
                                        <p className="text-xs text-slate-600 mt-0.5">Entrepreneurship</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'royalPurple' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('royalPurple');
                                      setSelectedUiTheme('royalPurple');
                                    }}
                                  >
                                    <div className="p-4 h-20 flex flex-col justify-between bg-gradient-to-b from-white to-purple-50">
                                      <div className="flex flex-col gap-1">
                                        <div className="w-full h-2 rounded-sm bg-purple-500"></div>
                                        <div className="w-full h-2 rounded-sm bg-purple-400"></div>
                                        <div className="w-full h-2 rounded-sm bg-purple-300"></div>
                                      </div>
                                      <div>
                                        <span className="text-xs font-medium text-purple-700">Royal Purple</span>
                                        <p className="text-xs text-slate-600 mt-0.5">Leadership & Management</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Visual Style Selection */}
                          <FormField
                            control={registerForm.control}
                            name="colorScheme"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Visual Style</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'memphis' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('memphis');
                                      setSelectedColorScheme('memphis');
                                    }}
                                  >
                                    <div className="p-4 h-24 bg-white bg-opacity-90 relative rounded-md overflow-hidden">
                                      {/* Memphis-style patterns with actual colors based on the selected theme */}
                                      <div className={`absolute -right-2 -top-2 w-10 h-10 rounded-full bg-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-300`}></div>
                                      <div className={`absolute top-6 left-2 w-12 h-2 rounded-md bg-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-400`}></div>
                                      <div className={`absolute bottom-2 right-8 w-6 h-6 rotate-45 bg-${selectedUiTheme === 'aquaBlue' ? 'cyan' : selectedUiTheme === 'coralPink' ? 'red' : selectedUiTheme === 'mintGreen' ? 'emerald' : 'indigo'}-200`}></div>
                                      <div className={`absolute left-14 top-10 w-3 h-3 rounded-full bg-${selectedUiTheme === 'aquaBlue' ? 'sky' : selectedUiTheme === 'coralPink' ? 'rose' : selectedUiTheme === 'mintGreen' ? 'teal' : 'violet'}-300`}></div>
                                      
                                      {/* Zig-zag pattern as additional Memphis element */}
                                      <svg className="absolute bottom-10 right-2 w-14 h-3" viewBox="0 0 60 10">
                                        <path 
                                          d="M0,5 L10,0 L20,5 L30,0 L40,5 L50,0 L60,5" 
                                          stroke={selectedUiTheme === 'aquaBlue' ? '#60A5FA' : selectedUiTheme === 'coralPink' ? '#FB7185' : selectedUiTheme === 'mintGreen' ? '#34D399' : '#A78BFA'} 
                                          strokeWidth="2" 
                                          fill="none" 
                                        />
                                      </svg>
                                      
                                      {/* Text with enough space */}
                                      <div className="absolute bottom-1 left-3 right-3">
                                        <span className={`text-xs font-bold block text-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-600`}>
                                          Memphis Style
                                        </span>
                                        <p className="text-xs text-slate-700">Playful geometric patterns</p>
                                      </div>
                                    </div>
                                  </motion.div>

                                  <motion.div 
                                    className={`relative overflow-hidden rounded-md cursor-pointer transition-all ${field.value === 'minimalist' ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      field.onChange('minimalist');
                                      setSelectedColorScheme('minimalist');
                                    }}
                                  >
                                    <div className="p-4 h-24 bg-white relative rounded-md overflow-hidden">
                                      {/* Clean minimalist design that adapts to selected theme */}
                                      <div className={`absolute top-4 left-4 w-12 h-0.5 bg-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-400`}></div>
                                      <div className={`absolute top-7 left-4 w-8 h-0.5 bg-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-300`}></div>
                                      <div className={`absolute top-10 left-4 w-5 h-0.5 bg-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-200`}></div>
                                      
                                      {/* Subtle horizontal divider */}
                                      <div className="absolute right-4 left-4 top-16 h-px bg-gray-200"></div>
                                      
                                      {/* Text positioned with better spacing */}
                                      <div className="absolute bottom-1 left-3 right-3">
                                        <span className={`text-xs font-bold block text-${selectedUiTheme === 'aquaBlue' ? 'blue' : selectedUiTheme === 'coralPink' ? 'pink' : selectedUiTheme === 'mintGreen' ? 'green' : 'purple'}-600`}>
                                          Minimalist
                                        </span>
                                        <p className="text-xs text-slate-700">Clean, focused design</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Registering...
                        </div>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-xs text-slate-500 mt-6">
              By continuing, you agree to DecA(I)de's Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero section - Memphis Style */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col order-1 lg:order-2 bg-cyan-50 dark:bg-slate-900 text-slate-900 dark:text-white p-12 overflow-hidden">
        {/* Memphis style background patterns with high saturation */}
        <div className="absolute top-10 left-16 w-32 h-32 bg-primary/80 dark:bg-primary/70 rounded-full shadow-md" />
        <div className="absolute bottom-20 right-14 w-40 h-40 bg-secondary/80 dark:bg-secondary/70 rounded-lg rotate-12 shadow-md" />
        <div className="absolute top-40 right-12 w-24 h-24 bg-accent/80 dark:bg-accent/70 rounded-full shadow-md" />
        <div className="absolute bottom-60 left-10 w-28 h-28 bg-yellow-500/90 dark:bg-yellow-600/80 rounded-lg -rotate-12 shadow-md" />
        
        {/* Zigzag pattern with enhanced visibility */}
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-48 h-8">
          <svg viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L20 24L40 0L60 24L80 0L100 24L120 0L140 24L160 0" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" fill="none" />
          </svg>
        </div>
        
        {/* Enhanced Dolphin mascot */}
        <div className="absolute bottom-10 right-8 w-40 h-40">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-full opacity-40 animate-pulse shadow-lg"></div>
            <div className="absolute inset-2 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
              <svg viewBox="0 0 100 100" className="w-28 h-28">
                <g transform="translate(50 50)">
                  {/* Proper dolphin shape */}
                  <path 
                    d="M-25,-10 C-40,-25 -20,-40 0,-35 C20,-40 35,-20 30,0 C25,20 5,35 -10,25 C-25,15 -30,0 -25,-10 Z" 
                    fill="#60A5FA" 
                  />
                  
                  {/* Dolphin fin */}
                  <path 
                    d="M20,-15 C30,-25 35,-15 30,-5 C25,-8 20,-10 20,-15 Z" 
                    fill="#3B82F6" 
                  />
                  
                  {/* Dolphin snout */}
                  <path 
                    d="M-25,-10 C-35,-5 -40,5 -30,10 C-25,12 -20,10 -15,5 C-20,0 -25,-5 -25,-10 Z" 
                    fill="#93C5FD" 
                  />
                  
                  {/* Dolphin smile */}
                  <path 
                    d="M-20,5 Q-10,15 5,5" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Eyes */}
                  <circle cx="-15" cy="-5" r="4" fill="white" />
                  <circle cx="0" cy="-10" r="4" fill="white" />
                  <circle cx="-15" cy="-5" r="2" fill="black" />
                  <circle cx="0" cy="-10" r="2" fill="black" />
                  
                  {/* Water splash effect - enhanced */}
                  <path 
                    d="M-30,20 C-25,15 -15,25 -10,20 C-5,25 5,15 10,20 C15,15 25,25 30,20" 
                    fill="none" 
                    stroke="#BAE6FD" 
                    strokeWidth="3" 
                    strokeDasharray="2,2" 
                    opacity="0.9" 
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="h-full flex flex-col justify-center max-w-lg mx-auto z-10">
          <div className="inline-flex items-center mb-6 bg-primary/60 px-4 py-2 rounded-lg shadow-sm">
            <span className="inline-block mr-2 w-3 h-3 bg-primary rounded-full shadow-sm"></span>
            <h2 className="text-xl font-heading font-bold text-slate-800 drop-shadow-sm">DECA AI Preparation</h2>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-slate-800 dark:text-white">
            <span className="relative inline-block mb-2">
              <span className="relative z-10 px-3 py-1">Master DECA with</span>
              <span className="absolute inset-0 bg-yellow-400/90 dark:bg-yellow-600/90 -rotate-1 rounded-md"></span>
            </span>
            <div className="h-2"></div>
            <span className="relative inline-block">
              <span className="relative z-10 px-3 py-1">AI-Powered Practice</span>
              <span className="absolute inset-0 bg-accent/90 dark:bg-accent/80 -rotate-1 rounded-md"></span>
            </span>
          </h1>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start bg-blue-200/90 dark:bg-blue-800/90 p-3 rounded-lg shadow-sm transform hover:scale-102 transition-transform duration-200">
              <div className="mr-4 flex-shrink-0 w-12 h-12 bg-blue-400 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary dark:text-white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white relative inline-block">
                  <span className="relative z-10">Custom Roleplay Generation</span>
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-blue-400/60 dark:bg-blue-500/60"></span>
                </h3>
                <p className="text-slate-700 dark:text-blue-100 mt-1">Practice with unlimited roleplay scenarios tailored to your event</p>
              </div>
            </div>
            
            <div className="flex items-start bg-accent/40 dark:bg-accent/50 p-3 rounded-lg shadow-sm transform hover:scale-102 transition-transform duration-200">
              <div className="mr-4 flex-shrink-0 w-12 h-12 bg-accent/70 dark:bg-accent/80 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 6H3"></path><path d="M11 12H3"></path><path d="M7 18H3"></path><path d="M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14"></path></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white relative inline-block">
                  <span className="relative z-10">Performance Indicator Mastery</span>
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-accent-foreground/40"></span>
                </h3>
                <p className="text-slate-700 dark:text-blue-100 mt-1">Learn and practice essential performance indicators with real-world examples</p>
              </div>
            </div>
            
            <div className="flex items-start bg-yellow-200/80 dark:bg-yellow-800/80 p-3 rounded-lg shadow-sm transform hover:scale-102 transition-transform duration-200">
              <div className="mr-4 flex-shrink-0 w-12 h-12 bg-yellow-400 dark:bg-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-800 dark:text-white"><path d="M12 20v-6"></path><path d="M6 20v-6"></path><path d="M18 20v-6"></path><path d="M17 14h1a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1h-6V2.12c0-.59-.26-1.05-.59-1.06-.32 0-.59.45-.59 1.04L11.97 4H5.95a.94.94 0 0 0-.9.94c0 .13.05.25.09.36C5.11 5.73 5.95 8 9 8h7.33a2 2 0 0 0 1.9-1.37"></path><path d="M12 20a2 2 0 0 0 4 0"></path><path d="M6 20a2 2 0 0 0 4 0"></path><path d="M18 20a2 2 0 0 0 4 0"></path></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white relative inline-block">
                  <span className="relative z-10">Practice Tests & Analytics</span>
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-yellow-400/60 dark:bg-yellow-500/60"></span>
                </h3>
                <p className="text-slate-700 dark:text-yellow-100 mt-1">Take exam-style tests and track your progress to identify areas for improvement</p>
              </div>
            </div>
          </div>
          
          <div className="inline-block relative bg-gradient-to-r from-blue-300/80 to-blue-200/80 dark:from-blue-700 dark:to-blue-900 rounded-lg px-6 py-4 border-2 border-primary/50 dark:border-primary/70 shadow-md">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/60 dark:bg-primary/80 h-12 w-12 flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-primary-foreground dark:text-white text-lg">Who says there is no <span className="font-bold text-accent-foreground dark:text-yellow-300 italic">I</span> in team?</h3>
                <p className="text-slate-800 dark:text-blue-100 mt-1">
                  With DecA<span className="text-accent-foreground dark:text-yellow-300 font-bold">(I)</span>de, your <span className="italic font-semibold">individual</span> excellence is what makes your team unstoppable!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
