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
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // User is authenticated but has no profile row in public.users.
    // Sign out first to clear the session so the login page won't redirect
    // back to dashboard → breaking the redirect loop.
    if (!profile) {
      signOut().catch(() => {}).finally(() => router.replace('/login'));
    }
  }, [user, profile, loading, router, signOut]);

  if (loading) return <PageLoader />;
  if (!user || !profile) return <PageLoader />; // redirect already triggered above

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
