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
    <nav className="md:hidden sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 flex justify-around items-center shadow-lg safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-primary font-bold scale-105' : 'text-text-muted hover:text-slate-800'
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
