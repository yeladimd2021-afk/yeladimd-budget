'use client';

import React, { useState, useMemo } from 'react';
import { useYears } from '@/hooks/useYears';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { KPICard } from '@/components/dashboard/KPICard';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { Select } from '@/components/ui/Select';
import { SectionLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { HEBREW_MONTHS } from '@/lib/constants';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { CategorySummary, MonthlyData, Expense } from '@/types';

export default function DashboardPage() {
  const { years, loading: yearsLoading } = useYears();
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const { expenses, loading: expensesLoading } = useExpenses(
    selectedYearId || years[0]?.id
  );
  const { categories } = useCategories();

  // Auto-select current or latest year
  React.useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      const currentYear = years.find(y => y.year === new Date().getFullYear());
      setSelectedYearId(currentYear?.id || years[0].id);
    }
  }, [years, selectedYearId]);

  const selectedYear = years.find(y => y.id === selectedYearId) || years[0];

  const stats = useMemo(() => {
    if (!selectedYear) return null;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = selectedYear.totalBudget - totalExpenses;
    const percentUsed = selectedYear.totalBudget > 0
      ? (totalExpenses / selectedYear.totalBudget) * 100
      : 0;

    const pending = expenses.filter(e => e.reimbursementStatus === 'ממתין');
    const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalExpenses,
      remaining,
      percentUsed,
      expenseCount: expenses.length,
      pendingCount: pending.length,
      pendingAmount,
    };
  }, [selectedYear, expenses]);

  const categoryData = useMemo((): CategorySummary[] => {
    if (!expenses.length) return [];
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const existing = map.get(e.categoryId) || { total: 0, count: 0 };
      map.set(e.categoryId, { total: existing.total + e.amount, count: existing.count + 1 });
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return Array.from(map.entries())
      .map(([categoryId, data]) => {
        const cat = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name || categoryId,
          color: cat?.color || '#64748b',
          total: data.total,
          count: data.count,
          percentage: total > 0 ? (data.total / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const monthlyData = useMemo((): MonthlyData[] => {
    if (!expenses.length) return [];
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const date = new Date(e.date); // date is always an ISO string from Supabase
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + e.amount);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        const [, m] = month.split('-');
        return {
          month,
          monthLabel: HEBREW_MONTHS[parseInt(m) - 1],
          total,
        };
      });
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  if (yearsLoading) return <SectionLoader />;

  if (years.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">אין שנות תקציב. <a href="/years" className="text-primary-600 underline">הוסף שנה</a></p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">לוח בקרה</h1>
          <p className="text-sm text-slate-500 mt-0.5">סקירה כללית של תקציב המחלקה</p>
        </div>
        <Select
          options={years.map(y => ({ value: y.id, label: String(y.year) }))}
          value={selectedYearId}
          onChange={e => setSelectedYearId(e.target.value)}
          className="w-32"
        />
      </div>

      {/* Budget Progress */}
      {selectedYear && stats && (
        <BudgetProgress
          summary={{
            year: selectedYear,
            totalExpenses: stats.totalExpenses,
            remaining: stats.remaining,
            percentUsed: stats.percentUsed,
            expenseCount: stats.expenseCount,
            pendingReimbursements: stats.pendingCount,
            pendingReimbursementsAmount: stats.pendingAmount,
          }}
        />
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="סה״כ הוצאות"
            value={formatCurrency(stats.totalExpenses)}
            subtitle={`${stats.expenseCount} פריטים`}
            icon={<TrendingUp className="h-5 w-5 text-primary-600" />}
            iconColor="bg-primary-100"
          />
          <KPICard
            title="יתרה"
            value={formatCurrency(stats.remaining)}
            subtitle={`${formatPercent(100 - stats.percentUsed)} נותר`}
            icon={<Wallet className="h-5 w-5 text-green-600" />}
            iconColor="bg-green-100"
            highlight={stats.remaining > 0}
          />
          <KPICard
            title="ממתין להחזר"
            value={String(stats.pendingCount)}
            subtitle={formatCurrency(stats.pendingAmount)}
            icon={<RefreshCw className="h-5 w-5 text-amber-600" />}
            iconColor="bg-amber-100"
          />
          <KPICard
            title="הוצאות השנה"
            value={String(stats.expenseCount)}
            subtitle={`${formatPercent(stats.percentUsed)} מהתקציב`}
            icon={<Receipt className="h-5 w-5 text-slate-600" />}
            iconColor="bg-slate-100"
          />
        </div>
      )}

      {/* Charts */}
      {expensesLoading ? (
        <SectionLoader text="טוען גרפים..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart data={categoryData} />
          <MonthlyChart data={monthlyData} />
        </div>
      )}

      {/* Pending Reimbursements */}
      {expenses.filter(e => e.reimbursementStatus === 'ממתין').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <h3 className="font-semibold text-amber-800">הוצאות הממתינות להחזר</h3>
          </div>
          <div className="space-y-2">
            {expenses
              .filter(e => e.reimbursementStatus === 'ממתין')
              .slice(0, 4)
              .map(expense => {
                const cat = categories.find(c => c.id === expense.categoryId);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-amber-800">{expense.title}</span>
                    <div className="flex items-center gap-2 text-amber-700">
                      <span>{expense.paidBy}</span>
                      <span className="font-semibold">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <RecentExpenses expenses={recentExpenses} categories={categories} />
    </div>
  );
}
