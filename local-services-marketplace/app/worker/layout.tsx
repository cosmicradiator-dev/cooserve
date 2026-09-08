'use client';

import React from 'react';
import { WorkerBottomNav } from '@/components/nav/WorkerBottomNav';
import { HardHat } from 'lucide-react';
import Link from 'next/link';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col justify-between bg-bg text-text min-h-full">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-slate-900 leading-none">
              COOP WORKER
            </div>
            <div className="text-[10px] text-teal-700 font-medium">Verified Collective</div>
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

      {/* 4-Tab Bottom Nav */}
      <WorkerBottomNav />
    </div>
  );
}

