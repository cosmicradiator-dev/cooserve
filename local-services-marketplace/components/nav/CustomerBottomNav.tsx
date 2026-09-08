'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, CreditCard, User } from 'lucide-react';

export function CustomerBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Request', href: '/customer/request', icon: PlusCircle },
    { label: 'Payments', href: '/customer/payments', icon: CreditCard },
    { label: 'Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex justify-around items-center shadow-lg safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-secondary font-bold scale-105' : 'text-text-muted hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
