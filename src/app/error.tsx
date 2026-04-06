'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">אירעה שגיאה</h2>
        <p className="text-sm text-slate-500 mb-4">{error.message}</p>
        <Button onClick={reset}>נסה שוב</Button>
      </div>
    </div>
  );
}
