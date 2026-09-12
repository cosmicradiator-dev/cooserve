import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation/signupSchema';
import { userService } from '@/lib/services/userService';
import { handleApiError } from '@/lib/http/errors';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

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
              'Supabase API key is missing or not configured. Please add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to local-services-marketplace/.env and restart your dev server.',
          },
        },
        { status: 500 }
      );
    }

    const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // 1. Create User in Supabase Auth (stores password encrypted with bcrypt in auth.users)
    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          role: validated.role,
          full_name: validated.fullName,
          username: validated.username,
          phone: validated.phone,
          address: validated.address,
          skill_type: validated.skillType,
          experience_years: validated.experienceYears,
        },
      },
    });

    if (authError || !authData.user) {
      const isRateLimit =
        authError?.code === 'over_email_send_rate_limit' ||
        authError?.message?.toLowerCase().includes('rate limit');

      let message = authError?.message || 'Failed to create user account with Supabase Auth';
      if (isRateLimit) {
        message = 'Supabase email rate limit reached on free tier. In Supabase Dashboard > Authentication > Providers > Email, turn OFF "Confirm email" for instant registration.';
      } else if (authError?.message?.toLowerCase().includes('api key') || authError?.status === 401) {
        message = 'Supabase API key error. Please verify NEXT_PUBLIC_SUPABASE_ANON_KEY in local-services-marketplace/.env matches your Supabase Project Settings > API anon key, then restart your dev server.';
      }

      return NextResponse.json(
        {
          error: {
            code: authError?.code || 'SIGNUP_ERROR',
            message,
          },
        },
        { status: authError?.status || 400 }
      );
    }

    const authUserId = authData.user.id;

    // 2. Ensure user profile in public.users is registered
    let user;
    try {
      user = await userService.registerUser(authUserId, validated);
    } catch (profileErr: any) {
      // If profile already created by database trigger handle_new_user, or if RLS prevented direct upsert without service key
      if (
        profileErr?.message?.includes('already') ||
        profileErr?.message?.includes('unique') ||
        profileErr?.message?.includes('duplicate') ||
        profileErr?.message?.includes('row-level security') ||
        profileErr?.code === '23505' ||
        profileErr?.code === '42501'
      ) {
        user = {
          id: authUserId,
          role: validated.role,
          full_name: validated.fullName,
          username: validated.username,
          phone: validated.phone,
          address: validated.address,
        };
      } else {
        throw profileErr;
      }
    }

    const redirectUrl = validated.role === 'worker' ? '/worker/dashboard' : '/customer/request';

    const response = NextResponse.json(
      {
        data: {
          user,
          session: authData.session,
          redirectUrl,
          message: 'Account registered and secured in Supabase successfully',
        },
      },
      { status: 201 }
    );

    // Set authorization cookies
    response.cookies.set('coop_user_role', validated.role, {
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
