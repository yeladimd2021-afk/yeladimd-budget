import React from 'react';
import Link from 'next/link';
import { Expense, Category } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReimbursementBadge } from '@/components/expenses/ReimbursementBadge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';

interface RecentExpensesProps {
  expenses: Expense[];
  categories: Category[];
}

export function RecentExpenses({ expenses, categories }: RecentExpensesProps) {
  const getCategoryColor = (id: string) =>
    categories.find(c => c.id === id)?.color || '#64748b';
  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name || '';

  return (
    <Card>
      <CardHeader
        actions={
          <Link
            href="/expenses"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            כל ההוצאות
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        }
      >
        <CardTitle>הוצאות אחרונות</CardTitle>
      </CardHeader>

      {expenses.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">אין הוצאות עדיין</p>
      ) : (
        <div className="space-y-3">
          {expenses.map(expense => (
            <Link
              key={expense.id}
              href={`/expenses/${expense.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
              >
                {getCategoryName(expense.categoryId).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{expense.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(expense.date)} • {expense.paidBy}
                </p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </p>
                <div className="flex justify-end mt-0.5">
                  <ReimbursementBadge status={expense.reimbursementStatus} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
