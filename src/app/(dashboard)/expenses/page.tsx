'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useYears } from '@/hooks/useYears';
import { useExpenses, useFilteredExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useStorage } from '@/hooks/useStorage';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseFiltersPanel } from '@/components/expenses/ExpenseFilters';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionLoader } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';
import { Expense, ExpenseFilters, SortConfig } from '@/types';
import { Plus, SlidersHorizontal, List, LayoutGrid } from 'lucide-react';

export default function ExpensesPage() {
  const router = useRouter();
  const { isEditor, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { years, loading: yearsLoading } = useYears();
  const [selectedYearId, setSelectedYearId] = useState('');
  const { expenses, loading, deleteExpense } = useExpenses(
    selectedYearId || years[0]?.id
  );
  const { categories } = useCategories();
  const { deleteFile } = useStorage();

  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [sort, setSort] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auto-select year
  React.useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      const cur = years.find(y => y.year === new Date().getFullYear());
      setSelectedYearId(cur?.id || years[0].id);
    }
  }, [years, selectedYearId]);

  const payers = useMemo(
    () => [...new Set(expenses.map(e => e.paidBy))].sort(),
    [expenses]
  );

  const activeFilters = useMemo(() => ({ ...filters, yearId: selectedYearId }), [filters, selectedYearId]);
  const filtered = useFilteredExpenses(expenses, activeFilters, sort);

  const totalFiltered = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);

  const handleSort = (field: typeof sort.field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Delete storage files first
      for (const att of deleteTarget.attachments || []) {
        await deleteFile(att.storagePath);
      }
      await deleteExpense(deleteTarget.id);
      showToast('ההוצאה נמחקה', 'success');
    } catch {
      showToast('שגיאה במחיקה', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const selectedYear = years.find(y => y.id === selectedYearId);

  if (yearsLoading) return <SectionLoader />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">הוצאות</h1>
          <p className="text-sm text-slate-500">
            {filtered.length} הוצאות • סה״כ {formatCurrency(totalFiltered)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={years.map(y => ({ value: y.id, label: String(y.year) }))}
            value={selectedYearId}
            onChange={e => setSelectedYearId(e.target.value)}
            className="w-28"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-slate-300 text-slate-500 hover:bg-slate-50'
            }`}
            title="סינון"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode(v => v === 'table' ? 'cards' : 'table')}
            className="p-2 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
            title="החלף תצוגה"
          >
            {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
          {isEditor && (
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/expenses/new')}
            >
              הוצאה חדשה
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ExpenseFiltersPanel
          filters={filters}
          onChange={setFilters}
          categories={categories}
          payers={payers}
        />
      )}

      {/* Year budget bar */}
      {selectedYear && (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>תקציב {selectedYear.year}</span>
            <span>
              {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))} / {formatCurrency(selectedYear.totalBudget)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (expenses.reduce((s, e) => s + e.amount, 0) / selectedYear.totalBudget) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SectionLoader />
      ) : viewMode === 'table' ? (
        <div className="hidden md:block">
          <ExpenseTable
            expenses={filtered}
            categories={categories}
            sort={sort}
            onSort={handleSort}
            onEdit={isEditor ? id => router.push(`/expenses/${id}/edit`) : undefined}
            onDelete={isAdmin ? e => setDeleteTarget(e) : undefined}
            canEdit={isEditor}
            canDelete={isAdmin}
          />
        </div>
      ) : null}

      {/* Mobile always shows cards; desktop follows viewMode */}
      <div className={viewMode === 'table' ? 'md:hidden' : ''}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              categories={categories}
              onEdit={isEditor ? id => router.push(`/expenses/${id}/edit`) : undefined}
              onDelete={isAdmin ? e => setDeleteTarget(e) : undefined}
              canEdit={isEditor}
              canDelete={isAdmin}
            />
          ))}
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg mb-1">לא נמצאו הוצאות</p>
            <p className="text-sm">נסה לשנות את הסינון</p>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="מחיקת הוצאה"
        message={`האם למחוק את "${deleteTarget?.title}"? פעולה זו אינה הפיכה.`}
        confirmText="מחק"
        loading={deleting}
      />
    </div>
  );
}
