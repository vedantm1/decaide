import { useState, useEffect } from "react";
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

// Registration form schema with required event selection
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  eventFormat: z.enum(["roleplay", "written"], {
    required_error: "Please select either roleplay or written event format",
  }),
  eventCode: z.string().min(1, {
    message: "Please select a specific DECA event",
  }),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

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
      eventFormat: undefined,
      eventCode: "",
    },
  });
  
  // State to track event format selection for filtering the event list
  const [selectedEventFormat, setSelectedEventFormat] = useState<"roleplay" | "written" | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  // Show loading state during authentication
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 p-4 flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-2xl">D</span>
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  AI
                </span>
              </div>
              <span className="font-heading font-bold text-2xl text-slate-800 ml-2">DecA<span className="text-primary">(I)</span>de</span>
            </div>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Log in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
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
                              onClick={() => {
                                field.onChange("roleplay");
                                setSelectedEventFormat("roleplay");
                              }}
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
                              onClick={() => {
                                field.onChange("written");
                                setSelectedEventFormat("written");
                              }}
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
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your specific event (required)" />
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
      
      {/* Right side - Hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12">
        <div className="h-full flex flex-col justify-center max-w-lg mx-auto">
          <h1 className="text-4xl font-bold font-heading mb-6">Master DECA with AI-Powered Practice</h1>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Custom Roleplay Generation</h3>
                <p className="text-white/80 mt-1">Practice with unlimited roleplay scenarios tailored to your event</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Performance Indicator Mastery</h3>
                <p className="text-white/80 mt-1">Learn and practice essential performance indicators with real-world examples</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Practice Tests & Analytics</h3>
                <p className="text-white/80 mt-1">Take exam-style tests and track your progress to identify areas for improvement</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-12 bg-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-white/20 h-12 w-12 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Who says there is no I in team?</h3>
                <p className="text-white/80 text-sm mt-1">DecA(I)de helps you stand out with personalized AI coaching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
