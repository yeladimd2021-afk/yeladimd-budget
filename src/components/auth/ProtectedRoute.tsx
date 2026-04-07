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
    // Only redirect when auth is fully resolved and there is definitely no user
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Still initialising — show loader, do NOT redirect or sign out
  if (loading) return <PageLoader />;

  // No user at all → redirect is already in flight from the effect above
  if (!user) return <PageLoader />;

  // User authenticated but profile not yet fetched (e.g. slow network) → wait
  if (!profile) return <PageLoader />;

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
