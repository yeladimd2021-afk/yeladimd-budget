'use client';

import React, { useState } from 'react';
import { seedDatabase } from '@/lib/seed';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Database } from 'lucide-react';

export default function SeedPage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    if (!confirm('האם להטעין נתוני דוגמה? פעולה זו מוסיפה נתונים לא תמחוק קיימים.')) return;
    setRunning(true);
    setError('');
    try {
      await seedDatabase();
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Database className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">טעינת נתוני דוגמה</h1>
          <p className="text-sm text-slate-500 mb-6">
            פעולה זו תיצור קטגוריות ברירת מחדל, שנות תקציב (2024–2026) והוצאות לדוגמה.
            <br />
            <strong className="text-amber-600">הרץ פעם אחת בלבד!</strong>
          </p>
          {done ? (
            <div className="text-green-600 font-medium">✅ הנתונים הוטענו בהצלחה!</div>
          ) : (
            <Button onClick={handleSeed} loading={running} size="lg">
              טען נתוני דוגמה
            </Button>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
