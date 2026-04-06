import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ReimbursementStatus } from '@/types';

export function ReimbursementBadge({ status }: { status: ReimbursementStatus }) {
  const map: Record<ReimbursementStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
    הוחזר: { variant: 'success', label: 'הוחזר' },
    ממתין: { variant: 'warning', label: 'ממתין להחזר' },
    'לא רלוונטי': { variant: 'default', label: 'לא רלוונטי' },
  };
  const { variant, label } = map[status] || { variant: 'default', label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}
