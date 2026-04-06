'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetYear } from '@/types';

interface YearRow {
  id: string;
  year: number;
  total_budget: number;
  notes: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function mapYear(row: YearRow): BudgetYear {
  return {
    id: row.id,
    year: row.year,
    totalBudget: Number(row.total_budget),
    notes: row.notes ?? '',
    isActive: row.is_active,
    createdBy: row.created_by ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useYears() {
  const { user } = useAuth();
  const [years, setYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchYears = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('years')
      .select('*')
      .order('year', { ascending: false });

    if (err) {
      setError(new Error(err.message));
    } else {
      setYears((data as YearRow[]).map(mapYear));
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchYears(); }, [fetchYears]);

  const createYear = useCallback(
    async (year: number, totalBudget: number, notes?: string): Promise<string> => {
      if (!user) throw new Error('לא מחובר');
      const now = new Date().toISOString();
      const { data, error: err } = await supabase
        .from('years')
        .insert({
          year,
          total_budget: totalBudget,
          notes: notes ?? '',
          is_active: true,
          created_by: user.id,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      if (err) throw new Error(err.message);
      await fetchYears();
      return (data as { id: string }).id;
    },
    [user, fetchYears]
  );

  const updateYear = useCallback(
    async (
      id: string,
      updates: Partial<Pick<BudgetYear, 'totalBudget' | 'notes' | 'isActive'>>
    ): Promise<void> => {
      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.totalBudget !== undefined) dbUpdates.total_budget = updates.totalBudget;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error: err } = await supabase.from('years').update(dbUpdates).eq('id', id);
      if (err) throw new Error(err.message);
      await fetchYears();
    },
    [fetchYears]
  );

  const getYearById = useCallback(
    (id: string): BudgetYear | undefined => years.find(y => y.id === id),
    [years]
  );

  const getYearByNumber = useCallback(
    (year: number): BudgetYear | undefined => years.find(y => y.year === year),
    [years]
  );

  const currentYear = years.find(y => y.year === new Date().getFullYear());

  return {
    years,
    loading,
    error,
    refetch: fetchYears,
    createYear,
    updateYear,
    getYearById,
    getYearByNumber,
    currentYear,
  };
}
