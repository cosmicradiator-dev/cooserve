import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError } from '@/lib/http/errors';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'placeholder-anon-key';

    if (
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project') ||
      !supabaseAnonKey ||
      supabaseAnonKey.includes('placeholder') ||
      supabaseAnonKey.includes('your-anon')
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'API_KEY_CONFIG_ERROR',
            message:
              'Supabase API key is missing or not configured. Please add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY to local-services-marketplace/.env and restart your dev server.',
          },
        },
        { status: 500 }
      );
    }

    // Authenticate with Supabase Auth (verifies bcrypt hashed password on Supabase server)
    const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      const status = authError?.status || 401;
      let message = authError?.message || 'Invalid email or password';
      if (authError?.message?.toLowerCase().includes('email not confirmed')) {
        message = 'Email address has not been confirmed yet. Please verify your email or disable confirmation in Supabase settings.';
      }
      return NextResponse.json(
        {
          error: {
            code: authError?.code || 'INVALID_CREDENTIALS',
            message,
          },
        },
        { status }
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
