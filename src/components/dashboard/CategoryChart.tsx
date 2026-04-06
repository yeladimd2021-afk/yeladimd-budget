'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CategorySummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface CategoryChartProps {
  data: CategorySummary[];
}

const RADIAN = Math.PI / 180;

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: CategorySummary }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-sm">
      <p className="font-semibold text-slate-800">{d.categoryName}</p>
      <p className="text-slate-600">{formatCurrency(d.total)}</p>
      <p className="text-slate-400">{d.count} הוצאות</p>
    </div>
  );
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>התפלגות לפי קטגוריה</CardTitle>
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
        <CardTitle>התפלגות לפי קטגוריה</CardTitle>
      </CardHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel as unknown as boolean}
              outerRadius={100}
              dataKey="total"
              nameKey="categoryName"
            >
              {data.map((entry, index) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-2 space-y-2">
        {data.slice(0, 5).map(item => (
          <div key={item.categoryId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700">{item.categoryName}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>{formatCurrency(item.total)}</span>
              <span className="text-xs text-slate-400 w-8 text-end">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
