'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Sliders, Users, LogOut } from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Cost Parameters', href: '/admin/dashboard', icon: Sliders },
    { label: 'Worker Verification', href: '/admin/workers', icon: Users },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg text-slate-900">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold">
              <ShieldAlert className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
                CooServe Admin
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Enterprise Governance</div>
            </div>
          </Link>

          {/* Desktop Nav in Header */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-primary border border-slate-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          <SignOutButton />
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
              className={`flex items-center gap-1.5 py-2.5 border-b-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.75]" />
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
