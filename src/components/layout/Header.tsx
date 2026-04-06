'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, actions, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-bold text-slate-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
