'use client';

import React from 'react';
import Link from 'next/link';
import { Expense, Category } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReimbursementBadge } from './ReimbursementBadge';
import { Paperclip, ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  categories: Category[];
  onEdit?: (id: string) => void;
  onDelete?: (expense: Expense) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ExpenseCard({
  expense,
  categories,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ExpenseCardProps) {
  const category = categories.find(c => c.id === expense.categoryId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/expenses/${expense.id}`}
            className="font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
          >
            {expense.title}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(expense.date)}</p>
        </div>
        <div className="text-left shrink-0">
          <p className="font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {category && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
        <ReimbursementBadge status={expense.reimbursementStatus} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
        <div>
          <span className="font-medium text-slate-600">שולם ע״י: </span>
          {expense.paidBy}
        </div>
        {expense.vendor && (
          <div>
            <span className="font-medium text-slate-600">ספק: </span>
            {expense.vendor}
          </div>
        )}
        <div>
          <span className="font-medium text-slate-600">אמצעי תשלום: </span>
          {expense.paymentMethod}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {expense.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip className="h-3 w-3" />
              {expense.attachments.length}
            </span>
          )}
          {expense.externalLink && (
            <a
              href={expense.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(expense.id)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
