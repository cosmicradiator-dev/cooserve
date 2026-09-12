import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepository } from '@/lib/repositories/userRepository';
import { handleApiError } from '@/lib/http/errors';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { formatAuthError } from '@/lib/auth/authErrors';
import { logger } from '@/lib/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const config = getSupabaseConfig();

    if (!config.isConfigured) {
      const formatted = formatAuthError({
        code: 'AUTH_GATEWAY_CONFIG_ERROR',
        message:
          'Supabase API key is missing or not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables and restart the server.',
        status: 503,
      });
      return NextResponse.json({ error: formatted }, { status: 503 });
    }

    // Authenticate with Supabase Auth (verifies bcrypt hashed password on Supabase server)
    const authClient = createSupabaseClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.warn({
        msg: 'Sign in failed',
        email,
        error: authError?.message,
        code: authError?.code,
      });

      const formatted = formatAuthError(authError);
      return NextResponse.json(
        { error: formatted },
        { status: formatted.status || authError?.status || 401 }
      );
    }

    const authUserId = authData.user.id;
    let role = authData.user.user_metadata?.role as string | undefined;

    // Look up profile in public.users to get the confirmed database role
    try {
      const profile = await userRepository.findById(authUserId);
      if (profile && profile.role) {
        role = profile.role;
      }
    } catch {
      // Fallback to metadata role if profile lookup fails
    }

    if (!role) {
      role = 'customer';
    }

    let redirectUrl = '/customer/request';
    if (role === 'worker') {
      redirectUrl = '/worker/dashboard';
    } else if (role === 'admin') {
      redirectUrl = '/admin/dashboard';
    }

    const response = NextResponse.json({
      data: {
        user: {
          id: authUserId,
          email: authData.user.email,
          role,
        },
        session: authData.session,
        redirectUrl,
        message: 'Authentication successful',
      },
    });

    // Set authorization cookies (SameSite=Lax for standard session retention)
    response.cookies.set('coop_user_role', role, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: false,
    });

    response.cookies.set('coop_user_id', authUserId, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
