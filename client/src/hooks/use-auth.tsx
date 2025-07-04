import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Mock User Interface
interface User {
  id: string;
  username: string;
  email: string;
  subscriptionTier: 'free' | 'standard' | 'premium';
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create Auth Context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
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
        throw new Error('Invalid credentials');
      }
      
      const userData = await response.json();
      setUser({
        id: userData.id?.toString(),
        username: userData.username,
        email: userData.email || '',
        subscriptionTier: userData.subscriptionTier || 'standard',
        firstName: userData.firstName,
        lastName: userData.lastName,
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
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);