'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Wallet, User } from 'lucide-react';

export function WorkerBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Location', href: '/worker/location', icon: MapPin },
    { label: 'Earnings', href: '/worker/earnings', icon: Wallet },
    { label: 'Profile', href: '/worker/profile', icon: User },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 z-30 w-full bg-white border-t border-slate-200 px-3 py-2 flex justify-around items-center safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-colors duration-150 py-1 px-3 rounded-md ${
              isActive ? 'text-primary font-medium' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[11px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
