'use client';

import React from 'react';
import { CustomerBottomNav } from '@/components/nav/CustomerBottomNav';
import { Sparkles, PlusCircle, CreditCard, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Request Service', href: '/customer/request', icon: PlusCircle },
    { label: 'Payments & Escrow', href: '/customer/payments', icon: CreditCard },
    { label: 'Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg text-slate-900">
      {/* Top Responsive Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link href="/customer/request" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
                CooServe Consumer
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Fair Trade Services</div>
            </div>
          </Link>

          {/* Desktop Navigation Links (Tablet & Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            {navLinks.map((tab) => {
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

          {/* Exit / Portal Switcher */}
          <div className="flex items-center gap-2">
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Touch-optimized Bottom Nav for Mobile Only */}
      <CustomerBottomNav />
    </div>
  );
}
