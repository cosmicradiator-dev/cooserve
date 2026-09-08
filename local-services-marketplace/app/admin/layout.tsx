'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Sliders, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Cost Parameters', href: '/admin/dashboard', icon: Sliders },
    { label: 'Worker Verification', href: '/admin/workers', icon: Users },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between bg-bg text-text min-h-full">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-20 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-admin flex items-center justify-center text-white shadow-sm font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight leading-none text-white">
              ADMIN CONTROL
            </div>
            <div className="text-[10px] text-indigo-300 font-medium">Enterprise Governance</div>
          </div>
        </div>

        <Link
          href="/"
          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
        >
          Exit
        </Link>
      </header>

      {/* Admin Sub Nav */}
      <div className="bg-white border-b border-slate-200 px-4 flex gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold transition-colors ${
                isActive
                  ? 'border-admin text-admin'
                  : 'border-transparent text-text-muted hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

