/**
 * Supabase seed — inserts realistic Hebrew sample data.
 * Called from /settings/seed (admin only).
 * Safe to re-run: uses upsert / checks existing data first.
 */
import { supabase } from '@/lib/supabase/client';

const SAMPLE_EXPENSES = [
  // 2024
  { year: 2024, title: 'רכישת נייר A4 וציוד כתיבה', category: 'ציוד משרדי', amount: 320, date: '2024-01-15', paidBy: 'ד"ר רחל כהן', paymentMethod: 'כרטיס אשראי', vendor: 'אופיס דיפו', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-02-01', notes: '' },
  { year: 2024, title: 'קניית לוחות ציור לילדים', category: 'פעילויות לילדים', amount: 480, date: '2024-02-08', paidBy: 'מיכל לוי', paymentMethod: 'מזומן', vendor: 'חנות אמנות', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-02-20', notes: 'עבור סדנת ציור' },
  { year: 2024, title: 'כיבוד לישיבת צוות חודשית', category: 'כיבוד', amount: 215, date: '2024-02-12', paidBy: 'יוסף אברהם', paymentMethod: 'מזומן', vendor: 'מאפיית לחם טוב', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-03-01', notes: '' },
  { year: 2024, title: 'תיקון ברז במטבח המחלקה', category: 'תחזוקה', amount: 650, date: '2024-03-05', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'שרברבות אלון', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-03-15', notes: '' },
  { year: 2024, title: 'משחקים טיפוליים לחדר הפעילות', category: 'ציוד טיפולי', amount: 890, date: '2024-03-18', paidBy: 'שרה מזרחי', paymentMethod: 'כרטיס אשראי', vendor: 'צעצועי לב', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-04-01', notes: 'כולל מגנטים ופאזלים' },
  { year: 2024, title: 'פעילות יום הולדת לילדים', category: 'פעילויות לילדים', amount: 550, date: '2024-04-22', paidBy: 'מיכל לוי', paymentMethod: 'מזומן', vendor: '', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-05-01', notes: 'עוגה ופינוקים' },
  { year: 2024, title: 'חידוש מנוי תוכנת ניהול', category: 'רכישות שונות', amount: 1200, date: '2024-05-10', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'MedSoft Ltd', reimbursementStatus: 'לא רלוונטי', notes: 'חידוש שנתי' },
  { year: 2024, title: 'ציוד ניקיון ומוצרי היגיינה', category: 'ציוד משרדי', amount: 280, date: '2024-06-03', paidBy: 'יוסף אברהם', paymentMethod: 'מזומן', vendor: 'סופרדרג', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-06-15', notes: '' },
  { year: 2024, title: 'ספרי קריאה לספריית המחלקה', category: 'ציוד טיפולי', amount: 760, date: '2024-07-14', paidBy: 'שרה מזרחי', paymentMethod: 'כרטיס אשראי', vendor: 'ספרי כיף', reimbursementStatus: 'הוחזר', reimbursementDate: '2024-08-01', notes: '12 ספרים לגילאי 6-14' },
  { year: 2024, title: 'תחלופת מנורות תאורה', category: 'תחזוקה', amount: 430, date: '2024-08-20', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'חשמל מאיר', reimbursementStatus: 'לא רלוונטי', notes: '' },

  // 2025
  { year: 2025, title: 'ציוד כתיבה ומשרד חדש לשנה', category: 'ציוד משרדי', amount: 450, date: '2025-01-08', paidBy: 'ד"ר רחל כהן', paymentMethod: 'כרטיס אשראי', vendor: 'אופיס דיפו', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-01-20', notes: 'רכישה שנתית' },
  { year: 2025, title: 'סדנת יצירה ופיסול לחודש ינואר', category: 'פעילויות לילדים', amount: 680, date: '2025-01-20', paidBy: 'מיכל לוי', paymentMethod: 'מזומן', vendor: 'בית יוצר', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-02-01', notes: '' },
  { year: 2025, title: 'כיבוד לכנס רופאים', category: 'כיבוד', amount: 940, date: '2025-02-05', paidBy: 'יוסף אברהם', paymentMethod: 'כרטיס אשראי', vendor: 'קייטרינג המנגל', reimbursementStatus: 'ממתין', notes: 'אסרטשן מלא ל-20 איש' },
  { year: 2025, title: 'מחשב נייד לצרכי מחלקה', category: 'רכישות שונות', amount: 3200, date: '2025-02-18', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'iDigital', reimbursementStatus: 'לא רלוונטי', notes: 'Dell Inspiron 15' },
  { year: 2025, title: 'חידוש ציוד הרגעה ורגיעה', category: 'ציוד טיפולי', amount: 1100, date: '2025-03-10', paidBy: 'שרה מזרחי', paymentMethod: 'כרטיס אשראי', vendor: 'תרפינטרי', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-03-25', notes: 'כדורי לחץ, שמיכות כבידה' },
  { year: 2025, title: 'ציוד שחקנות בובות לחדר טיפולים', category: 'ציוד טיפולי', amount: 570, date: '2025-03-25', paidBy: 'מיכל לוי', paymentMethod: 'כרטיס אשראי', vendor: 'בובות ושות׳', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-04-05', notes: '' },
  { year: 2025, title: 'כיבוד חג פסח לצוות', category: 'כיבוד', amount: 380, date: '2025-04-10', paidBy: 'יוסף אברהם', paymentMethod: 'מזומן', vendor: 'מאפיית ברכה', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-04-20', notes: '' },
  { year: 2025, title: 'תיקון מזגן בחדר שינה', category: 'תחזוקה', amount: 820, date: '2025-05-02', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'קירור ביתי', reimbursementStatus: 'לא רלוונטי', notes: '' },
  { year: 2025, title: 'פעילות גיבוש קיץ לילדים', category: 'פעילויות לילדים', amount: 1450, date: '2025-06-18', paidBy: 'שרה מזרחי', paymentMethod: 'כרטיס אשראי', vendor: 'פארק הרפתקאות', reimbursementStatus: 'ממתין', notes: 'כניסה + ארוחה + הסעה' },
  { year: 2025, title: 'הדפסת פוסטרים וחוברות', category: 'ציוד משרדי', amount: 260, date: '2025-07-07', paidBy: 'מיכל לוי', paymentMethod: 'מזומן', vendor: 'קסם הדפסות', reimbursementStatus: 'הוחזר', reimbursementDate: '2025-07-20', notes: '' },

  // 2026
  { year: 2026, title: 'ציוד משרדי לתחילת שנה', category: 'ציוד משרדי', amount: 390, date: '2026-01-12', paidBy: 'ד"ר רחל כהן', paymentMethod: 'כרטיס אשראי', vendor: 'אופיס דיפו', reimbursementStatus: 'הוחזר', reimbursementDate: '2026-01-25', notes: '' },
  { year: 2026, title: 'ערכות ציור וצבעים', category: 'פעילויות לילדים', amount: 520, date: '2026-01-28', paidBy: 'מיכל לוי', paymentMethod: 'מזומן', vendor: 'בית האמן', reimbursementStatus: 'ממתין', notes: 'עבור קבוצת יצירה שבועית' },
  { year: 2026, title: 'כיבוד ישיבה מקצועית', category: 'כיבוד', amount: 310, date: '2026-02-05', paidBy: 'יוסף אברהם', paymentMethod: 'מזומן', vendor: 'קפה וביסקוויט', reimbursementStatus: 'ממתין', notes: '' },
  { year: 2026, title: 'ספרים קליניים חדשים', category: 'ציוד טיפולי', amount: 840, date: '2026-02-19', paidBy: 'ד"ר רחל כהן', paymentMethod: 'העברה בנקאית', vendor: 'ספרית הרפואה', reimbursementStatus: 'לא רלוונטי', notes: 'DSM-5 ועוד 3 ספרים' },
];

export async function seedDatabase(): Promise<void> {
  // 1. Fetch existing years and categories
  const { data: yearsData } = await supabase.from('years').select('id, year');
  const { data: categoriesData } = await supabase.from('categories').select('id, name');

  if (!yearsData || !categoriesData) {
    throw new Error('לא ניתן לטעון שנות תקציב / קטגוריות. ודא שהסכמה הוגדרה.');
  }

  const yearMap = new Map<number, string>(yearsData.map(y => [y.year, y.id]));
  const catMap = new Map<string, string>(categoriesData.map(c => [c.name, c.id]));

  // 2. Insert expenses
  const rows = SAMPLE_EXPENSES
    .filter(e => yearMap.has(e.year) && catMap.has(e.category))
    .map(e => ({
      year_id: yearMap.get(e.year)!,
      category_id: catMap.get(e.category)!,
      title: e.title,
      description: '',
      amount: e.amount,
      date: e.date,
      paid_by: e.paidBy,
      payment_method: e.paymentMethod,
      vendor: e.vendor ?? '',
      invoice_number: '',
      reimbursement_status: e.reimbursementStatus,
      reimbursement_date: (e as { reimbursementDate?: string }).reimbursementDate || null,
      external_link: '',
      notes: e.notes ?? '',
      attachments: [],
      created_by_name: 'מנהל מערכת',
      updated_by_name: 'מנהל מערכת',
    }));

  const { error } = await supabase.from('expenses').insert(rows);
  if (error) throw new Error(error.message);
}
