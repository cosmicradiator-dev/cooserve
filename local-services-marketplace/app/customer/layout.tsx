'use client';

import React from 'react';
import { CustomerBottomNav } from '@/components/nav/CustomerBottomNav';
import { User, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col justify-between bg-bg text-text min-h-full">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-slate-900 leading-none">
              COOP CONSUMER
            </div>
            <div className="text-[10px] text-amber-700 font-medium">Fair Trade Community</div>
          </div>
        </div>

        <Link
          href="/"
          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
        >
          Exit
        </Link>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>

      {/* 3-Tab Bottom Nav */}
      <CustomerBottomNav />
    </div>
  );
}

