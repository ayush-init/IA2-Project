import React, { createContext, useContext, useState, useEffect } from 'react';
import { Librarian } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Librarian | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shelflife_token'));
  const [user, setUser] = useState<Librarian | null>(() => {
    const saved = localStorage.getItem('shelflife_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('shelflife_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('shelflife_user', JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        // Token expired or invalid
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await api.auth.login(credentials);
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('shelflife_token', response.token);
      localStorage.setItem('shelflife_user', JSON.stringify(response.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shelflife_token');
    localStorage.removeItem('shelflife_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
