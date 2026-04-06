'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  SortConfig,
  AttachmentFile,
} from '@/types';
import { searchMatch } from '@/lib/utils';

// ─── Row shape from public.expenses ───────────────────────────────────────────
interface ExpenseRow {
  id: string;
  year_id: string;
  category_id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  payment_method: string;
  vendor: string;
  invoice_number: string;
  reimbursement_status: string;
  reimbursement_date: string | null;
  external_link: string;
  notes: string;
  attachments: AttachmentFile[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  updated_by_name: string;
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    yearId: row.year_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description ?? '',
    amount: Number(row.amount),
    date: row.date,
    paidBy: row.paid_by,
    paymentMethod: row.payment_method as Expense['paymentMethod'],
    vendor: row.vendor ?? '',
    invoiceNumber: row.invoice_number ?? '',
    reimbursementStatus: row.reimbursement_status as Expense['reimbursementStatus'],
    reimbursementDate: row.reimbursement_date ?? undefined,
    externalLink: row.external_link ?? '',
    notes: row.notes ?? '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    createdBy: row.created_by ?? '',
    createdByName: row.created_by_name ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? '',
    updatedByName: row.updated_by_name ?? '',
  };
}

// ─── useExpenses hook ─────────────────────────────────────────────────────────

export function useExpenses(yearId?: string) {
  const { user, profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchCount = useRef(0);

  const fetchExpenses = useCallback(async () => {
    if (!user || !yearId) {
      setLoading(false);
      return;
    }
    const token = ++fetchCount.current;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('expenses')
      .select('*')
      .eq('year_id', yearId)
      .order('date', { ascending: false });

    if (token !== fetchCount.current) return; // stale request
    if (err) {
      setError(new Error(err.message));
    } else {
      setExpenses((data as ExpenseRow[]).map(mapExpense));
      setError(null);
    }
    setLoading(false);
  }, [user, yearId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createExpense = useCallback(
    async (formData: ExpenseFormData): Promise<string> => {
      if (!user || !profile) throw new Error('לא מחובר');
      const now = new Date().toISOString();
      const { data, error: err } = await supabase
        .from('expenses')
        .insert({
          year_id: formData.yearId,
          category_id: formData.categoryId,
          title: formData.title,
          description: formData.description ?? '',
          amount: formData.amount,
          date: formData.date,
          paid_by: formData.paidBy,
          payment_method: formData.paymentMethod,
          vendor: formData.vendor ?? '',
          invoice_number: formData.invoiceNumber ?? '',
          reimbursement_status: formData.reimbursementStatus,
          reimbursement_date: formData.reimbursementDate || null,
          external_link: formData.externalLink ?? '',
          notes: formData.notes ?? '',
          attachments: formData.attachments ?? [],
          created_by: user.id,
          created_by_name: profile.displayName,
          created_at: now,
          updated_at: now,
          updated_by: user.id,
          updated_by_name: profile.displayName,
        })
        .select('id')
        .single();

      if (err) throw new Error(err.message);
      await fetchExpenses();
      return (data as { id: string }).id;
    },
    [user, profile, fetchExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, formData: Partial<ExpenseFormData>): Promise<void> => {
      if (!user || !profile) throw new Error('לא מחובר');
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
        updated_by_name: profile.displayName,
      };
      if (formData.yearId !== undefined) updates.year_id = formData.yearId;
      if (formData.categoryId !== undefined) updates.category_id = formData.categoryId;
      if (formData.title !== undefined) updates.title = formData.title;
      if (formData.description !== undefined) updates.description = formData.description;
      if (formData.amount !== undefined) updates.amount = formData.amount;
      if (formData.date !== undefined) updates.date = formData.date;
      if (formData.paidBy !== undefined) updates.paid_by = formData.paidBy;
      if (formData.paymentMethod !== undefined) updates.payment_method = formData.paymentMethod;
      if (formData.vendor !== undefined) updates.vendor = formData.vendor;
      if (formData.invoiceNumber !== undefined) updates.invoice_number = formData.invoiceNumber;
      if (formData.reimbursementStatus !== undefined) updates.reimbursement_status = formData.reimbursementStatus;
      if (formData.reimbursementDate !== undefined) updates.reimbursement_date = formData.reimbursementDate || null;
      if (formData.externalLink !== undefined) updates.external_link = formData.externalLink;
      if (formData.notes !== undefined) updates.notes = formData.notes;
      if (formData.attachments !== undefined) updates.attachments = formData.attachments;

      const { error: err } = await supabase.from('expenses').update(updates).eq('id', id);
      if (err) throw new Error(err.message);
      await fetchExpenses();
    },
    [user, profile, fetchExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<void> => {
      const { error: err } = await supabase.from('expenses').delete().eq('id', id);
      if (err) throw new Error(err.message);
      setExpenses(prev => prev.filter(e => e.id !== id));
    },
    []
  );

  const addAttachment = useCallback(
    async (expenseId: string, attachment: AttachmentFile): Promise<void> => {
      if (!user || !profile) throw new Error('לא מחובר');

      // Fetch current attachments first
      const { data: current, error: fetchErr } = await supabase
        .from('expenses')
        .select('attachments')
        .eq('id', expenseId)
        .single();

      if (fetchErr) throw new Error(fetchErr.message);

      const existing: AttachmentFile[] = Array.isArray((current as { attachments: AttachmentFile[] }).attachments)
        ? (current as { attachments: AttachmentFile[] }).attachments
        : [];

      const { error: err } = await supabase
        .from('expenses')
        .update({
          attachments: [...existing, attachment],
          updated_at: new Date().toISOString(),
          updated_by: user.id,
          updated_by_name: profile.displayName,
        })
        .eq('id', expenseId);

      if (err) throw new Error(err.message);
      await fetchExpenses();
    },
    [user, profile, fetchExpenses]
  );

  const removeAttachment = useCallback(
    async (expenseId: string, attachmentId: string): Promise<void> => {
      if (!user || !profile) throw new Error('לא מחובר');

      const { data: current, error: fetchErr } = await supabase
        .from('expenses')
        .select('attachments')
        .eq('id', expenseId)
        .single();

      if (fetchErr) throw new Error(fetchErr.message);

      const existing: AttachmentFile[] = Array.isArray((current as { attachments: AttachmentFile[] }).attachments)
        ? (current as { attachments: AttachmentFile[] }).attachments
        : [];

      const { error: err } = await supabase
        .from('expenses')
        .update({
          attachments: existing.filter(a => a.id !== attachmentId),
          updated_at: new Date().toISOString(),
          updated_by: user.id,
          updated_by_name: profile.displayName,
        })
        .eq('id', expenseId);

      if (err) throw new Error(err.message);
      await fetchExpenses();
    },
    [user, profile, fetchExpenses]
  );

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    addAttachment,
    removeAttachment,
  };
}

// ─── Client-side filter + sort ────────────────────────────────────────────────

export function useFilteredExpenses(
  expenses: Expense[],
  filters: ExpenseFilters,
  sort: SortConfig
): Expense[] {
  const filtered = expenses.filter(expense => {
    if (filters.categoryId && expense.categoryId !== filters.categoryId) return false;
    if (filters.paidBy && expense.paidBy !== filters.paidBy) return false;
    if (
      filters.reimbursementStatus &&
      expense.reimbursementStatus !== filters.reimbursementStatus
    )
      return false;
    if (filters.dateFrom && expense.date < filters.dateFrom) return false;
    if (filters.dateTo && expense.date > filters.dateTo) return false;
    if (filters.search) {
      const q = filters.search;
      const matches =
        searchMatch(expense.title, q) ||
        searchMatch(expense.description ?? '', q) ||
        searchMatch(expense.vendor ?? '', q) ||
        searchMatch(expense.paidBy, q) ||
        searchMatch(expense.notes ?? '', q);
      if (!matches) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sort.field) {
      case 'date':
        aVal = a.date;
        bVal = b.date;
        break;
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'categoryName':
        aVal = a.categoryName ?? '';
        bVal = b.categoryName ?? '';
        break;
      case 'title':
        aVal = a.title;
        bVal = b.title;
        break;
      case 'paidBy':
        aVal = a.paidBy;
        bVal = b.paidBy;
        break;
    }

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal as string, 'he');
      return sort.direction === 'asc' ? cmp : -cmp;
    }
    return sort.direction === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return filtered;
}

// ─── Fetch a single expense (for detail pages) ────────────────────────────────

export async function fetchExpenseById(id: string): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapExpense(data as ExpenseRow);
}

// ─── Fetch all expenses for a year (used in reports) ─────────────────────────

export async function getAllExpensesForYear(yearId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('year_id', yearId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  return (data as ExpenseRow[]).map(mapExpense);
}
