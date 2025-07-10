import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// User Interface matching backend data structure
interface User {
  id: string;
  username: string;
  email: string;
  subscriptionTier: 'free' | 'standard' | 'premium';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  selectedEvent?: string;
  selectedCluster?: string;
  eventFormat?: string;
  eventCode?: string;
  eventType?: string;
  instructionalArea?: string;
  uiTheme?: string;
  colorScheme?: string;
  theme?: string;
  points?: number;
  streak?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

// Create Auth Context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: () => {},
});

// Sample mock user for testing UI
const MOCK_USER: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  subscriptionTier: 'standard',
  avatar: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff',
  firstName: 'Test',
  lastName: 'User'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data from the backend
  const { data: userData, isLoading: userLoading, refetch } = useQuery({
    queryKey: ['/api/user'],
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!userLoading) {
      if (userData) {
        setUser({
          id: userData.id?.toString(),
          username: userData.username,
          email: userData.email || '',
          subscriptionTier: userData.subscriptionTier || 'standard',
          firstName: userData.firstName,
          lastName: userData.lastName,
          selectedEvent: userData.selectedEvent,
          selectedCluster: userData.selectedCluster,
          eventFormat: userData.eventFormat,
          eventCode: userData.eventCode,
          eventType: userData.eventType,
          instructionalArea: userData.instructionalArea,
          uiTheme: userData.uiTheme,
          colorScheme: userData.colorScheme,
          theme: userData.theme,
          points: userData.points,
          streak: userData.streak,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [userData, userLoading]);
  
  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important for session cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid credentials' }));
        throw new Error(errorData.error || 'Invalid credentials');
      }
      
      const userData = await response.json();
      setUser({
        id: userData.id?.toString(),
        username: userData.username,
        email: userData.email || '',
        subscriptionTier: userData.subscriptionTier || 'standard',
        firstName: userData.firstName,
        lastName: userData.lastName,
        selectedEvent: userData.selectedEvent,
        selectedCluster: userData.selectedCluster,
      });
      
      // Refetch user data to ensure consistency
      refetch();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Important for session cookies
      });
      
      setUser(null);
      refetch();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: () => refetch(),
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Add registration mutation
  const registerMutation = {
    mutate: async (userData: any, options?: { onSuccess?: () => void; onError?: () => void }) => {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        }
        
        const user = await response.json();
        context.refreshUser();
        options?.onSuccess?.();
      } catch (error) {
        console.error('Registration failed:', error);
        options?.onError?.();
        throw error;
      }
    },
    isPending: false,
  };

  const loginMutation = {
    mutate: async (credentials: any, options?: { onSuccess?: () => void; onError?: () => void }) => {
      try {
        await context.login(credentials.username, credentials.password);
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.();
        throw error;
      }
    },
    isPending: false,
  };

  return {
    ...context,
    registerMutation,
    loginMutation,
  };
};