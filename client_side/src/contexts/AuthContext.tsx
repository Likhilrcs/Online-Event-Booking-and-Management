import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/api';

export type UserRole = 'guest' | 'user' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (name: string, email: string, password: string, role: 'user' | 'organizer') => Promise<{ user: User }>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('eventify_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.auth.login({ email, password });
      const { user: userData, token } = res;
      api.setAuthToken(token);
      setUser(userData);
      localStorage.setItem('eventify_user', JSON.stringify(userData));
      return { user: userData };
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: 'user' | 'organizer') => {
    setIsLoading(true);
    try {
      const res: any = await api.auth.register({ name, email, password, role });
      const { user: userData, token } = res;
      api.setAuthToken(token);
      setUser(userData);
      localStorage.setItem('eventify_user', JSON.stringify(userData));
      return { user: userData };
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('eventify_user');
    api.setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
