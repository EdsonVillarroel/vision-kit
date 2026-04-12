import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { platformAuthService } from '../services/platformAuthService';
import type { LoginCredentials, PlatformAdmin } from '../types';

interface AuthContextType {
  admin: PlatformAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PlatformAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('platform_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresAt: number = payload.exp * 1000;
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (expiresAt - Date.now() < oneDayMs) {
              const res = await platformAuthService.refreshToken();
              if (res?.access_token) {
                localStorage.setItem('platform_token', res.access_token);
              }
            }
          } catch {
            // token malformado — dejar que falle en getAdmin()
          }
        }
        const adminData = await platformAuthService.getAdmin();
        if (adminData) setAdmin(adminData);
      } catch (err) {
        console.error('Failed to restore platform auth session', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await platformAuthService.login(credentials);
      setAdmin(response.admin);
      localStorage.setItem('platform_token', response.token);
      localStorage.setItem('platform_admin', JSON.stringify(response.admin));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    platformAuthService.logout();
    setAdmin(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, isLoading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlatformAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('usePlatformAuth must be used within a PlatformAuthProvider');
  }
  return context;
};
