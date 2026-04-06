'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, UserRole } from '@/types';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

function mapUser(row: UserRow): UserProfile {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserRole,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(new Error(err.message));
    } else {
      setUsers((data as UserRow[]).map(mapUser));
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /**
   * Creates a new auth user + profile row via the server-side API route.
   * The route uses SUPABASE_SERVICE_ROLE_KEY so we never expose it client-side.
   */
  const createUser = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole
    ): Promise<void> => {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'שגיאה ביצירת משתמש');
      await fetchUsers();
    },
    [fetchUsers]
  );

  const updateUserRole = useCallback(
    async (uid: string, role: UserRole): Promise<void> => {
      const { error: err } = await supabase
        .from('users')
        .update({ role })
        .eq('id', uid);
      if (err) throw new Error(err.message);
      await fetchUsers();
    },
    [fetchUsers]
  );

  const updateUserStatus = useCallback(
    async (uid: string, isActive: boolean): Promise<void> => {
      const { error: err } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', uid);
      if (err) throw new Error(err.message);
      await fetchUsers();
    },
    [fetchUsers]
  );

  const updateUserName = useCallback(
    async (uid: string, displayName: string): Promise<void> => {
      const { error: err } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('id', uid);
      if (err) throw new Error(err.message);
      await fetchUsers();
    },
    [fetchUsers]
  );

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUserRole,
    updateUserStatus,
    updateUserName,
  };
}
