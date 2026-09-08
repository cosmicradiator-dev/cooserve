'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LogIn, HardHat, User, Settings } from 'lucide-react';

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
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white">
      <div>
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-3">
          <ShieldCheck className="w-5 h-5" /> COOPERATIVE SECURE AUTH
        </div>
        <h1 className="text-2xl font-black">Sign In</h1>
        <p className="text-slate-400 text-xs mt-1">
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
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-teal-500/30 hover:border-teal-400 text-xs font-semibold text-left transition-all"
          >
            <span className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" /> Demo Worker (Ramesh)
            </span>
            <span className="text-[10px] text-teal-400 font-mono">Electrician</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthCookiesAndRedirect('customer', '00000000-0000-0000-0000-000000000005', '/customer/request')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-xs font-semibold text-left transition-all"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-secondary" /> Demo Customer (Priya)
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Consumer</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthCookiesAndRedirect('admin', '00000000-0000-0000-0000-000000000001', '/admin/dashboard')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-indigo-500/30 hover:border-indigo-400 text-xs font-semibold text-left transition-all"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" /> Platform Admin
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Superuser</span>
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleCustomLogin} className="mt-6 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@coop.org or customer@mail.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
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
    <Suspense fallback={<div className="p-6 text-white text-xs">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}

