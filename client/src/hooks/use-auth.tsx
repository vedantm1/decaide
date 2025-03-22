import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        
        // Handle specific error responses
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Invalid username or password. Please try again.");
          } else if (res.status === 429) {
            throw new Error("Too many login attempts. Please try again later.");
          } else {
            throw new Error("Server error. Please try again later.");
          }
        }
        
        return await res.json();
      } catch (err: any) {
        console.error("Login error:", err);
        
        // Provide user-friendly error message
        if (err.message.includes("fetch failed") || err.message.includes("NetworkError")) {
          throw new Error("Network connection issue. Please check your internet connection.");
        }
        
        throw err; // Rethrow captured error with enhanced message
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Set flag for welcome animation on dashboard
      sessionStorage.setItem('justLoggedIn', 'true');
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        
        // Handle specific error responses
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          
          if (res.status === 400 && errorData.message?.includes("Username already exists")) {
            throw new Error("This username is already taken. Please choose another one.");
          } else if (res.status === 400) {
            throw new Error(errorData.message || "Invalid registration information. Please check your details.");
          } else {
            throw new Error("Server error. Please try again later.");
          }
        }
        
        return await res.json();
      } catch (err: any) {
        console.error("Registration error:", err);
        
        // Provide user-friendly error message for network issues
        if (err.message.includes("fetch failed") || err.message.includes("NetworkError")) {
          throw new Error("Network connection issue. Please check your internet connection.");
        }
        
        throw err; // Rethrow captured error with enhanced message
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Set flag for welcome animation on dashboard (first-time login)
      sessionStorage.setItem('justLoggedIn', 'true');
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user data
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear all user-specific session storage
      sessionStorage.removeItem('diegoAppearance');
      sessionStorage.removeItem('justLoggedIn');
      
      // Clear other user-session related stored data
      // This ensures theme and settings don't persist between accounts
      sessionStorage.clear();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
