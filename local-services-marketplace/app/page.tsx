'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HardHat, User, Settings, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const setRoleCookie = (role: string, userId: string) => {
    document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `coop_user_id=${userId}; path=/; max-age=86400; SameSite=Lax`;
  };

  return (
    <main className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" /> Cooperative Enterprise v2.0
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
          Cooperative Gig Services Platform
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Empowering community gig workers with fair pricing, verified cooperatives, and dynamic PostGIS matching.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="space-y-3 my-6">
        <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
          Select Your Portal / Role
        </div>

        {/* Worker Portal */}
        <Link
          href="/worker/dashboard"
          onClick={() => setRoleCookie('worker', '00000000-0000-0000-0000-000000000002')}
          className="group block p-4 rounded-2xl bg-slate-800/80 border border-teal-500/30 hover:border-teal-400 transition-all shadow-md hover:shadow-teal-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">
                  Worker App
                </div>
                <div className="text-xs text-slate-400">Location, live briefing, earnings</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Customer Portal */}
        <Link
          href="/customer/request"
          onClick={() => setRoleCookie('customer', '00000000-0000-0000-0000-000000000005')}
          className="group block p-4 rounded-2xl bg-slate-800/80 border border-amber-500/30 hover:border-amber-400 transition-all shadow-md hover:shadow-amber-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                  Customer App
                </div>
                <div className="text-xs text-slate-400">Request service, live quotes & trust badge</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Admin Portal */}
        <Link
          href="/admin/dashboard"
          onClick={() => setRoleCookie('admin', '00000000-0000-0000-0000-000000000001')}
          className="group block p-4 rounded-2xl bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-md hover:shadow-indigo-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-admin flex items-center justify-center text-white shadow-md">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  Admin Console
                </div>
                <div className="text-xs text-slate-400">Cost parameter engine & worker verification</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Auth Links */}
      <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
        <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}

