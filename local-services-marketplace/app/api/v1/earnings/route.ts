import { NextRequest } from 'next/server';
import { workerService } from '@/lib/services/workerService';
import { getSessionFromRequest } from '@/lib/auth/sessionHelper';
import { apiSuccess } from '@/lib/http/apiResponse';
import { handleApiError, AuthenticationRequiredError } from '@/lib/http/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const earnings = await workerService.getEarnings(session);
    return apiSuccess({ earnings });
  } catch (error) {
    return handleApiError(error);
  }
}

