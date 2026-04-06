'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useYears } from '@/hooks/useYears';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ExpenseFormData } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function NewExpensePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { years } = useYears();
  const { categories } = useCategories();
  const currentYearId = years.find(y => y.year === new Date().getFullYear())?.id || years[0]?.id;
  const { createExpense } = useExpenses(currentYearId);

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      const id = await createExpense(data);
      showToast('ההוצאה נוספה בהצלחה', 'success');
      router.push(`/expenses/${id}`);
    } catch {
      showToast('שגיאה בהוספת ההוצאה', 'error');
    }
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
            <h1 className="text-2xl font-bold text-slate-900">הוצאה חדשה</h1>
            <p className="text-sm text-slate-500">הוסף הוצאה לתקציב המחלקה</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <ExpenseForm
            years={years}
            categories={categories}
            selectedYearId={currentYearId}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
