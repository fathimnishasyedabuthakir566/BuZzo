import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthState, UserRole } from "@/types";
import { authService } from "@/services/authService";

// ==========================================
// AUTH CONTEXT
// ==========================================

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// AUTH PROVIDER
// ==========================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.login({ email, password, role });
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.register({ name, email, password, role });
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
