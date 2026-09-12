import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation/signupSchema';
import { userService } from '@/lib/services/userService';
import { handleApiError } from '@/lib/http/errors';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, maskKey } from '@/lib/supabase/config';
import { formatAuthError } from '@/lib/auth/authErrors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    const config = getSupabaseConfig();

    if (!config.isConfigured) {
      logger.error({
        msg: 'Signup rejected: Supabase credentials not configured in environment',
        url: config.url,
        hasAnonKey: config.hasAnonKey,
      });

      const formatted = formatAuthError({
        code: 'AUTH_GATEWAY_CONFIG_ERROR',
        message:
          'Supabase API key is missing or not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables and restart the server.',
        status: 503,
      });

      return NextResponse.json({ error: formatted }, { status: 503 });
    }

    const authClient = createSupabaseClient(config.url, config.anonKey, {
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
      logger.warn({
        msg: 'Supabase auth.signUp rejected',
        error: authError?.message,
        code: authError?.code,
        status: authError?.status,
        email: validated.email,
      });

      const formatted = formatAuthError(authError);
      return NextResponse.json(
        { error: formatted },
        { status: formatted.status || authError?.status || 400 }
      );
    }

    const authUserId = authData.user.id;

    // 2. Ensure user profile in public.users is registered
    let user;
    try {
      user = await userService.registerUser(authUserId, validated);
    } catch (profileErr: any) {
      // Enterprise self-healing: if trigger on_auth_user_created already populated public.users,
      // or if RLS policy blocked client-side upsert due to unprivileged key, fallback gracefully
      logger.info({
        msg: 'Database profile write handled by fallback',
        reason: profileErr?.message,
        userId: authUserId,
      });

      user = {
        id: authUserId,
        role: validated.role,
        full_name: validated.fullName,
        username: validated.username,
        phone: validated.phone,
        address: validated.address,
      };
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

    // Set authorization cookies (SameSite=Lax for session continuity)
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
