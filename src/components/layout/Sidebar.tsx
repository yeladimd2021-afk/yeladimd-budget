'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Building2,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'לוח בקרה', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/expenses', label: 'הוצאות', icon: <Receipt className="h-5 w-5" /> },
  { href: '/years', label: 'שנות תקציב', icon: <CalendarDays className="h-5 w-5" /> },
  { href: '/reports', label: 'דוחות', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/users', label: 'ניהול משתמשים', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { href: '/settings', label: 'הגדרות', icon: <Settings className="h-5 w-5" />, adminOnly: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { profile, isAdmin, signOut } = useAuth();
  const { settings } = useSettings();

  const handleSignOut = async () => {
    await signOut();
  };

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo / Department Name */}
      <div className="px-5 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {settings?.systemName || 'מחלקה ד׳'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {settings?.departmentName || 'ניהול תקציב'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
            {profile?.displayName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{profile?.displayName}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </button>
      </div>
    </aside>
  );
}
