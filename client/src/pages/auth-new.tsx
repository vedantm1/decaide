import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
});

export default function AuthNew() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [_, navigate] = useLocation();
  const { user, isAuthenticated, login } = useAuth();

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
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Registration function
  const register = async (data: z.infer<typeof registerSchema>) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Force refresh of auth context
      window.location.href = '/';
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
  };

  // Login submit handler
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration submit handler
  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      await register(data);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <motion.div variants={itemVariants}>
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">D</span>
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-bold tracking-tight">
                Welcome to DecA(I)de
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to access your personalized DECA preparation
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="pb-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Error message display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                >
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </motion.div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Login Form */}
                  {activeTab === "login" && (
                    <TabsContent value="login" forceMount>
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
                          
                          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                            {isLoading ? (
                              <div className="flex items-center">
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                <span>Logging in...</span>
                              </div>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  )}
                  
                  {/* Registration Form */}
                  {activeTab === "register" && (
                    <TabsContent value="register" forceMount>
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
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Email is optional but recommended for account recovery
                                </p>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                            {isLoading ? (
                              <div className="flex items-center">
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                <span>Creating account...</span>
                              </div>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-0 pb-6 px-6">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" type="button" className="bg-card w-full">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Continue with Google
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you agree to our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}