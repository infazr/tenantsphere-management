import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, DecodedToken, UserRole, SignInRequest } from '@/types/api';
import apiService from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (credentials: SignInRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeTokenToUser(token: string): User | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    // Determine role based on PrivilegeType and tenant
    let role: UserRole = 'Employee';
    if (decoded.PrivilegeType === 'EmsAdmin' && !decoded.tenant) {
      role = 'SuperAdmin';
    } else if (decoded.PrivilegeType === 'TenantAdmin' || decoded.tenant) {
      role = 'TenantAdmin';
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role,
      tenantId: decoded.tenant || null,
      tenantKey: decoded.TenantKey || null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedUser = decodeTokenToUser(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: SignInRequest) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiService.signIn(credentials);
      const token = response.result?.token;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        const decodedUser = decodeTokenToUser(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          throw new Error('Invalid token received');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.signOut();
    } catch {
      // Continue with logout even if API fails
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SuperAdmin',
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
