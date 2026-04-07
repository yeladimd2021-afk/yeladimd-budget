import { UserRole, PaymentMethod, ReimbursementStatus } from '@/types';

export const COLLECTIONS = {
  USERS: 'users',
  YEARS: 'years',
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
} as const;

export const SETTINGS_DOC_ID = 'main';

export const ROLES: Record<UserRole, string> = {
  admin: 'מנהל מערכת',
  editor: 'עורך',
  viewer: 'צופה',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view', 'create', 'edit', 'delete', 'manage_users', 'manage_settings'],
  editor: ['view', 'create', 'edit'],
  viewer: ['view'],
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  'פייבוקס',
  'מזומן',
  'העברה בנקאית',
  "צ'ק",
  'ישירות תקציב מחלקה',
];

export const REIMBURSEMENT_STATUSES: ReimbursementStatus[] = [
  'לא הוחזר',
  'ממתין',
  'לא רלוונטי',
  'הוחזר בפייבוקס',
  'הוחזר בהעברה בנקאית',
];

export const DEFAULT_CATEGORIES = [
  { name: 'ציוד משרדי', color: '#3b82f6', order: 1 },
  { name: 'ציוד טיפולי', color: '#8b5cf6', order: 2 },
  { name: 'פעילויות לילדים', color: '#f59e0b', order: 3 },
  { name: 'כיבוד', color: '#10b981', order: 4 },
  { name: 'תחזוקה', color: '#6b7280', order: 5 },
  { name: 'רכישות שונות', color: '#ef4444', order: 6 },
  { name: 'החזרים', color: '#ec4899', order: 7 },
  { name: 'אחר', color: '#64748b', order: 8 },
];

export const CHART_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#6b7280',
  '#ef4444',
  '#ec4899',
  '#64748b',
  '#06b6d4',
  '#84cc16',
];

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EXPENSES: '/expenses',
  EXPENSE_NEW: '/expenses/new',
  EXPENSE_DETAIL: (id: string) => `/expenses/${id}`,
  EXPENSE_EDIT: (id: string) => `/expenses/${id}/edit`,
  YEARS: '/years',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USERS: '/users',
} as const;
