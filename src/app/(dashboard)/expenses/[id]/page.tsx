'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchExpenseById, useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useStorage } from '@/hooks/useStorage';
import { FileUpload } from '@/components/expenses/FileUpload';
import { ReimbursementBadge } from '@/components/expenses/ReimbursementBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Expense } from '@/types';
import {
  ArrowRight,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  CreditCard,
  Store,
  FileText,
  MessageSquare,
  Clock,
} from 'lucide-react';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isEditor, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { categories } = useCategories();
  const { deleteFile } = useStorage();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load expense via Supabase (no Firebase imports needed)
  const loadExpense = useCallback(async () => {
    const data = await fetchExpenseById(id);
    setExpense(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadExpense(); }, [loadExpense]);

  // Hooks for mutations — yearId used only for list scoping, mutations work by expense ID
  const { deleteExpense, addAttachment, removeAttachment } = useExpenses(expense?.yearId);

  const category = categories.find(c => c.id === expense?.categoryId);

  const handleDelete = async () => {
    if (!expense) return;
    setDeleting(true);
    try {
      for (const att of expense.attachments ?? []) {
        await deleteFile(att.storagePath);
      }
      await deleteExpense(expense.id);
      showToast('ההוצאה נמחקה', 'success');
      router.push('/expenses');
    } catch {
      showToast('שגיאה במחיקה', 'error');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleAddAttachment = async (att: Parameters<typeof addAttachment>[1]) => {
    await addAttachment(id, att);
    await loadExpense(); // Refresh detail view
  };

  const handleRemoveAttachment = async (attId: string) => {
    await removeAttachment(id, attId);
    await loadExpense(); // Refresh detail view
  };

  if (loading) return <SectionLoader />;

  if (!expense) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">הוצאה לא נמצאה</p>
        <Link href="/expenses" className="text-primary-600 underline text-sm mt-2 inline-block">
          חזרה להוצאות
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה
        </button>
        {isEditor && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => router.push(`/expenses/${id}/edit`)}
            >
              עריכה
            </Button>
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setShowDelete(true)}
              >
                מחיקה
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        {/* Title + amount */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{expense.title}</h1>
            {expense.description && (
              <p className="text-sm text-slate-500">{expense.description}</p>
            )}
          </div>
          <div className="text-end shrink-0">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(expense.amount)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {category && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          <ReimbursementBadge status={expense.reimbursementStatus} />
          <Badge variant="default">{expense.paymentMethod}</Badge>
        </div>

        {/* Details grid */}
        <div className="divide-y divide-slate-100">
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="תאריך"
            value={formatDate(expense.date)}
          />
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="שולם על ידי"
            value={expense.paidBy}
          />
          <InfoRow
            icon={<Store className="h-4 w-4" />}
            label="ספק / חברה"
            value={expense.vendor || '—'}
          />
          <InfoRow
            icon={<CreditCard className="h-4 w-4" />}
            label="אמצעי תשלום"
            value={expense.paymentMethod}
          />
          {expense.invoiceNumber && (
            <InfoRow
              icon={<FileText className="h-4 w-4" />}
              label="מספר חשבונית"
              value={expense.invoiceNumber}
            />
          )}
          {expense.reimbursementDate && (
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="תאריך החזר"
              value={formatDate(expense.reimbursementDate)}
            />
          )}
          {expense.externalLink && (
            <InfoRow
              icon={<ExternalLink className="h-4 w-4" />}
              label="קישור חיצוני"
              value={
                <a
                  href={expense.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {expense.externalLink}
                </a>
              }
            />
          )}
          {expense.notes && (
            <InfoRow
              icon={<MessageSquare className="h-4 w-4" />}
              label="הערות"
              value={<span className="whitespace-pre-line">{expense.notes}</span>}
            />
          )}
        </div>
      </div>

      {/* Files */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4">קבצים מצורפים</h2>
        <FileUpload
          expenseId={expense.id}
          attachments={expense.attachments ?? []}
          onAdd={handleAddAttachment}
          onRemove={handleRemoveAttachment}
          canUpload={isEditor}
          canDelete={isEditor}
        />
      </div>

      {/* Metadata */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>
            נוצר: {formatDateTime(expense.createdAt)} ע״י {expense.createdByName}
          </span>
        </div>
        {expense.updatedAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              עודכן: {formatDateTime(expense.updatedAt)} ע״י {expense.updatedByName}
            </span>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="מחיקת הוצאה"
        message={`האם למחוק את "${expense.title}"? פעולה זו אינה הפיכה.`}
        confirmText="מחק"
        loading={deleting}
      />
    </div>
  );
}
