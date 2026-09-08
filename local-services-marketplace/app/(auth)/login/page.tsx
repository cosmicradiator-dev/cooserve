'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LogIn, HardHat, User, Settings, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuthCookiesAndRedirect = (role: string, userId: string, targetPath: string) => {
    document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `coop_user_id=${userId}; path=/; max-age=86400; SameSite=Lax`;
    router.push(targetPath);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let role = 'customer';
    let userId = '00000000-0000-0000-0000-000000000005';
    let targetPath = '/customer/request';

    if (email.includes('worker')) {
      role = 'worker';
      userId = '00000000-0000-0000-0000-000000000002';
      targetPath = '/worker/dashboard';
    } else if (email.includes('admin')) {
      role = 'admin';
      userId = '00000000-0000-0000-0000-000000000001';
      targetPath = '/admin/dashboard';
    }

    setTimeout(() => {
      setAuthCookiesAndRedirect(role, userId, targetPath);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>COOPERATIVE SECURE AUTH</span>
          </div>
          <Link href="/" className="text-slate-400 hover:text-white text-xs transition-colors">
            ← Home
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">Sign In</h1>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
          Access your decentralized cooperative dashboard
        </p>

        {errorParam && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorParam === 'admin_required' && 'Admin privileges required for that section.'}
            {errorParam === 'worker_required' && 'Worker account required for that section.'}
            {errorParam === 'customer_required' && 'Customer account required for that section.'}
          </div>
        )}

        {/* Quick Demo Sign-Ins */}
        <div className="mt-6 space-y-2">
          <div className="text-[11px] uppercase font-bold text-slate-500">
            One-Click Test Accounts:
          </div>
          <button
            type="button"
            onClick={() => setAuthCookiesAndRedirect('worker', '00000000-0000-0000-0000-000000000002', '/worker/dashboard')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-teal-500/30 hover:border-teal-400 text-xs font-semibold text-left transition-all hover:bg-slate-800"
          >
            <span className="flex items-center gap-2.5">
              <HardHat className="w-4 h-4 text-primary" /> Demo Worker (Ramesh)
            </span>
            <span className="text-[10px] text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded">Electrician</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthCookiesAndRedirect('customer', '00000000-0000-0000-0000-000000000005', '/customer/request')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 text-xs font-semibold text-left transition-all hover:bg-slate-800"
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-secondary" /> Demo Customer (Priya)
            </span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">Consumer</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthCookiesAndRedirect('admin', '00000000-0000-0000-0000-000000000001', '/admin/dashboard')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-indigo-500/30 hover:border-indigo-400 text-xs font-semibold text-left transition-all hover:bg-slate-800"
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-indigo-400" /> Platform Admin
            </span>
            <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">Superuser</span>
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleCustomLogin} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@coop.org or customer@mail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-3 shadow-md hover:shadow-teal-900/30"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-800 text-center text-xs text-slate-400">
        New to the cooperative?{' '}
        <Link href="/signup" className="text-teal-400 font-bold hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <Suspense fallback={<div className="p-6 text-white text-xs">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
