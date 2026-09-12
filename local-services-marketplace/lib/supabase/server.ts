import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, maskKey } from './config';

// Enforce server-only isolation
if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/server.ts cannot be imported in client-side code');
}

export function createServerClient() {
  const config = getSupabaseConfig();

  if (!config.hasServiceRoleKey && process.env.NODE_ENV !== 'test') {
    console.warn(
      `[Supabase Server] Notice: SUPABASE_SERVICE_ROLE_KEY is not configured. Server client is using anon key (${maskKey(config.anonKey)}). Privileged operations will adhere to standard Row-Level Security (RLS).`
    );
  }

  return createSupabaseClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
