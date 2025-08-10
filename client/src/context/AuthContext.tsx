import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  AuthContextValue,
  AuthUserNullable,
  AuthenticatedUser,
} from '@/types/user';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const TOKEN_KEY = 'MS_TOKEN';
export const USER_KEY = 'MS_USER';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AuthUserNullable>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUserNullable) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken: string, newUser: AuthenticatedUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), login, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

// Typed helpers for non-null access
export const useAuthUser = (): AuthenticatedUser => {
  const { user } = useAuthContext();
  if (!user) throw new Error('useAuthUser requires an authenticated user');
  return user;
};

export const useAuthToken = (): string => {
  const { token } = useAuthContext();
  if (!token) throw new Error('useAuthToken requires an authenticated token');
  return token;
};
