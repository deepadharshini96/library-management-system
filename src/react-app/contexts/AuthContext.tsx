import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/react-app/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  membershipDate: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch {
      console.warn('Ignoring invalid stored user data');
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData } = await ApiService.login(email, password);
      const normalizedUser = {
        ...userData,
        role: userData.role || (userData.email === 'admin@library.com' ? 'admin' : 'user'),
      };
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setIsLoading(true);
    try {
      const userData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        membershipDate: new Date().toISOString().split('T')[0],
        role: (email === 'admin@library.com' ? 'admin' : 'user') as 'user' | 'admin',
      };

      await ApiService.createUser(userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};