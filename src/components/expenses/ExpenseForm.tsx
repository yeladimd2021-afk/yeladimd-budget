'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormFileUpload } from '@/components/expenses/FormFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseFormData, BudgetYear, Category, AttachmentFile } from '@/types';
import { PAYMENT_METHODS, REIMBURSEMENT_STATUSES } from '@/lib/constants';

const schema = z.object({
  yearId: z.string().min(1, 'חובה לבחור שנה'),
  categoryId: z.string().min(1, 'חובה לבחור קטגוריה'),
  title: z.string().min(2, 'חובה להזין תיאור (לפחות 2 תווים)'),
  description: z.string().optional().default(''),
  amount: z.number({ invalid_type_error: 'יש להזין סכום' }).positive('הסכום חייב להיות חיובי'),
  date: z.string().min(1, 'חובה לבחור תאריך'),
  paidBy: z.string().min(2, 'חובה להזין שם משלם'),
  paymentMethod: z.enum([
    'העברה בנקאית',
    'מזומן',
    'כרטיס אשראי',
    "צ'ק",
    'אחר',
    'הוחזר לתקציב המחלקתי',
    'הוחזר למשלם',
    'הוחזר בפייבוקס',
  ]),
  vendor: z.string().optional().default(''),
  invoiceNumber: z.string().optional().default(''),
  reimbursementStatus: z.enum(['ממתין', 'הוחזר', 'לא רלוונטי']),
  reimbursementDate: z.string().optional().default(''),
  returnDateToPayer: z.string().optional().default(''),
  returnDateToBudget: z.string().optional().default(''),
  externalLink: z.string().url('קישור לא תקין').optional().or(z.literal('')).default(''),
  notes: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormData>;
  /** Pre-existing attachments (edit mode) */
  initialAttachments?: AttachmentFile[];
  years: BudgetYear[];
  categories: Category[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  selectedYearId?: string;
}

export function ExpenseForm({
  defaultValues,
  initialAttachments,
  years,
  categories,
  onSubmit,
  onCancel,
  isEdit = false,
  selectedYearId,
}: ExpenseFormProps) {
  const { user, profile } = useAuth();

  // Attachments are managed outside the zod schema (binary data)
  const [attachments, setAttachments] = useState<AttachmentFile[]>(
    initialAttachments ?? []
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      yearId: selectedYearId || defaultValues?.yearId || '',
      categoryId: defaultValues?.categoryId || '',
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      amount: defaultValues?.amount ?? ('' as unknown as number),
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      paidBy: defaultValues?.paidBy || '',
      paymentMethod: defaultValues?.paymentMethod || 'העברה בנקאית',
      vendor: defaultValues?.vendor || '',
      invoiceNumber: defaultValues?.invoiceNumber || '',
      reimbursementStatus: defaultValues?.reimbursementStatus || 'לא רלוונטי',
      reimbursementDate: defaultValues?.reimbursementDate || '',
      returnDateToPayer: defaultValues?.returnDateToPayer || '',
      returnDateToBudget: defaultValues?.returnDateToBudget || '',
      externalLink: defaultValues?.externalLink || '',
      notes: defaultValues?.notes || '',
    },
  });

  const reimbStatus    = watch('reimbursementStatus');
  const paymentMethod  = watch('paymentMethod');
  const activeCategories = categories.filter(c => c.isActive);

  // Merge validated form values with attachment state, then call parent onSubmit
  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({ ...(values as ExpenseFormData), attachments });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>

      {/* ── Row 1: Year + Category ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="שנת תקציב"
          required
          options={years.map(y => ({ value: y.id, label: String(y.year) }))}
          placeholder="בחר שנה"
          error={errors.yearId?.message}
          {...register('yearId')}
        />
        <Select
          label="קטגוריה"
          required
          options={activeCategories.map(c => ({ value: c.id, label: c.name }))}
          placeholder="בחר קטגוריה"
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
      </div>

      {/* ── Row 2: Title ── */}
      <Input
        label="תיאור ההוצאה"
        required
        placeholder="לדוגמה: רכישת ציוד משרדי"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* ── Row 3: Description ── */}
      <Textarea
        label="תיאור מפורט"
        placeholder="פרטים נוספים על ההוצאה..."
        rows={2}
        {...register('description')}
      />

      {/* ── Row 4: Amount + Date ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="סכום (₪)"
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Input
          label="תאריך"
          required
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* ── Row 5: Paid by + Payment method ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="שולם על ידי"
          required
          placeholder="שם העובד ששילם"
          error={errors.paidBy?.message}
          {...register('paidBy')}
        />
        <Select
          label="אמצעי תשלום"
          options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        />
      </div>

      {/* ── Row 6: Vendor + Invoice ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ספק / חברה"
          placeholder="שם הספק"
          {...register('vendor')}
        />
        <Input
          label="מספר חשבונית"
          placeholder="123456"
          {...register('invoiceNumber')}
        />
      </div>

      {/* ── Row 7: Reimbursement ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="סטטוס החזר"
          options={REIMBURSEMENT_STATUSES.map(s => ({ value: s, label: s }))}
          error={errors.reimbursementStatus?.message}
          {...register('reimbursementStatus')}
        />
        {reimbStatus === 'הוחזר' && (
          <Input
            label="תאריך החזר"
            type="date"
            {...register('reimbursementDate')}
          />
        )}
      </div>

      {/* ── Row 7b: Bank-transfer return dates (conditional) ── */}
      {paymentMethod === 'העברה בנקאית' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="תאריך החזרה למשלם"
            type="date"
            {...register('returnDateToPayer')}
          />
          <Input
            label="תאריך החזרה לתקציב המחלקתי"
            type="date"
            {...register('returnDateToBudget')}
          />
        </div>
      )}

      {/* ── Row 8: External link ── */}
      <Input
        label="קישור חיצוני"
        type="url"
        placeholder="https://..."
        error={errors.externalLink?.message}
        {...register('externalLink')}
      />

      {/* ── Row 9: Notes ── */}
      <Textarea
        label="הערות"
        placeholder="הערות נוספות..."
        rows={2}
        {...register('notes')}
      />

      {/* ── Row 10: File upload ── */}
      <div className="pt-1">
        <div className="border-t border-slate-200 pt-5">
          <FormFileUpload
            value={attachments}
            onChange={setAttachments}
            uploadedBy={user?.id ?? ''}
            uploadedByName={profile?.displayName ?? ''}
            folder="expenses"
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'שמור שינויים' : 'הוסף הוצאה'}
        </Button>
      </div>
    </form>
  );
}
