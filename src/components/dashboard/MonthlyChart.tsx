'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface MonthlyChartProps {
  data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-primary-600">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>הוצאות לפי חודש</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          אין נתונים להצגה
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>הוצאות לפי חודש</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
