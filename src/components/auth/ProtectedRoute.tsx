'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/Spinner';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    // If auth is resolved, user exists, but profile is missing → sign-out state; redirect to login
    if (!loading && user && profile === null) {
      router.replace('/login');
    }
  }, [user, profile, loading, router]);

  if (loading) return <PageLoader />;
  if (!user) return <PageLoader />; // redirect in flight
  if (!profile) return <PageLoader />; // redirect in flight

  if (requiredRole) {
    const roleHierarchy: Record<UserRole, number> = { admin: 3, editor: 2, viewer: 1 };
    if (roleHierarchy[profile.role] < roleHierarchy[requiredRole]) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-2xl mb-2">🚫</p>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">אין הרשאה</h2>
            <p className="text-sm text-slate-500">אין לך הרשאה לצפות בדף זה</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
