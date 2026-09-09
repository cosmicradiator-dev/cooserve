'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, LogIn, HardHat, User, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const roleCookie = cookies.find((c) => c.startsWith('coop_user_role='))?.split('=')[1];
    const idCookie = cookies.find((c) => c.startsWith('coop_user_id='))?.split('=')[1];

    if (roleCookie && idCookie) {
      if (roleCookie === 'worker') router.push('/worker/dashboard');
      else if (roleCookie === 'admin') router.push('/admin/dashboard');
      else router.push('/customer/request');
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    const loginEmail = overrideEmail || email;
    const loginPassword = overridePassword || password;

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Invalid email or password credentials');
      }

      const role = json.data?.user?.role || 'customer';
      const userId = json.data?.user?.id;
      document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `coop_user_id=${userId}; path=/; max-age=86400; SameSite=Lax`;

      const targetPath = json.data?.redirectUrl || '/customer/request';
      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentialsAndLogin = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    handleLogin(undefined, testEmail, testPass);
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-md bg-white border border-slate-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold">
            <Shield className="w-4 h-4 stroke-[1.75]" />
            <span>Enterprise Authentication</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Supabase Auth</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Sign In</h1>
        <p className="text-slate-600 text-xs mt-1 leading-relaxed">
          Access your decentralized cooperative dashboard. Credentials are encrypted and hashed on the database server.
        </p>

        {errorParam && !errorMsg && (
          <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {errorParam === 'login_required' && 'Please sign in to access portal features.'}
              {errorParam === 'admin_required' && 'Admin privileges required to access that section.'}
              {errorParam === 'worker_required' && 'Worker account required to access that section.'}
              {errorParam === 'customer_required' && 'Customer account required to access that section.'}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Demo Accounts */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-slate-500">
            <span>Seeded Demo Accounts:</span>
            <span className="text-[10px] text-slate-400 lowercase font-normal">(Password123!)</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => fillTestCredentialsAndLogin('ramesh@coop.org', 'Password123!')}
            className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-left transition-colors duration-150 disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-slate-800 font-medium">
              <HardHat className="w-4 h-4 text-slate-600" />
              <span>Ramesh (Worker)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ramesh@coop.org
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => fillTestCredentialsAndLogin('priya@mail.com', 'Password123!')}
            className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-left transition-colors duration-150 disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-slate-800 font-medium">
              <User className="w-4 h-4 text-slate-600" />
              <span>Priya (Customer)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              priya@mail.com
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => fillTestCredentialsAndLogin('admin@coop.org', 'Password123!')}
            className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-left transition-colors duration-150 disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-slate-800 font-medium">
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Platform Admin</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              admin@coop.org
            </span>
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={(e) => handleLogin(e)} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@coop.org or priya@mail.com"
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors duration-150 mt-4 disabled:opacity-60"
          >
            <LogIn className="w-3.5 h-3.5" /> {loading ? 'Verifying with Supabase...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="pt-5 mt-5 border-t border-slate-200 text-center text-xs text-slate-600">
        New to the cooperative?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-bg">
      <Suspense fallback={<div className="p-6 text-slate-600 text-xs">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
