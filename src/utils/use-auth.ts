import { useState, useEffect } from "react";

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
  login: (
    email: string,
    password: string,
    redirect?: string | null,
  ) => Promise<void>;
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("Fetching current user...");
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = (await response.json()) as AuthResponse;
          console.log("User data received:", data);
          setAuthState({
            user: data.user,
            isLoading: false,
            error: null,
          });
        } else {
          console.log("Not logged in");
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setAuthState({
          user: null,
          isLoading: false,
          error: "Failed to fetch user data",
        });
      }
    };

    void fetchCurrentUser();
  }, []);

  const navigateTo = (path: string) => {
    console.log("Navigating to:", path);

    // Programmatic redirection using window.location
    window.location.href = path;
  };

  const login = async (
    email: string,
    password: string,
    redirect?: string | null,
  ) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("Attempting login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = (await response.json()) as AuthResponse | ErrorResponse;

      if (response.ok) {
        console.log("Login successful:", data);
        setAuthState({
          user: (data as AuthResponse).user,
          isLoading: false,
          error: null,
        });

        console.log("Login successful, redirecting to", redirect ?? "/");

        // Redirect to requested page or home page
        if (redirect) {
          const decodedRedirect = decodeURIComponent(redirect);
          navigateTo(decodedRedirect);
        } else {
          navigateTo("/");
        }
      } else {
        console.error("Login failed:", data);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: (data as ErrorResponse).error ?? "Failed to login",
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred",
      }));
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("Attempting registration...");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });

      const data = (await response.json()) as AuthResponse | ErrorResponse;

      if (response.ok) {
        console.log("Registration successful:", data);
        setAuthState({
          user: (data as AuthResponse).user,
          isLoading: false,
          error: null,
        });

        console.log("Registration successful, redirecting to home");
        navigateTo("/");
      } else {
        console.error("Registration failed:", data);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: (data as ErrorResponse).error ?? "Failed to register",
        }));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred",
      }));
    }
  };

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      console.log("Attempting logout...");
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });

      console.log("Logout successful, redirecting to login");
      navigateTo("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to logout",
      }));
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
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
