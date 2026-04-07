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
    // Redirect to login only once auth state is confirmed and there is no user.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show spinner only while auth state is unknown (typically < 300ms).
  if (loading) return <PageLoader />;

  // Auth confirmed: no user → redirect is already in flight.
  if (!user) return <PageLoader />;

  // Role check — enforced only once the profile has loaded.
  // If profile is still null (loading in background), we grant access
  // optimistically; the check runs again once profile arrives.
  if (requiredRole && profile) {
    const hierarchy: Record<UserRole, number> = { admin: 3, editor: 2, viewer: 1 };
    if (hierarchy[profile.role] < hierarchy[requiredRole]) {
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
