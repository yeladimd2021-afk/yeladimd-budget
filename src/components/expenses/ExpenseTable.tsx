'use client';

import React from 'react';
import Link from 'next/link';
import { Expense, SortConfig, ExpenseSortField, Category } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ReimbursementBadge } from './ReimbursementBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Trash2,
  Paperclip,
  ExternalLink,
  Receipt,
} from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: Category[];
  sort: SortConfig;
  onSort: (field: ExpenseSortField) => void;
  onEdit?: (id: string) => void;
  onDelete?: (expense: Expense) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function SortIcon({ field, sort }: { field: ExpenseSortField; sort: SortConfig }) {
  if (sort.field !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
  if (sort.direction === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-primary-600" />;
  return <ArrowDown className="h-3.5 w-3.5 text-primary-600" />;
}

function SortButton({
  field,
  label,
  sort,
  onSort,
}: {
  field: ExpenseSortField;
  label: string;
  sort: SortConfig;
  onSort: (field: ExpenseSortField) => void;
}) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors group"
    >
      {label}
      <SortIcon field={field} sort={sort} />
    </button>
  );
}

export function ExpenseTable({
  expenses,
  categories,
  sort,
  onSort,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ExpenseTableProps) {
  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name || id;
  const getCategoryColor = (id: string) =>
    categories.find(c => c.id === id)?.color || '#64748b';

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-8 w-8" />}
        title="לא נמצאו הוצאות"
        description="נסה לשנות את הסינון או להוסיף הוצאה חדשה"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              <SortButton field="date" label="תאריך" sort={sort} onSort={onSort} />
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <SortButton field="title" label="תיאור" sort={sort} onSort={onSort} />
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              <SortButton field="amount" label="סכום" sort={sort} onSort={onSort} />
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              <SortButton field="categoryName" label="קטגוריה" sort={sort} onSort={onSort} />
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              <SortButton field="paidBy" label="שולם ע״י" sort={sort} onSort={onSort} />
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              סטטוס החזר
            </th>
            <th className="text-end px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              ספק
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map(expense => (
            <tr
              key={expense.id}
              className={cn(
                'hover:bg-slate-50 transition-colors',
                expense.reimbursementStatus === 'ממתין' && 'bg-amber-50/30'
              )}
            >
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {formatDate(expense.date)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/expenses/${expense.id}`}
                  className="font-medium text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {expense.title}
                </Link>
                {expense.description && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {expense.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                >
                  {getCategoryName(expense.categoryId)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {expense.paidBy}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <ReimbursementBadge status={expense.reimbursementStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                {expense.vendor || '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  {expense.attachments?.length > 0 && (
                    <span className="text-slate-400" title={`${expense.attachments.length} קבצים`}>
                      <Paperclip className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {expense.externalLink && (
                    <a
                      href={expense.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-primary-600 transition-colors"
                      title="קישור חיצוני"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Link
                    href={`/expenses/${expense.id}`}
                    className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="צפייה"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {canEdit && onEdit && (
                    <button
                      onClick={() => onEdit(expense.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="עריכה"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && onDelete && (
                    <button
                      onClick={() => onDelete(expense)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="מחיקה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
