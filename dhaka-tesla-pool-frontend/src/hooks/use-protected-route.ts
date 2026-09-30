'use client';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useProtectedRoute(role: UserRole) {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && (!auth.user || auth.user.role !== role)) router.replace('/login');
  }, [auth.loading, auth.user, role, router]);
  return auth;
}

