'use client';

import React from 'react';
import { WorkerBottomNav } from '@/components/nav/WorkerBottomNav';
import { HardHat, LayoutDashboard, MapPin, Wallet, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Work Location', href: '/worker/location', icon: MapPin },
    { label: 'Earnings Ledger', href: '/worker/earnings', icon: Wallet },
    { label: 'Profile', href: '/worker/profile', icon: User },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/70 text-text">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link href="/worker/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                COOP WORKER
              </div>
              <div className="text-[10px] text-teal-700 font-medium">Verified Collective</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-primary shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Exit Button */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Touch-optimized Bottom Nav for Mobile Only */}
      <WorkerBottomNav />
    </div>
  );
}
