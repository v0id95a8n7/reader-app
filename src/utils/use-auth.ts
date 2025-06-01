import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  user: User;
}

interface ErrorResponse {
  error: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuth {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuth {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json() as AuthResponse;
          setAuthState({
            user: data.user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Failed to fetch user data',
        });
      }
    };

    void fetchCurrentUser();
  }, []);

  
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json() as AuthResponse | ErrorResponse;
      
      if (response.ok) {
        setAuthState({
          user: (data as AuthResponse).user,
          isLoading: false,
          error: null,
        });
        
        router.push('/');
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: (data as ErrorResponse).error ?? 'Failed to login',
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred',
      }));
    }
  };

  
  const register = async (email: string, password: string, name?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json() as AuthResponse | ErrorResponse;
      
      if (response.ok) {
        setAuthState({
          user: (data as AuthResponse).user,
          isLoading: false,
          error: null,
        });
        
        router.push('/');
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: (data as ErrorResponse).error ?? 'Failed to register',
        }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred',
      }));
    }
  };

  
  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to logout',
      }));
    }
  };

  
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    clearError,
  };
} 