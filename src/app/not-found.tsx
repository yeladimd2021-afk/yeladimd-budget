import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">דף לא נמצא</h2>
        <p className="text-slate-500 mb-6">הדף שחיפשת אינו קיים</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          חזרה ללוח הבקרה
        </Link>
      </div>
    </div>
  );
}
