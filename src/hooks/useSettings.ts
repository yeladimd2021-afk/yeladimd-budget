'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppSettings } from '@/types';

interface SettingsRow {
  id: string;
  department_name: string;
  system_name: string;
  external_link: string;
  active_year_id: string | null;
  updated_at: string;
  updated_by: string | null;
}

function mapSettings(row: SettingsRow): AppSettings {
  return {
    id: row.id,
    departmentName: row.department_name ?? 'מחלקה ד׳',
    systemName: row.system_name ?? 'מערכת ניהול תקציב',
    externalLink: row.external_link ?? '',
    activeYearId: row.active_year_id ?? '',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? '',
  };
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (data) setSettings(mapSettings(data as SettingsRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(
    async (
      updates: Partial<Omit<AppSettings, 'id' | 'updatedAt' | 'updatedBy'>>
    ): Promise<void> => {
      if (!user) throw new Error('לא מחובר');
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };
      if (updates.departmentName !== undefined) dbUpdates.department_name = updates.departmentName;
      if (updates.systemName !== undefined) dbUpdates.system_name = updates.systemName;
      if (updates.externalLink !== undefined) dbUpdates.external_link = updates.externalLink;
      if (updates.activeYearId !== undefined) dbUpdates.active_year_id = updates.activeYearId || null;

      const { error: err } = await supabase
        .from('settings')
        .upsert({ id: 'main', ...dbUpdates });
      if (err) throw new Error(err.message);
      await fetchSettings();
    },
    [user, fetchSettings]
  );

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
