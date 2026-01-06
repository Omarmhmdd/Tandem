import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { storage } from '../utils/storage';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { User, AuthContextType, AuthResponse, AuthResult } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient(); 

  const setAuthUser = (userData: User) => {
    setUser(userData);
    storage.set('tandem_user', userData);
    queryClient.clear();
  };

  useEffect(() => {
    const storedUser = storage.get<User | null>('tandem_user', null);
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<AuthResponse>(ENDPOINTS.LOGIN, { email, password });

      if (response.data && response.data.user && response.data.access_token) {
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          token: response.data.access_token,
        };

        setAuthUser(userData);
        
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<AuthResponse>(ENDPOINTS.REGISTER, {
        email,
        password,
        password_confirmation: password,
        first_name: firstName,
        last_name: lastName,
      });

      if (response.data && response.data.user && response.data.access_token) {
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          token: response.data.access_token,
        };

        setAuthUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      console.error('Logout failed:', errorMessage);
    } finally {
      setUser(null);
      storage.remove('tandem_user');
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};