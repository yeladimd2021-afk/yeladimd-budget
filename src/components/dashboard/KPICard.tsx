import React from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  highlight,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-5 shadow-sm',
        highlight ? 'border-primary-200 bg-primary-50' : 'border-slate-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p
            className={cn(
              'text-2xl font-bold',
              highlight ? 'text-primary-700' : 'text-slate-900'
            )}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
