import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Enforce server-only isolation
if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/server.ts cannot be imported in client-side code');
}

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isPlaceholderServiceKey =
    !rawServiceKey ||
    rawServiceKey.includes('your-supabase') ||
    rawServiceKey === 'placeholder-key';

  if (isPlaceholderServiceKey && process.env.NODE_ENV !== 'test') {
    console.warn(
      '[Supabase Server] Warning: SUPABASE_SERVICE_ROLE_KEY is not set in local-services-marketplace/.env. Privileged operations may be restricted by Row-Level Security (RLS).'
    );
  }

  const serviceRoleKey = !isPlaceholderServiceKey
    ? rawServiceKey
    : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
       'placeholder-key');

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

