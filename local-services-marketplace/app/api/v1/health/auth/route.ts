import { NextResponse } from 'next/server';
import { getSupabaseConfig, maskKey } from '@/lib/supabase/config';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  const config = getSupabaseConfig();
  const startTime = Date.now();

  const diagnostics: {
    status: 'HEALTHY' | 'DEGRADED' | 'UNCONFIGURED';
    environment: string;
    authGateway: {
      reachable: boolean;
      status: number | null;
      latencyMs: number;
      error?: string;
    };
    database: {
      reachable: boolean;
      status: number | null;
      error?: string;
    };
    config: {
      supabaseUrl: string;
      anonKeyPresent: boolean;
      anonKeyPreview: string;
      serviceRoleKeyPresent: boolean;
    };
    remediation?: string;
  } = {
    status: 'UNCONFIGURED',
    environment: process.env.NODE_ENV || 'development',
    authGateway: {
      reachable: false,
      status: null,
      latencyMs: 0,
    },
    database: {
      reachable: false,
      status: null,
    },
    config: {
      supabaseUrl: config.url,
      anonKeyPresent: config.hasAnonKey,
      anonKeyPreview: maskKey(config.anonKey),
      serviceRoleKeyPresent: config.hasServiceRoleKey,
    },
  };

  if (!config.isConfigured) {
    diagnostics.status = 'UNCONFIGURED';
    diagnostics.remediation =
      'Supabase credentials missing or set to placeholder. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env and restart your server.';
    return NextResponse.json(diagnostics, { status: 503 });
  }

  // 1. Test Auth Gateway Health
  try {
    const authHealthUrl = `${config.url}/auth/v1/health`;
    const res = await fetch(authHealthUrl, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
      cache: 'no-store',
    });

    diagnostics.authGateway.status = res.status;
    diagnostics.authGateway.latencyMs = Date.now() - startTime;
    diagnostics.authGateway.reachable = res.ok;

    if (!res.ok) {
      const errText = await res.text();
      diagnostics.authGateway.error = errText.slice(0, 150);
    }
  } catch (err: any) {
    diagnostics.authGateway.error = err?.message || 'Network error reaching Supabase Auth';
  }

  // 2. Test PostgREST Database Connectivity
  try {
    const client = createSupabaseClient(config.url, config.anonKey);
    const { status, error } = await client.from('users').select('id').limit(1);
    diagnostics.database.status = status;
    diagnostics.database.reachable = status === 200 || status === 406;
    if (error && status !== 200) {
      diagnostics.database.error = error.message;
    }
  } catch (err: any) {
    diagnostics.database.error = err?.message || 'Error executing PostgREST query';
  }

  if (diagnostics.authGateway.reachable && diagnostics.database.reachable) {
    diagnostics.status = 'HEALTHY';
  } else if (diagnostics.authGateway.reachable || diagnostics.database.reachable) {
    diagnostics.status = 'DEGRADED';
    diagnostics.remediation =
      'Partial connectivity: Auth gateway or database returned an error. Verify your table RLS policies and API keys.';
  } else {
    diagnostics.status = 'DEGRADED';
    diagnostics.remediation =
      'Cannot connect to Supabase. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY match your Supabase Dashboard settings.';
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.status === 'HEALTHY' ? 200 : 503,
  });
}
