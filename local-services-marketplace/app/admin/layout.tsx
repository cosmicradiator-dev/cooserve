'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Sliders, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Cost Parameters', href: '/admin/dashboard', icon: Sliders },
    { label: 'Worker Verification', href: '/admin/workers', icon: Users },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/70 text-text">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-admin flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-none text-white">
                ADMIN CONTROL
              </div>
              <div className="text-[10px] text-indigo-300 font-medium">Enterprise Governance</div>
            </div>
          </Link>

          {/* Desktop Nav in Header */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-admin text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Portal</span>
          </Link>
        </div>
      </header>

      {/* Admin Sub Nav (Visible on Mobile & Tablet for quick switching) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold transition-colors whitespace-nowrap ${
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
