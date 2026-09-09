'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogIn, UserPlus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated via session cookies
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const roleCookie = cookies.find((c) => c.startsWith('coop_user_role='))?.split('=')[1];
    const idCookie = cookies.find((c) => c.startsWith('coop_user_id='))?.split('=')[1];

    if (roleCookie && idCookie) {
      if (roleCookie === 'worker') {
        router.replace('/worker/dashboard');
      } else if (roleCookie === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/customer/request');
      }
    } else {
      // Unauthenticated visitors are redirected to the Login page
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg text-slate-900 p-6">
      <div className="flex flex-col items-center text-center max-w-sm p-8 bg-white border border-slate-200 rounded-md">
        <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-primary mb-3">
          <Shield className="w-5 h-5 stroke-[1.75]" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">CooServe Platform</h1>
        <p className="text-slate-600 text-xs mt-1">
          Redirecting to secure login gate...
        </p>

        <div className="mt-6 flex items-center gap-3 w-full">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs transition-colors duration-150"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 transition-colors duration-150"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </Link>
        </div>
      </div>
    </main>
  );
}
