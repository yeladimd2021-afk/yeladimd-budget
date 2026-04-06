import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Spinner({ size = 'md', className, text }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

  if (text) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <Loader2 className={cn('animate-spin text-primary-600', sizes[size])} />
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    );
  }

  return (
    <Loader2 className={cn('animate-spin text-primary-600', sizes[size], className)} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner size="lg" text="טוען..." />
    </div>
  );
}

export function SectionLoader({ text = 'טוען נתונים...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="md" text={text} />
    </div>
  );
}
