'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ExpenseFilters, Category } from '@/types';
import { REIMBURSEMENT_STATUSES } from '@/lib/constants';
import { Search, X } from 'lucide-react';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  categories: Category[];
  payers: string[];
}

export function ExpenseFiltersPanel({
  filters,
  onChange,
  categories,
  payers,
}: ExpenseFiltersProps) {
  const hasActiveFilters =
    filters.categoryId ||
    filters.paidBy ||
    filters.reimbursementStatus ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute inset-y-0 end-3 my-auto h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="חיפוש חופשי..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pe-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          options={[
            { value: '', label: 'כל הקטגוריות' },
            ...categories.map(c => ({ value: c.id, label: c.name })),
          ]}
          value={filters.categoryId || ''}
          onChange={e => onChange({ ...filters, categoryId: e.target.value || undefined })}
          label="קטגוריה"
        />

        <Select
          options={[
            { value: '', label: 'כל המשלמים' },
            ...payers.map(p => ({ value: p, label: p })),
          ]}
          value={filters.paidBy || ''}
          onChange={e => onChange({ ...filters, paidBy: e.target.value || undefined })}
          label="שולם על ידי"
        />

        <Select
          options={[
            { value: '', label: 'כל הסטטוסים' },
            ...REIMBURSEMENT_STATUSES.map(s => ({ value: s, label: s })),
          ]}
          value={filters.reimbursementStatus || ''}
          onChange={e =>
            onChange({
              ...filters,
              reimbursementStatus: (e.target.value as ExpenseFilters['reimbursementStatus']) || undefined,
            })
          }
          label="סטטוס החזר"
        />

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={clearFilters}
              className="text-slate-500 w-full"
            >
              נקה סינון
            </Button>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="מתאריך"
          value={filters.dateFrom || ''}
          onChange={e => onChange({ ...filters, dateFrom: e.target.value || undefined })}
        />
        <Input
          type="date"
          label="עד תאריך"
          value={filters.dateTo || ''}
          onChange={e => onChange({ ...filters, dateTo: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
