import { NextRequest } from 'next/server';
import { signupSchema } from '@/lib/validation/signupSchema';
import { userService } from '@/lib/services/userService';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError } from '@/lib/http/errors';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // In local dev/testing without active Supabase Auth daemon, generate synthetic auth UUID
    const authUserId = crypto.randomUUID();

    const user = await userService.registerUser(authUserId, validated);

    return apiSuccess(
      {
        user,
        message: 'Account registered successfully',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

