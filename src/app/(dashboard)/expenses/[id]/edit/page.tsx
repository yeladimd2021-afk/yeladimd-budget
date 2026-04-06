'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useYears } from '@/hooks/useYears';
import { useExpenses, fetchExpenseById } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SectionLoader } from '@/components/ui/Spinner';
import { Expense, ExpenseFormData } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();
  const { years } = useYears();
  const { categories } = useCategories();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  const loadExpense = useCallback(async () => {
    const data = await fetchExpenseById(id);
    setExpense(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadExpense(); }, [loadExpense]);

  const { updateExpense } = useExpenses(expense?.yearId);

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      await updateExpense(id, data);
      showToast('ההוצאה עודכנה בהצלחה', 'success');
      router.push(`/expenses/${id}`);
    } catch {
      showToast('שגיאה בעדכון ההוצאה', 'error');
    }
  };

  if (loading) return <SectionLoader />;
  if (!expense) return <div className="p-6 text-center text-slate-500">הוצאה לא נמצאה</div>;

  // Supabase returns dates as "YYYY-MM-DD" strings — already the correct format for <input type="date">
  const defaults: Partial<ExpenseFormData> = {
    yearId: expense.yearId,
    categoryId: expense.categoryId,
    title: expense.title,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,                          // already "YYYY-MM-DD"
    paidBy: expense.paidBy,
    paymentMethod: expense.paymentMethod,
    vendor: expense.vendor,
    invoiceNumber: expense.invoiceNumber,
    reimbursementStatus: expense.reimbursementStatus,
    reimbursementDate: expense.reimbursementDate ?? '',
    externalLink: expense.externalLink,
    notes: expense.notes,
  };

  return (
    <ProtectedRoute requiredRole="editor">
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">עריכת הוצאה</h1>
            <p className="text-sm text-slate-500 truncate max-w-xs">{expense.title}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <ExpenseForm
            defaultValues={defaults}
            initialAttachments={expense.attachments ?? []}
            years={years}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isEdit
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
