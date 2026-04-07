// ─── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;       // ISO timestamp string from Supabase
  lastLoginAt?: string;
}

// ─── Budget Years ──────────────────────────────────────────────────────────────

export interface BudgetYear {
  id: string;
  year: number;
  totalBudget: number;
  isActive: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Categories ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

// ─── Expenses ──────────────────────────────────────────────────────────────────

export type PaymentMethod =
  | 'העברה בנקאית'
  | 'מזומן'
  | 'כרטיס אשראי'
  | "צ'ק"
  | 'אחר'
  | 'הוחזר לתקציב המחלקתי'
  | 'הוחזר למשלם'
  | 'הוחזר בפייבוקס';

export type ReimbursementStatus = 'ממתין' | 'הוחזר' | 'לא רלוונטי';

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  uploadedAt: string;       // ISO timestamp string
  uploadedBy: string;
  uploadedByName: string;
  size: number;
  type: string;
}

export interface Expense {
  id: string;
  yearId: string;
  categoryId: string;
  categoryName?: string;    // denormalized for display
  title: string;
  description: string;
  amount: number;
  date: string;             // "YYYY-MM-DD" date string from Supabase DATE column
  paidBy: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  invoiceNumber?: string;
  reimbursementStatus: ReimbursementStatus;
  reimbursementDate?: string;
  returnDateToPayer?: string;          // תאריך החזרה למשלם
  returnDateToBudget?: string;         // תאריך החזרה לתקציב המחלקתי
  externalLink?: string;
  notes?: string;
  attachments: AttachmentFile[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
}

export interface ExpenseFormData {
  yearId: string;
  categoryId: string;
  title: string;
  description: string;
  amount: number;
  date: string;             // "YYYY-MM-DD"
  paidBy: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  invoiceNumber?: string;
  reimbursementStatus: ReimbursementStatus;
  reimbursementDate?: string;
  returnDateToPayer?: string;          // תאריך החזרה למשלם
  returnDateToBudget?: string;         // תאריך החזרה לתקציב המחלקתי
  externalLink?: string;
  notes?: string;
  // File attachments — managed outside the zod schema, merged on submit
  attachments?: AttachmentFile[];
}

// ─── Filters & Sort ────────────────────────────────────────────────────────────

export interface ExpenseFilters {
  yearId?: string;
  categoryId?: string;
  paidBy?: string;
  reimbursementStatus?: ReimbursementStatus | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type ExpenseSortField = 'date' | 'amount' | 'categoryName' | 'title' | 'paidBy';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: ExpenseSortField;
  direction: SortDirection;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface AppSettings {
  id: string;
  departmentName: string;
  systemName: string;
  externalLink?: string;
  activeYearId: string;
  updatedAt: string;
  updatedBy: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface YearSummary {
  year: BudgetYear;
  totalExpenses: number;
  remaining: number;
  percentUsed: number;
  expenseCount: number;
  pendingReimbursements: number;
  pendingReimbursementsAmount: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  monthLabel: string;
  total: number;
}

// ─── Reports ───────────────────────────────────────────────────────────────────

export type ReportType = 'by-category' | 'by-payer' | 'by-month' | 'by-reimbursement' | 'full';

export interface ReportFilters {
  yearId: string;
  categoryId?: string;
  reportType: ReportType;
  dateFrom?: string;
  dateTo?: string;
}
