'use client';

import { authStorage } from '@/lib/auth-storage';
import { authService } from '@/services/auth.service';
import { AuthResponse, User } from '@/types';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(values: { email: string; password: string }): Promise<User>;
  register(values: { name: string; email: string; phone?: string; password: string }): Promise<User>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authStorage.get()) { queueMicrotask(() => setLoading(false)); return; }
    authService.me().then(setUser).catch(() => authStorage.clear()).finally(() => setLoading(false));
  }, []);

  const accept = (response: AuthResponse) => {
    authStorage.set(response.accessToken);
    setUser(response.user);
    return response.user;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (values) => accept(await authService.login(values)),
    register: async (values) => accept(await authService.register(values)),
    logout: () => { authStorage.clear(); setUser(null); router.push('/'); },
  }), [user, loading, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
