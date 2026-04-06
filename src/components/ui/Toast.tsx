'use client';

import React from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in min-w-72 max-w-md',
        colors[toast.type]
      )}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 start-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
