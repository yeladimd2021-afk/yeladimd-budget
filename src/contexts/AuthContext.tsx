'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  /** True only while the initial auth state is being determined (< 500ms). */
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

function mapProfile(row: UserRow): UserProfile {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserProfile['role'],
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // loading is true only while the INITIAL auth state is unknown.
  // It resolves from localStorage — no network call needed.
  const [loading, setLoading] = useState(true);

  // ── Load profile row from public.users (runs in background) ────────────────
  const loadProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();
      if (!error && data) {
        setProfile(mapProfile(data as UserRow));
        // fire-and-forget: update last_login_at
        supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', uid)
          .then(() => {});
      }
    } catch {
      // Profile load failed — user stays authenticated, some features
      // will be unavailable until profile is loaded.
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Hard safety net: never stay loading more than 3 seconds
    const safety = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    // onAuthStateChange fires INITIAL_SESSION synchronously from the
    // locally-stored session — no network round-trip required.
    // This is the recommended pattern in Supabase JS v2.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (!mounted) return;

        setSession(sess);
        const currentUser = sess?.user ?? null;
        setUser(currentUser);

        // Unblock the UI as soon as auth state is known.
        // Profile loading happens BELOW in the background.
        clearTimeout(safety);
        setLoading(false);

        if (currentUser) {
          // Load profile without awaiting — doesn't block the page.
          loadProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setProfile(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const isAdmin  = profile?.role === 'admin';
  const isEditor = profile?.role === 'admin' || profile?.role === 'editor';

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, isAdmin, isEditor, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
