import React from 'react';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { YearSummary } from '@/types';

interface BudgetProgressProps {
  summary: YearSummary;
}

export function BudgetProgress({ summary }: BudgetProgressProps) {
  const { year, totalExpenses, remaining, percentUsed } = summary;

  const barColor =
    percentUsed >= 90
      ? 'bg-red-500'
      : percentUsed >= 75
      ? 'bg-amber-500'
      : 'bg-primary-500';

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            תקציב {year.year}
          </h3>
          <p className="text-xs text-slate-500">
            {formatCurrency(totalExpenses)} מתוך {formatCurrency(year.totalBudget)}
          </p>
        </div>
        <div className="text-end">
          <p
            className={cn(
              'text-2xl font-bold',
              percentUsed >= 90
                ? 'text-red-600'
                : percentUsed >= 75
                ? 'text-amber-600'
                : 'text-slate-900'
            )}
          >
            {formatPercent(percentUsed)}
          </p>
          <p className="text-xs text-slate-500">נוצל</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
        <div
          className={cn('h-3 rounded-full transition-all', barColor)}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>יתרה: <strong className="text-slate-700">{formatCurrency(remaining)}</strong></span>
        <span>סה״כ תקציב: <strong className="text-slate-700">{formatCurrency(year.totalBudget)}</strong></span>
      </div>
    </Card>
  );
}
