'use client';

import React, { useState, useMemo } from 'react';
import { useYears } from '@/hooks/useYears';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getAllExpensesForYear } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { SectionLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { BudgetYear } from '@/types';
import { Plus, Pencil, CalendarDays, TrendingUp, Wallet } from 'lucide-react';

function YearForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
}: {
  defaultValues?: Partial<{ year: number; totalBudget: number; notes: string }>;
  onSubmit: (data: { year: number; totalBudget: number; notes: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [year, setYear] = useState(defaultValues?.year || new Date().getFullYear());
  const [budget, setBudget] = useState(String(defaultValues?.totalBudget || ''));
  const [notes, setNotes] = useState(defaultValues?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || parseFloat(budget) <= 0) return;
    await onSubmit({ year, totalBudget: parseFloat(budget), notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שנה"
        type="number"
        min="2020"
        max="2099"
        value={year}
        onChange={e => setYear(parseInt(e.target.value))}
        required
      />
      <Input
        label="תקציב שנתי (₪)"
        type="number"
        min="0"
        step="1000"
        placeholder="0"
        value={budget}
        onChange={e => setBudget(e.target.value)}
        required
      />
      <Input
        label="הערות"
        placeholder="הערות אופציונליות..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button type="submit" loading={loading}>שמור</Button>
      </div>
    </form>
  );
}

interface YearCardData {
  year: BudgetYear;
  totalExpenses: number;
  expenseCount: number;
}

function YearCard({
  data,
  onEdit,
  isAdmin,
}: {
  data: YearCardData;
  onEdit: () => void;
  isAdmin: boolean;
}) {
  const { year, totalExpenses, expenseCount } = data;
  const remaining = year.totalBudget - totalExpenses;
  const pct = year.totalBudget > 0 ? (totalExpenses / year.totalBudget) * 100 : 0;
  const isCurrentYear = year.year === new Date().getFullYear();

  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-primary-500';

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${isCurrentYear ? 'border-primary-300 ring-1 ring-primary-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <h3 className="text-xl font-bold text-slate-900">{year.year}</h3>
            {isCurrentYear && (
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                שנה נוכחית
              </span>
            )}
          </div>
          {year.notes && <p className="text-xs text-slate-500 mt-0.5">{year.notes}</p>}
        </div>
        {isAdmin && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-500">תקציב</p>
          <p className="text-sm font-bold text-slate-900">{formatCurrency(year.totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">הוצא</p>
          <p className="text-sm font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">יתרה</p>
          <p className={`text-sm font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{formatPercent(pct)} נוצל</span>
          <span>{expenseCount} הוצאות</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function YearsPage() {
  const { years, loading, createYear, updateYear } = useYears();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editYear, setEditYear] = useState<BudgetYear | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [yearData, setYearData] = useState<Record<string, YearCardData>>({});

  // Load expense totals for each year
  React.useEffect(() => {
    const loadData = async () => {
      const results: Record<string, YearCardData> = {};
      for (const year of years) {
        try {
          const expenses = await getAllExpensesForYear(year.id);
          const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
          results[year.id] = { year, totalExpenses, expenseCount: expenses.length };
        } catch {
          results[year.id] = { year, totalExpenses: 0, expenseCount: 0 };
        }
      }
      setYearData(results);
    };
    if (years.length > 0) loadData();
  }, [years]);

  const handleCreate = async (data: { year: number; totalBudget: number; notes: string }) => {
    setSubmitting(true);
    try {
      await createYear(data.year, data.totalBudget, data.notes);
      showToast('שנת התקציב נוספה', 'success');
      setShowAdd(false);
    } catch {
      showToast('שגיאה בהוספת שנה', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: { year: number; totalBudget: number; notes: string }) => {
    if (!editYear) return;
    setSubmitting(true);
    try {
      await updateYear(editYear.id, { totalBudget: data.totalBudget, notes: data.notes });
      showToast('שנת התקציב עודכנה', 'success');
      setEditYear(null);
    } catch {
      showToast('שגיאה בעדכון', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SectionLoader />;

  const totalBudgetAllYears = years.reduce((s, y) => s + y.totalBudget, 0);
  const totalExpensesAllYears = Object.values(yearData).reduce((s, d) => s + d.totalExpenses, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">שנות תקציב</h1>
          <p className="text-sm text-slate-500 mt-0.5">{years.length} שנים מוגדרות</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
            שנה חדשה
          </Button>
        )}
      </div>

      {/* Summary cards */}
      {years.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">סה״כ תקציב</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalBudgetAllYears)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">סה״כ הוצאות</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalExpensesAllYears)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">סה״כ יתרה</p>
            <p className={`text-xl font-bold ${totalBudgetAllYears - totalExpensesAllYears >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(totalBudgetAllYears - totalExpensesAllYears)}
            </p>
          </div>
        </div>
      )}

      {/* Year cards */}
      {years.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">אין שנות תקציב עדיין</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              הוסף שנה ראשונה
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {years.map(year => (
            <YearCard
              key={year.id}
              data={yearData[year.id] || { year, totalExpenses: 0, expenseCount: 0 }}
              onEdit={() => setEditYear(year)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Add Year Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="הוסף שנת תקציב">
        <YearForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Year Modal */}
      <Modal isOpen={!!editYear} onClose={() => setEditYear(null)} title="עריכת שנת תקציב">
        {editYear && (
          <YearForm
            defaultValues={{ year: editYear.year, totalBudget: editYear.totalBudget, notes: editYear.notes }}
            onSubmit={handleUpdate}
            onCancel={() => setEditYear(null)}
            loading={submitting}
          />
        )}
      </Modal>
    </div>
  );
}
