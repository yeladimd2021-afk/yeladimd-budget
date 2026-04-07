'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  // Redirect once auth is confirmed and user is already logged in.
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const getHebrewError = (msg: string): string => {
    if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) return 'אימייל או סיסמה שגויים';
    if (msg.includes('Email not confirmed')) return 'האימייל לא אומת';
    if (msg.includes('Too many requests'))   return 'יותר מדי ניסיונות, נסי שוב מאוחר יותר';
    if (msg.includes('disabled'))            return 'החשבון מושבת';
    return 'שגיאת התחברות, נסי שוב';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('יש למלא אימייל וסיסמה'); return; }
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(getHebrewError((err as Error).message ?? ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">מחלקה ד׳</h1>
          <p className="text-slate-400 text-sm">מערכת ניהול תקציב</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">כניסה למערכת</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="אימייל"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="סיסמה"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
            />
            <Button type="submit" loading={submitting} className="w-full" size="lg">
              כניסה
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          פסיכיאטריית ילדים אשפוז • מערכת פנימית
        </p>
      </div>
    </div>
  );
}
