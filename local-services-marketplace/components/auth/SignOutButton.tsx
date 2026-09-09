'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

export function SignOutButton({ className, label = 'Exit Portal' }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during Supabase sign out:', err);
    } finally {
      // Clear legacy/middleware cookies
      document.cookie = 'coop_user_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'coop_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

      router.push('/login');
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors duration-150 border border-slate-300'
      }
      title="Sign out and return to login"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? 'Exiting...' : label}</span>
    </button>
  );
}
