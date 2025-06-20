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
  
  // Simulate fetching user data on initial load
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      
      try {
        // Simulate network request delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if user is logged in via localStorage (in a real app, this would be a proper token check)
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
          // Get stored username if available
          const storedUsername = localStorage.getItem('username');
          if (storedUsername) {
            // Use the stored username instead of the mock one
            setUser({
              ...MOCK_USER,
              username: storedUsername
            });
          } else {
            setUser(MOCK_USER);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, validate credentials with a backend service
      if (username && password) {
        // Set auth token and username in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        // Create user data with the actual username entered by the user
        const userData = {
          ...MOCK_USER,
          username: username,
        };
        setUser(userData);
        return;
      }
      
      throw new Error('Invalid credentials');
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
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear auth token and username from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      setUser(null);
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