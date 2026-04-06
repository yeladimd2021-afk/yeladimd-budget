'use client';

import Link from 'next/link';

export default function RootPage() {
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-md p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">מערכת ניהול תקציב</h1>
        <p className="text-gray-600">
          ברוכה הבאה למערכת. בחרי לאן להמשיך.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 text-white py-3 px-4 font-medium hover:bg-blue-700 transition"
          >
            מעבר להתחברות
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-300 py-3 px-4 font-medium hover:bg-gray-50 transition"
          >
            מעבר לדשבורד
          </Link>
        </div>
      </div>
    </main>
  );
}