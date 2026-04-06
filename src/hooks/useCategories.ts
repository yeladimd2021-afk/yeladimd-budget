'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types';

interface CategoryRow {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isActive: row.is_active,
    order: row.order,
    createdAt: row.created_at,
  };
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (err) {
      setError(new Error(err.message));
    } else {
      setCategories((data as CategoryRow[]).map(mapCategory));
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = useCallback(
    async (name: string, color: string): Promise<string> => {
      if (!user) throw new Error('לא מחובר');
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), 0);
      const { data, error: err } = await supabase
        .from('categories')
        .insert({ name, color, is_active: true, order: maxOrder + 1 })
        .select('id')
        .single();
      if (err) throw new Error(err.message);
      await fetchCategories();
      return (data as { id: string }).id;
    },
    [user, categories, fetchCategories]
  );

  const updateCategory = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Category, 'name' | 'color' | 'isActive' | 'order'>>
    ): Promise<void> => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { error: err } = await supabase
        .from('categories')
        .update(dbUpdates)
        .eq('id', id);
      if (err) throw new Error(err.message);
      await fetchCategories();
    },
    [fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      const { error: err } = await supabase.from('categories').delete().eq('id', id);
      if (err) throw new Error(err.message);
      setCategories(prev => prev.filter(c => c.id !== id));
    },
    []
  );

  const getCategoryById = useCallback(
    (id: string): Category | undefined => categories.find(c => c.id === id),
    [categories]
  );

  const activeCategories = categories.filter(c => c.isActive);

  return {
    categories,
    activeCategories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
