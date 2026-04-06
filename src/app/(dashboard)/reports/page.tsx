'use client';

import React, { useState, useMemo } from 'react';
import { useYears } from '@/hooks/useYears';
import { useCategories } from '@/hooks/useCategories';
import { getAllExpensesForYear } from '@/hooks/useExpenses';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SectionLoader } from '@/components/ui/Spinner';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { Expense, Category, BudgetYear } from '@/types';
import { HEBREW_MONTHS } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

type ReportView = 'category' | 'payer' | 'month' | 'reimbursement';

export default function ReportsPage() {
  const { years } = useYears();
  const { categories } = useCategories();
  const [selectedYearId, setSelectedYearId] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reportView, setReportView] = useState<ReportView>('category');

  React.useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      const cur = years.find(y => y.year === new Date().getFullYear());
      setSelectedYearId(cur?.id || years[0].id);
    }
  }, [years, selectedYearId]);

  const selectedYear = years.find(y => y.id === selectedYearId);

  const loadData = async () => {
    if (!selectedYearId) return;
    setLoading(true);
    try {
      const data = await getAllExpensesForYear(selectedYearId);
      setExpenses(data);
      setLoaded(true);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedYearId) {
      setLoaded(false);
      loadData();
    }
  }, [selectedYearId]);

  // ─── Report data ─────────────────────────────────────────────────────────────

  const byCategory = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const d = map.get(e.categoryId) || { total: 0, count: 0 };
      map.set(e.categoryId, { total: d.total + e.amount, count: d.count + 1 });
    });
    return Array.from(map.entries())
      .map(([id, d]) => ({
        name: categories.find(c => c.id === id)?.name || id,
        color: categories.find(c => c.id === id)?.color || '#64748b',
        total: d.total,
        count: d.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const byPayer = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const d = map.get(e.paidBy) || { total: 0, count: 0 };
      map.set(e.paidBy, { total: d.total + e.amount, count: d.count + 1 });
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, total: d.total, count: d.count, color: '#3b82f6' }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const byMonth = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const date = new Date(e.date); // date is always an ISO string from Supabase
      const monthIdx = date.getMonth();
      const key = HEBREW_MONTHS[monthIdx];
      const d = map.get(key) || { total: 0, count: 0 };
      map.set(key, { total: d.total + e.amount, count: d.count + 1 });
    });
    return HEBREW_MONTHS.filter(m => map.has(m)).map(m => ({
      name: m,
      total: map.get(m)!.total,
      count: map.get(m)!.count,
      color: '#3b82f6',
    }));
  }, [expenses]);

  const byReimbursement = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const d = map.get(e.reimbursementStatus) || { total: 0, count: 0 };
      map.set(e.reimbursementStatus, { total: d.total + e.amount, count: d.count + 1 });
    });
    const colors: Record<string, string> = {
      'הוחזר': '#10b981',
      'ממתין': '#f59e0b',
      'לא רלוונטי': '#94a3b8',
    };
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, total: d.total, count: d.count, color: colors[name] || '#64748b' }));
  }, [expenses]);

  const activeData = {
    category: byCategory,
    payer: byPayer,
    month: byMonth,
    reimbursement: byReimbursement,
  }[reportView];

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // ─── Export ──────────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = expenses.map(e => ({
      תאריך: formatDate(e.date),
      תיאור: e.title,
      'סכום (₪)': e.amount,
      קטגוריה: categories.find(c => c.id === e.categoryId)?.name || '',
      'שולם ע"י': e.paidBy,
      'אמצעי תשלום': e.paymentMethod,
      ספק: e.vendor || '',
      'סטטוס החזר': e.reimbursementStatus,
      'מספר חשבונית': e.invoiceNumber || '',
      הערות: e.notes || '',
    }));
    exportToCSV(rows, `הוצאות_${selectedYear?.year || ''}.csv`);
  };

  const exportExcel = () => {
    const rows = expenses.map(e => ({
      תאריך: formatDate(e.date),
      תיאור: e.title,
      'סכום (₪)': e.amount,
      קטגוריה: categories.find(c => c.id === e.categoryId)?.name || '',
      'שולם ע"י': e.paidBy,
      'אמצעי תשלום': e.paymentMethod,
      ספק: e.vendor || '',
      'סטטוס החזר': e.reimbursementStatus,
      'מספר חשבונית': e.invoiceNumber || '',
      הערות: e.notes || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!dir'] = 'rtl';
    XLSX.utils.book_append_sheet(wb, ws, 'הוצאות');

    // Summary sheet
    const summary = byCategory.map(d => ({
      קטגוריה: d.name,
      'סה"כ': d.total,
      'מספר הוצאות': d.count,
    }));
    const ws2 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws2, 'לפי קטגוריה');

    XLSX.writeFile(wb, `הוצאות_${selectedYear?.year || ''}.xlsx`);
  };

  const views: { id: ReportView; label: string }[] = [
    { id: 'category', label: 'לפי קטגוריה' },
    { id: 'payer', label: 'לפי משלם' },
    { id: 'month', label: 'לפי חודש' },
    { id: 'reimbursement', label: 'לפי החזר' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">דוחות</h1>
          <p className="text-sm text-slate-500">ניתוח והפקת דוחות</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={years.map(y => ({ value: y.id, label: String(y.year) }))}
            value={selectedYearId}
            onChange={e => setSelectedYearId(e.target.value)}
            className="w-28"
          />
          {loaded && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={exportCSV}
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={exportExcel}
              >
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {loaded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">סה״כ הוצאות</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">מספר פריטים</p>
            <p className="text-xl font-bold text-slate-900">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">ממתין להחזר</p>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(expenses.filter(e => e.reimbursementStatus === 'ממתין').reduce((s, e) => s + e.amount, 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">% מהתקציב</p>
            <p className="text-xl font-bold text-slate-900">
              {selectedYear?.totalBudget
                ? `${((totalExpenses / selectedYear.totalBudget) * 100).toFixed(1)}%`
                : '—'}
            </p>
          </div>
        </div>
      )}

      {/* View tabs */}
      {loaded && (
        <>
          <div className="flex flex-wrap gap-2">
            {views.map(v => (
              <button
                key={v.id}
                onClick={() => setReportView(v.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  reportView === v.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{views.find(v => v.id === reportView)?.label}</CardTitle>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'סכום']}
                    labelStyle={{ fontFamily: 'var(--font-heebo)' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {activeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 text-end font-semibold text-slate-600">
                      {reportView === 'category' ? 'קטגוריה' : reportView === 'payer' ? 'משלם' : reportView === 'month' ? 'חודש' : 'סטטוס'}
                    </th>
                    <th className="pb-2 text-end font-semibold text-slate-600">סכום</th>
                    <th className="pb-2 text-end font-semibold text-slate-600">מספר הוצאות</th>
                    <th className="pb-2 text-end font-semibold text-slate-600">% מהסה״כ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-800">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                          {row.name}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-slate-900">{formatCurrency(row.total)}</td>
                      <td className="py-2.5 text-slate-600">{row.count}</td>
                      <td className="py-2.5 text-slate-500">
                        {totalExpenses > 0 ? `${((row.total / totalExpenses) * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {loading && <SectionLoader text="טוען נתונים..." />}

      {!loading && !loaded && (
        <div className="text-center py-16 text-slate-400">
          <p>בחר שנה לצפייה בדוח</p>
        </div>
      )}
    </div>
  );
}
