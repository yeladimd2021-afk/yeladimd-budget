'use client';

import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { SectionLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Category } from '@/types';
import { CHART_COLORS } from '@/lib/constants';
import { Plus, Pencil, Trash2, ExternalLink, Save } from 'lucide-react';

function SystemSettingsForm() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const [form, setForm] = React.useState({
    systemName: settings?.systemName || 'מחלקה ד׳',
    departmentName: settings?.departmentName || 'פסיכיאטריית ילדים אשפוז',
    externalLink: settings?.externalLink || '',
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setForm({
        systemName: settings.systemName || '',
        departmentName: settings.departmentName || '',
        externalLink: settings.externalLink || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(form);
      showToast('ההגדרות נשמרו', 'success');
    } catch {
      showToast('שגיאה בשמירת ההגדרות', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>הגדרות מערכת</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <Input
          label="שם המערכת"
          value={form.systemName}
          onChange={e => setForm(f => ({ ...f, systemName: e.target.value }))}
          placeholder="מחלקה ד׳"
        />
        <Input
          label="שם המחלקה"
          value={form.departmentName}
          onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))}
          placeholder="פסיכיאטריית ילדים אשפוז"
        />
        <div>
          <Input
            label="קישור חיצוני גלובלי"
            type="url"
            value={form.externalLink}
            onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))}
            placeholder="https://..."
          />
          {form.externalLink && (
            <a
              href={form.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              פתח קישור
            </a>
          )}
        </div>
        <div className="flex justify-end">
          <Button icon={<Save className="h-4 w-4" />} onClick={handleSave} loading={loading}>
            שמור הגדרות
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CategoryColorDot({ color }: { color: string }) {
  return <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: color }} />;
}

function CategoryManager() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', color: CHART_COLORS[0] });
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createCategory(form.name.trim(), form.color);
      showToast('קטגוריה נוספה', 'success');
      setForm({ name: '', color: CHART_COLORS[0] });
      setShowAdd(false);
    } catch {
      showToast('שגיאה', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editCat) return;
    setSubmitting(true);
    try {
      await updateCategory(editCat.id, { name: form.name, color: form.color });
      showToast('קטגוריה עודכנה', 'success');
      setEditCat(null);
    } catch {
      showToast('שגיאה', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCat) return;
    setSubmitting(true);
    try {
      await deleteCategory(deleteCat.id);
      showToast('קטגוריה נמחקה', 'success');
      setDeleteCat(null);
    } catch {
      showToast('שגיאה', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, color: cat.color });
  };

  return (
    <Card>
      <CardHeader
        actions={
          <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => {
            setForm({ name: '', color: CHART_COLORS[0] });
            setShowAdd(true);
          }}>
            הוסף
          </Button>
        }
      >
        <CardTitle>קטגוריות</CardTitle>
      </CardHeader>

      <div className="space-y-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50"
          >
            <CategoryColorDot color={cat.color} />
            <span className="flex-1 text-sm font-medium text-slate-700">{cat.name}</span>
            {!cat.isActive && <Badge variant="default" size="sm">מושבת</Badge>}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(cat)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteCat(cat)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="הוסף קטגוריה">
        <div className="space-y-4">
          <Input label="שם קטגוריה" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">צבע</label>
            <div className="flex flex-wrap gap-2">
              {CHART_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>ביטול</Button>
            <Button onClick={handleAdd} loading={submitting}>הוסף</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editCat} onClose={() => setEditCat(null)} title="עריכת קטגוריה">
        <div className="space-y-4">
          <Input label="שם קטגוריה" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">צבע</label>
            <div className="flex flex-wrap gap-2">
              {CHART_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditCat(null)}>ביטול</Button>
            <Button onClick={handleEdit} loading={submitting}>שמור</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        onConfirm={handleDelete}
        title="מחיקת קטגוריה"
        message={`האם למחוק את "${deleteCat?.name}"? הוצאות קיימות לא יימחקו.`}
        confirmText="מחק"
        loading={submitting}
      />
    </Card>
  );
}

export default function SettingsPage() {
  const { loading } = useSettings();

  if (loading) return <SectionLoader />;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">הגדרות</h1>
          <p className="text-sm text-slate-500">הגדרות מערכת וניהול קטגוריות</p>
        </div>

        <SystemSettingsForm />
        <CategoryManager />
      </div>
    </ProtectedRoute>
  );
}
