'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { SectionLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatDateTime } from '@/lib/utils';
import { UserProfile, UserRole } from '@/types';
import { ROLES } from '@/lib/constants';
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react';

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, 'danger' | 'info' | 'default'> = {
    admin: 'danger',
    editor: 'info',
    viewer: 'default',
  };
  return <Badge variant={variants[role]}>{ROLES[role]}</Badge>;
}

interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

function AddUserForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם מלא"
        required
        value={form.displayName}
        onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
        placeholder="ישראל ישראלי"
      />
      <Input
        label="אימייל"
        type="email"
        required
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="user@hospital.org"
      />
      <Input
        label="סיסמה ראשונית"
        type="password"
        required
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        placeholder="לפחות 8 תווים"
      />
      <Select
        label="תפקיד"
        options={Object.entries(ROLES).map(([v, l]) => ({ value: v, label: l }))}
        value={form.role}
        onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button type="submit" loading={loading}>הוסף משתמש</Button>
      </div>
    </form>
  );
}

interface EditUserData {
  displayName: string;
  role: UserRole;
}

function EditUserForm({
  user,
  onSubmit,
  onCancel,
  loading,
}: {
  user: UserProfile;
  onSubmit: (data: EditUserData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<EditUserData>({
    displayName: user.displayName,
    role: user.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="שם מלא"
        required
        value={form.displayName}
        onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
      />
      <Select
        label="תפקיד"
        options={Object.entries(ROLES).map(([v, l]) => ({ value: v, label: l }))}
        value={form.role}
        onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>ביטול</Button>
        <Button type="submit" loading={loading}>שמור</Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { users, loading, createUser, updateUserRole, updateUserStatus, updateUserName } = useUsers();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [toggleUser, setToggleUser] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      await createUser(data.email, data.password, data.displayName, data.role);
      showToast('המשתמש נוסף בהצלחה', 'success');
      setShowAdd(false);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'שגיאה בהוספת משתמש';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: EditUserData) => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      await updateUserRole(editUser.uid, data.role);
      await updateUserName(editUser.uid, data.displayName);
      showToast('המשתמש עודכן', 'success');
      setEditUser(null);
    } catch {
      showToast('שגיאה בעדכון', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleUser) return;
    setSubmitting(true);
    try {
      await updateUserStatus(toggleUser.uid, !toggleUser.isActive);
      showToast(`המשתמש ${!toggleUser.isActive ? 'הופעל' : 'הושבת'}`, 'success');
      setToggleUser(null);
    } catch {
      showToast('שגיאה', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SectionLoader />;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ניהול משתמשים</h1>
            <p className="text-sm text-slate-500">{users.length} משתמשים רשומים</p>
          </div>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
            משתמש חדש
          </Button>
        </div>

        {/* Role explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(ROLES).map(([role, label]) => (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <RoleBadge role={role as UserRole} />
              </div>
              <p className="text-xs text-slate-500">
                {role === 'admin' && 'גישה מלאה, ניהול משתמשים והגדרות'}
                {role === 'editor' && 'הוספה ועריכה של הוצאות וקבצים'}
                {role === 'viewer' && 'צפייה בלבד בכל הנתונים'}
              </p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-end text-xs font-semibold text-slate-500">משתמש</th>
                <th className="px-4 py-3 text-end text-xs font-semibold text-slate-500">תפקיד</th>
                <th className="px-4 py-3 text-end text-xs font-semibold text-slate-500 hidden md:table-cell">נוצר</th>
                <th className="px-4 py-3 text-end text-xs font-semibold text-slate-500">סטטוס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.uid} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                        {user.displayName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.displayName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                    {user.createdAt ? formatDateTime(user.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'default'} dot>
                      {user.isActive ? 'פעיל' : 'מושבת'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.uid !== profile?.uid && (
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                          title="עריכה"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setToggleUser(user)}
                          className={`p-1.5 rounded ${
                            user.isActive
                              ? 'text-slate-400 hover:text-red-600'
                              : 'text-slate-400 hover:text-green-600'
                          }`}
                          title={user.isActive ? 'השבת' : 'הפעל'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="הוסף משתמש חדש">
          <AddUserForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} loading={submitting} />
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="עריכת משתמש">
          {editUser && (
            <EditUserForm
              user={editUser}
              onSubmit={handleEdit}
              onCancel={() => setEditUser(null)}
              loading={submitting}
            />
          )}
        </Modal>

        {/* Toggle Status Confirm */}
        <ConfirmModal
          isOpen={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onConfirm={handleToggleStatus}
          title={toggleUser?.isActive ? 'השבת משתמש' : 'הפעל משתמש'}
          message={`האם ${toggleUser?.isActive ? 'להשבית' : 'להפעיל'} את ${toggleUser?.displayName}?`}
          confirmText={toggleUser?.isActive ? 'השבת' : 'הפעל'}
          variant={toggleUser?.isActive ? 'danger' : 'warning'}
          loading={submitting}
        />
      </div>
    </ProtectedRoute>
  );
}
