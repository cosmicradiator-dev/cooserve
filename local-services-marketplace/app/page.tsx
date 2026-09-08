'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  HardHat,
  User,
  Settings,
  ArrowRight,
  Sparkles,
  MapPin,
  Coins,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const setRoleCookie = (role: string, userId: string) => {
    document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `coop_user_id=${userId}; path=/; max-age=86400; SameSite=Lax`;
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black tracking-tight text-white text-base">CooServe</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white font-medium transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-sm hover:shadow-teal-900/30"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-6 shadow-inner">
          <ShieldCheck className="w-4 h-4" />
          <span>Decentralized Cooperative Gig Marketplace v2.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15]">
          Fair Pricing, Direct Matching, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400">Zero Corporate Cut</span>.
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
          Empowering local blue-collar artisans and households with 100% transparent algorithmic pricing, PostGIS geospatial dispatch, and guaranteed escrow protection.
        </p>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 w-full max-w-3xl text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">0% Platform Rent</div>
              <div className="text-[11px] text-slate-400">100% of customer fee goes to workers</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">PostGIS Geofencing</div>
              <div className="text-[11px] text-slate-400">Verified nearby providers in your radius</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Escrow Guarantee</div>
              <div className="text-[11px] text-slate-400">Funds released only after completion</div>
            </div>
          </div>
        </div>

        {/* Role Portals Grid */}
        <div className="w-full mt-12 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-500">
              Select Your Portal To Enter
            </h2>
            <span className="text-xs text-slate-500">Simulated one-click session</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Worker Portal */}
            <Link
              href="/worker/dashboard"
              onClick={() => setRoleCookie('worker', '00000000-0000-0000-0000-000000000002')}
              className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-teal-500/30 hover:border-teal-400 transition-all shadow-xl hover:shadow-teal-950/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-105 transition-transform">
                  <HardHat className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors">
                  Worker App
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Live job briefing, interactive PostGIS radius location picker, and transparent net earnings ledger.
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-400">
                <span>Enter Worker Console</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Customer Portal */}
            <Link
              href="/customer/request"
              onClick={() => setRoleCookie('customer', '00000000-0000-0000-0000-000000000005')}
              className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-amber-500/30 hover:border-amber-400 transition-all shadow-xl hover:shadow-amber-950/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">
                  Customer App
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Instant service requests, live dynamic quotes, verified cooperative nearby trust badge, and escrow payments.
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Enter Customer Portal</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Admin Portal */}
            <Link
              href="/admin/dashboard"
              onClick={() => setRoleCookie('admin', '00000000-0000-0000-0000-000000000001')}
              className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-xl hover:shadow-indigo-950/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-105 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                  Admin Console
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Cost engine variable governance, live worker verification queue, and tamper-evident audit log trail.
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Cloud Connected • Node.js Edge Rate Limiter Active</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-300 transition-colors">
              New Member Register
            </Link>
            <span>&copy; {new Date().getFullYear()} CooServe Cooperative</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
