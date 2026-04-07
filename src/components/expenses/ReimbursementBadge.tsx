import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ReimbursementStatus } from '@/types';

export function ReimbursementBadge({ status }: { status: ReimbursementStatus }) {
  const map: Record<ReimbursementStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
    'לא הוחזר':            { variant: 'warning', label: 'לא הוחזר' },
    'ממתין':               { variant: 'warning', label: 'ממתין' },
    'לא רלוונטי':          { variant: 'default', label: 'לא רלוונטי' },
    'הוחזר בפייבוקס':      { variant: 'success', label: 'הוחזר בפייבוקס' },
    'הוחזר בהעברה בנקאית': { variant: 'success', label: 'הוחזר בהעברה בנקאית' },
  };
  const { variant, label } = map[status] || { variant: 'default', label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}
